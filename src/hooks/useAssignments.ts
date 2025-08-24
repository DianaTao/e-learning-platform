import { useCallback, useMemo } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import apiClient from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import type { Assignment, AssignmentStatus, AssignmentFilters, PaginatedResponse } from '@/types';

/**
 * Hook for assignment management operations
 */
export function useAssignments(filters?: AssignmentFilters) {
  const { addToast } = useAppStore();

  // Fetch assignments with pagination and filtering
  const {
    data: assignments,
    loading,
    error,
    hasNext,
    total,
    page,
    loadMore,
    execute: fetchAssignments,
    refresh: refreshAssignments,
    reset: resetAssignments
  } = usePaginatedApi(
    async (page: number, pageSize: number, assignmentFilters?: AssignmentFilters) => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(assignmentFilters?.courseId && { courseId: assignmentFilters.courseId }),
        ...(assignmentFilters?.status && assignmentFilters.status !== 'all' && { status: assignmentFilters.status }),
        ...(assignmentFilters?.dueFrom && { dueFrom: assignmentFilters.dueFrom }),
        ...(assignmentFilters?.dueTo && { dueTo: assignmentFilters.dueTo }),
        ...(assignmentFilters?.sort && { sort: assignmentFilters.sort }),
        ...(assignmentFilters?.order && { order: assignmentFilters.order })
      });

      const response = await apiClient.get(`/assignments?${params.toString()}`);
      return response as PaginatedResponse<Assignment>;
    },
    25, // page size
    {
      immediate: false, // Disabled for development - using mock data from store
      cacheTime: 3 * 60 * 1000, // 3 minutes (assignments change frequently)
      onError: () => {
        addToast({
          type: 'error',
          message: 'Failed to load assignments. Please try again.',
          duration: 5000
        });
      }
    }
  );

  // Fetch single assignment details
  const {
    data: selectedAssignment,
    loading: loadingAssignment,
    error: assignmentError,
    execute: fetchAssignment,
    setData: setSelectedAssignment,
    reset: resetSelectedAssignment
  } = useApi(
    async (assignmentId: string) => {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response as Assignment;
    },
    {
      immediate: false,
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Update assignment status mutation
  const updateStatusMutation = useMutation(
    async (data: { assignmentId: string; status: AssignmentStatus; submissionNote?: string }) => {
      const response = await apiClient.patch(`/assignments/${data.assignmentId}`, {
        status: data.status,
        submissionNote: data.submissionNote,
        submittedAt: data.status === 'submitted' ? new Date().toISOString() : undefined
      });
      return response as Assignment;
    },
    {
      optimisticUpdate: (data) => {
        const assignment = assignments?.find(a => a.id === data.assignmentId);
        if (assignment) {
          return {
            ...assignment,
            status: data.status,
            submittedAt: data.status === 'submitted' ? new Date().toISOString() : assignment.submittedAt
          };
        }
        return data;
      },
      onSuccess: (updatedAssignment) => {
        // Update selected assignment if it matches
        if (selectedAssignment && selectedAssignment.id === updatedAssignment.id) {
          setSelectedAssignment(updatedAssignment);
        }

        const statusMessages = {
          'in_progress': 'Assignment marked as in progress',
          'submitted': 'Assignment submitted successfully!',
          'not_started': 'Assignment status reset'
        };

        addToast({
          type: updatedAssignment.status === 'submitted' ? 'success' : 'info',
          message: statusMessages[updatedAssignment.status as keyof typeof statusMessages] || 'Assignment updated',
          duration: 3000
        });
      }
    }
  );

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation(
    async (data: { assignmentId: string; content?: string; files?: File[] }) => {
      // If files are provided, upload them first
      let fileIds: string[] = [];
      
      if (data.files && data.files.length > 0) {
        const uploadPromises = data.files.map(async (file) => {
          const uploadResponse = await apiClient.post('/uploads', {
            mimeType: file.type,
            purpose: 'assignment_submission'
          });
          
          // Upload file to pre-signed URL
          await fetch(uploadResponse.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });
          
          return uploadResponse.fileId;
        });
        
        fileIds = await Promise.all(uploadPromises);
      }

      const response = await apiClient.post(`/assignments/${data.assignmentId}/submissions`, {
        content: data.content,
        fileIds
      });
      
      return response as Assignment;
    },
    {
      onSuccess: (updatedAssignment) => {
        setSelectedAssignment(updatedAssignment);
        refreshAssignments(); // Refresh list to show updated status
        
        addToast({
          type: 'success',
          message: 'Assignment submitted successfully!',
          duration: 3000
        });
      }
    }
  );

  // Bulk update assignments mutation
  const bulkUpdateMutation = useMutation(
    async (data: { assignmentIds: string[]; action: 'markComplete' | 'markIncomplete' | 'export' }) => {
      if (data.action === 'export') {
        // For export, generate and download CSV
        const response = await apiClient.get(`/assignments/export?ids=${data.assignmentIds.join(',')}`);
        
        // Create download link
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `assignments_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return data.assignmentIds;
      } else {
        // For status updates
        const newStatus = data.action === 'markComplete' ? 'submitted' : 'not_started';
        
        const response = await apiClient.post('/assignments/bulk', {
          action: data.action,
          assignmentIds: data.assignmentIds,
          status: newStatus
        });
        
        return response as Assignment[];
      }
    },
    {
      onSuccess: (result, data) => {
        refreshAssignments(); // Refresh the list
        
        const messages = {
          'markComplete': `${data.assignmentIds.length} assignments marked as complete`,
          'markIncomplete': `${data.assignmentIds.length} assignments marked as incomplete`,
          'export': `Exported ${data.assignmentIds.length} assignments to CSV`
        };

        addToast({
          type: 'success',
          message: messages[data.action],
          duration: 3000
        });
      }
    }
  );

  // Delete assignment mutation (if user has permission)
  const deleteAssignmentMutation = useMutation(
    async (assignmentId: string) => {
      await apiClient.delete(`/assignments/${assignmentId}`);
      return assignmentId;
    },
    {
      onSuccess: (deletedId) => {
        refreshAssignments(); // Refresh the list
        
        // Clear selected assignment if it was deleted
        if (selectedAssignment && selectedAssignment.id === deletedId) {
          resetSelectedAssignment();
        }

        addToast({
          type: 'success',
          message: 'Assignment deleted successfully',
          duration: 3000
        });
      }
    }
  );

  // Search assignments
  const searchAssignments = useCallback(async (query: string) => {
    const searchFilters: AssignmentFilters = { 
      ...filters, 
      // Add text search across title, description, and course name
      query 
    };
    resetAssignments();
    return fetchAssignments(searchFilters);
  }, [filters, fetchAssignments, resetAssignments]);

  // Filter assignments
  const filterAssignments = useCallback(async (newFilters: AssignmentFilters) => {
    resetAssignments(); // Reset pagination
    return fetchAssignments(newFilters);
  }, [fetchAssignments, resetAssignments]);

  // Get assignment by ID from loaded assignments
  const getAssignmentById = useCallback((assignmentId: string): Assignment | undefined => {
    return assignments?.find(assignment => assignment.id === assignmentId);
  }, [assignments]);

  // Get assignment statistics
  const assignmentStats = useMemo(() => {
    if (!assignments) return null;

    const now = new Date();
    
    const byStatus = {
      not_started: assignments.filter(a => a.status === 'not_started').length,
      in_progress: assignments.filter(a => a.status === 'in_progress').length,
      submitted: assignments.filter(a => a.status === 'submitted').length,
      graded: assignments.filter(a => a.status === 'graded').length
    };

    const overdue = assignments.filter(a => 
      new Date(a.dueDate) < now && 
      (a.status === 'not_started' || a.status === 'in_progress')
    ).length;

    const dueToday = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate.toDateString() === now.toDateString() &&
             (a.status === 'not_started' || a.status === 'in_progress');
    }).length;

    const dueThisWeek = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      return dueDate > now && dueDate <= weekFromNow &&
             (a.status === 'not_started' || a.status === 'in_progress');
    }).length;

    const averageGrade = assignments
      .filter(a => a.status === 'graded' && a.grade !== undefined)
      .reduce((sum, a, _, arr) => sum + (a.grade! / arr.length), 0);

    const totalPoints = assignments.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = assignments
      .filter(a => a.status === 'graded' && a.grade !== undefined)
      .reduce((sum, a) => sum + ((a.grade! / 100) * a.points), 0);

    return {
      total: assignments.length,
      byStatus,
      overdue,
      dueToday,
      dueThisWeek,
      averageGrade: Math.round(averageGrade * 10) / 10,
      totalPoints,
      earnedPoints: Math.round(earnedPoints * 10) / 10,
      completionRate: assignments.length > 0 ? 
        Math.round(((byStatus.submitted + byStatus.graded) / assignments.length) * 100) : 0
    };
  }, [assignments]);

  // Get assignments by course
  const getAssignmentsByCourse = useCallback((courseId: string): Assignment[] => {
    if (!assignments) return [];
    return assignments.filter(assignment => assignment.courseId === courseId);
  }, [assignments]);

  // Get upcoming assignments (due in next 7 days)
  const upcomingAssignments = useMemo(() => {
    if (!assignments) return [];
    
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return assignments
      .filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        return dueDate > now && 
               dueDate <= weekFromNow &&
               (assignment.status === 'not_started' || assignment.status === 'in_progress');
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  // Convenient action functions
  const updateStatus = useCallback((assignmentId: string, status: AssignmentStatus, submissionNote?: string) => {
    return updateStatusMutation.mutate({ assignmentId, status, submissionNote });
  }, [updateStatusMutation.mutate]);

  const submitAssignment = useCallback((assignmentId: string, submission: { content?: string; files?: File[] }) => {
    return submitAssignmentMutation.mutate({ assignmentId, ...submission });
  }, [submitAssignmentMutation.mutate]);

  const bulkUpdate = useCallback((assignmentIds: string[], action: 'markComplete' | 'markIncomplete' | 'export') => {
    return bulkUpdateMutation.mutate({ assignmentIds, action });
  }, [bulkUpdateMutation.mutate]);

  const deleteAssignment = useCallback((assignmentId: string) => {
    return deleteAssignmentMutation.mutate(assignmentId);
  }, [deleteAssignmentMutation.mutate]);

  const selectAssignment = useCallback((assignmentId: string) => {
    return fetchAssignment(assignmentId);
  }, [fetchAssignment]);

  return {
    // Data
    assignments: assignments || [],
    selectedAssignment,
    assignmentStats,
    upcomingAssignments,
    
    // Loading states
    loading,
    loadingAssignment,
    isUpdatingStatus: updateStatusMutation.loading,
    isSubmitting: submitAssignmentMutation.loading,
    isBulkUpdating: bulkUpdateMutation.loading,
    isDeleting: deleteAssignmentMutation.loading,
    
    // Error states
    error,
    assignmentError,
    updateError: updateStatusMutation.error,
    submitError: submitAssignmentMutation.error,
    bulkUpdateError: bulkUpdateMutation.error,
    deleteError: deleteAssignmentMutation.error,
    
    // Pagination
    hasNext,
    total,
    page,
    loadMore,
    
    // Optimistic states
    isOptimisticUpdate: updateStatusMutation.isOptimistic,
    
    // Actions
    fetchAssignments,
    refreshAssignments,
    resetAssignments,
    selectAssignment,
    resetSelectedAssignment,
    searchAssignments,
    filterAssignments,
    updateStatus,
    submitAssignment,
    bulkUpdate,
    deleteAssignment,
    
    // Utility functions
    getAssignmentById,
    getAssignmentsByCourse,
    
    // Raw mutations for advanced usage
    updateStatusMutation,
    submitAssignmentMutation,
    bulkUpdateMutation,
    deleteAssignmentMutation
  };
}
