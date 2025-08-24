// Base API hooks
export { useApi, usePaginatedApi, useMutation } from './useApi';

// Domain-specific hooks
export { useAuth } from './useAuth';
export { useCourses } from './useCourses';
export { useAssignments } from './useAssignments';
export { useAnalytics } from './useAnalytics';

// Note: Types are inferred from the hook functions, no need to explicitly export them
