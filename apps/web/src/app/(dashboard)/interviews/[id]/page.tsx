'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionDisplay } from '@/components/interview/QuestionDisplay';
import { AnswerInput } from '@/components/interview/AnswerInput';
import { Timer } from '@/components/interview/Timer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const {
    interview,
    isLoading,
    startInterview,
    completeInterview,
    submitAnswer,
    getAISuggestion,
    isSubmittingAnswer,
    aiSuggestion,
    isLoadingAISuggestion,
  } = useInterview(interviewId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (interview?.status === 'in-progress') {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [interview?.status]);

  const currentQuestion = interview?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (interview?.questions?.length || 0) - 1;
  const canGoNext = currentQuestionIndex < (interview?.questions?.length || 0) - 1;
  const canGoPrev = currentQuestionIndex > 0;

  const handleStart = () => {
    startInterview(interviewId);
  };

  const handleComplete = () => {
    completeInterview(interviewId, {
      onSuccess: () => {
        router.push(`/interviews/${interviewId}/results`);
      },
    });
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!currentQuestion) return;

    submitAnswer({
      interviewId,
      questionId: currentQuestion.id,
      answer,
    });

    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 500);
    }
  };

  const handleRequestSuggestion = () => {
    if (!currentQuestion) return;

    getAISuggestion({
      interviewId,
      questionId: currentQuestion.id,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!interview) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Interview not found</AlertDescription>
      </Alert>
    );
  }

  if (interview.status === 'scheduled') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ready to Start?</h1>
          <p className="mt-2 text-muted-foreground">
            This {interview.type} interview has {interview.questions?.length || 0} questions
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8">
          <h3 className="mb-4 text-xl font-semibold">Interview Details</h3>
          <div className="space-y-2 text-left">
            <p>
              <span className="font-medium">Type:</span> {interview.type}
            </p>
            <p>
              <span className="font-medium">Difficulty:</span> {interview.difficulty}
            </p>
            {interview.industry && (
              <p>
                <span className="font-medium">Industry:</span> {interview.industry}
              </p>
            )}
            <p>
              <span className="font-medium">Questions:</span> {interview.questions?.length || 0}
            </p>
          </div>
        </div>
        <Button size="lg" onClick={handleStart}>
          <Play className="mr-2 h-4 w-4" />
          Start Interview
        </Button>
      </div>
    );
  }

  if (interview.status === 'completed') {
    router.push(`/interviews/${interviewId}/results`);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {interview.questions?.length || 0}
          </h1>
          <p className="text-muted-foreground">{interview.type} Interview</p>
        </div>
        <div className="flex items-center space-x-4">
          <Timer
            startTime={interview.startedAt || new Date()}
            isRunning={interview.status === 'in-progress'}
          />
          <Button variant="destructive" size="sm" onClick={handleComplete}>
            <Square className="mr-2 h-4 w-4" />
            End Interview
          </Button>
        </div>
      </div>

      {currentQuestion && (
        <>
          <QuestionDisplay
            question={currentQuestion.question}
            type={interview.type}
            difficulty={interview.difficulty}
            timeElapsed={timeElapsed}
          />

          <AnswerInput
            onSubmit={handleSubmitAnswer}
            onRequestSuggestion={handleRequestSuggestion}
            isSubmitting={isSubmittingAnswer}
            isLoadingSuggestion={isLoadingAISuggestion}
            suggestion={aiSuggestion?.suggestion}
          />
        </>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
