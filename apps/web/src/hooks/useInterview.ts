import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewService, CreateInterviewDto, UpdateInterviewDto } from '@/services/interview.service';
import { useToast } from '@/components/ui/use-toast';

export function useInterview(interviewId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => interviewService.getInterview(interviewId!),
    enabled: !!interviewId,
  });

  const { data: interviews, isLoading: isLoadingList } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewService.getInterviews(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewDto) => interviewService.createInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: 'Success',
        description: 'Interview created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create interview',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewDto }) =>
      interviewService.updateInterview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update interview',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => interviewService.deleteInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: 'Success',
        description: 'Interview deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete interview',
        variant: 'destructive',
      });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => interviewService.startInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      toast({
        title: 'Success',
        description: 'Interview started',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start interview',
        variant: 'destructive',
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => interviewService.completeInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: 'Success',
        description: 'Interview completed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete interview',
        variant: 'destructive',
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: ({
      interviewId,
      questionId,
      answer,
    }: {
      interviewId: string;
      questionId: string;
      answer: string;
    }) => interviewService.submitAnswer(interviewId, questionId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit answer',
        variant: 'destructive',
      });
    },
  });

  const getAISuggestionMutation = useMutation({
    mutationFn: ({
      interviewId,
      questionId,
      context,
    }: {
      interviewId: string;
      questionId: string;
      context?: string;
    }) => interviewService.getAISuggestion(interviewId, questionId, context),
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI suggestion',
        variant: 'destructive',
      });
    },
  });

  return {
    interview: interview?.data,
    interviews: interviews?.data,
    isLoading,
    isLoadingList,
    createInterview: createMutation.mutate,
    updateInterview: updateMutation.mutate,
    deleteInterview: deleteMutation.mutate,
    startInterview: startMutation.mutate,
    completeInterview: completeMutation.mutate,
    submitAnswer: submitAnswerMutation.mutate,
    getAISuggestion: getAISuggestionMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    isSubmittingAnswer: submitAnswerMutation.isPending,
    aiSuggestion: getAISuggestionMutation.data,
    isLoadingAISuggestion: getAISuggestionMutation.isPending,
  };
}
