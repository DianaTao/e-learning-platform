import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import type { Assignment } from '@/types';

interface AssignmentDetailModalProps {
  assignment: Assignment;
  onClose: () => void;
  onSubmit: (submission: { content?: string; files?: File[] }) => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  onClose,
  onSubmit
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'submission' | 'feedback'>('details');
  const [submissionContent, setSubmissionContent] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Focus management and keyboard navigation
  useEffect(() => {
    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Tab') {
        // Trap focus within modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Tab navigation
  const tabs = [
    { key: 'details' as const, label: 'Details' },
    { key: 'submission' as const, label: 'Submission' },
    { key: 'feedback' as const, label: 'Feedback' }
  ];

  const handleTabKeyDown = (event: React.KeyboardEvent, tabKey: typeof activeTab) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveTab(tabKey);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const currentIndex = tabs.findIndex(tab => tab.key === activeTab);
      let nextIndex;
      
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else {
        nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      }
      
      setActiveTab(tabs[nextIndex].key);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const submission: { content?: string; files?: File[] } = {};
    
    if (submissionContent.trim()) {
      submission.content = submissionContent;
    }
    
    if (uploadedFiles.length > 0) {
      submission.files = uploadedFiles;
    }

    onSubmit(submission);
  };

  const canSubmit = assignment.status === 'not_started' || assignment.status === 'in_progress';
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'submitted' && assignment.status !== 'graded';

  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'not_started':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'submitted':
        return <Upload className="w-5 h-5 text-yellow-500" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        ref={modalRef}
        className="modal-content max-w-4xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">{assignment.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.courseName}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        {isOverdue && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  This assignment is overdue. Please submit as soon as possible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy h:mm a')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 mr-2" />
              <span>Points: {assignment.points}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 mr-2" />
              <span>Type: {assignment.submissionType}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" role="tablist" aria-label="Assignment details">
            <button
              onClick={() => setActiveTab('details')}
              onKeyDown={(e) => handleTabKeyDown(e, 'details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === 'details'}
              aria-controls="details-panel"
              tabIndex={activeTab === 'details' ? 0 : -1}
            >
              Assignment Details
            </button>
            <button
              onClick={() => setActiveTab('submission')}
              onKeyDown={(e) => handleTabKeyDown(e, 'submission')}
              className={`py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                activeTab === 'submission'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === 'submission'}
              aria-controls="submission-panel"
              tabIndex={activeTab === 'submission' ? 0 : -1}
            >
              Submission
            </button>
            {assignment.feedback && (
              <button
                onClick={() => setActiveTab('feedback')}
                onKeyDown={(e) => handleTabKeyDown(e, 'feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  activeTab === 'feedback'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 'feedback'}
                aria-controls="feedback-panel"
                tabIndex={activeTab === 'feedback' ? 0 : -1}
              >
                Feedback & Grade
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{assignment.description}</p>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Instructions</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Requirements</h3>
                <div className="space-y-2">
                  {assignment.allowedFileTypes && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Allowed file types: {assignment.allowedFileTypes.join(', ')}</span>
                    </div>
                  )}
                  {assignment.maxFileSize && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Upload className="w-4 h-4 mr-2" />
                      <span>Maximum file size: {assignment.maxFileSize} MB</span>
                    </div>
                  )}
                  {assignment.maxAttempts && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span>Maximum attempts: {assignment.maxAttempts}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Resources */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Related Resources</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center text-primary-600 hover:text-primary-700 text-sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Course Materials
                  </a>
                  <a href="#" className="flex items-center text-primary-600 hover:text-primary-700 text-sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Reference Documentation
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submission' && (
            <div className="space-y-6">
              {/* Previous Submissions */}
              {assignment.submissions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Previous Submissions</h3>
                  <div className="space-y-3">
                    {assignment.submissions.map((submission, index) => (
                      <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Attempt {submission.attempt}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(submission.submittedAt), 'MMM dd, yyyy h:mm a')}
                          </span>
                        </div>
                        {submission.content && (
                          <p className="text-sm text-gray-700 mb-2">{submission.content}</p>
                        )}
                        {submission.files.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {submission.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center text-sm text-gray-600">
                                <FileText className="w-4 h-4 mr-1" />
                                <span>{file.originalName}</span>
                                <button className="ml-2 text-primary-600 hover:text-primary-700">
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Submission */}
              {canSubmit && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">New Submission</h3>
                  
                  {assignment.submissionType === 'text' || assignment.submissionType === 'multiple' ? (
                    <div className="mb-4">
                      <label className="label">Written Response</label>
                      <textarea
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        className="input h-32 resize-none"
                        placeholder="Enter your response here..."
                      />
                    </div>
                  ) : null}

                  {assignment.submissionType === 'file' || assignment.submissionType === 'multiple' ? (
                    <div className="mb-4">
                      <label className="label">File Upload</label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Drag and drop files here, or{' '}
                          <label className="text-primary-600 cursor-pointer hover:text-primary-700">
                            browse
                            <input
                              type="file"
                              multiple
                              onChange={handleFileInput}
                              className="hidden"
                              accept={assignment.allowedFileTypes?.join(',')}
                            />
                          </label>
                        </p>
                        <p className="text-sm text-gray-500">
                          {assignment.allowedFileTypes && (
                            <>Accepted file types: {assignment.allowedFileTypes.join(', ')}</>
                          )}
                          {assignment.maxFileSize && (
                            <> • Max size: {assignment.maxFileSize}MB</>
                          )}
                        </p>
                      </div>

                      {/* Uploaded Files */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Uploaded Files</h4>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">{file.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </div>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {assignment.submissionType === 'url' ? (
                    <div className="mb-4">
                      <label className="label">URL Submission</label>
                      <input
                        type="url"
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {!canSubmit && assignment.status === 'submitted' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Submitted</h3>
                  <p className="text-gray-600">
                    Your assignment has been submitted and is awaiting grading.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && assignment.feedback && (
            <div className="space-y-6">
              {/* Grade */}
              {assignment.grade && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-green-900">Grade</h3>
                      <p className="text-2xl font-bold text-green-700">
                        {assignment.grade.score}/{assignment.grade.maxScore}
                      </p>
                      <p className="text-sm text-green-600">
                        {assignment.grade.percentage}%
                        {assignment.grade.letterGrade && ` (${assignment.grade.letterGrade})`}
                      </p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>
              )}

              {/* Feedback Comments */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Instructor Feedback</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Provided on {format(new Date(assignment.feedback.providedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {assignment.feedback.comments}
                  </p>
                </div>
              </div>

              {/* View Rubric Button */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Assignment Rubric</h3>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Criteria</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Max</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percent</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {(assignment.feedback.rubricScores && assignment.feedback.rubricScores.length > 0
                        ? assignment.feedback.rubricScores
                        : [
                            { criteria: 'Clarity', score: 4, maxScore: 5 },
                            { criteria: 'Completeness', score: 9, maxScore: 10 },
                            { criteria: 'Quality', score: 18, maxScore: 20 },
                            { criteria: 'Originality', score: 9, maxScore: 10 },
                          ]
                        ).map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.criteria}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.score}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.maxScore}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{Math.round((row.score / row.maxScore) * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Close
          </button>
          
          {canSubmit && activeTab === 'submission' && (
            <button
              onClick={handleSubmit}
              disabled={!submissionContent.trim() && uploadedFiles.length === 0}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
