'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedbackPanel } from '@/components/interview/FeedbackPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  const { interview, isLoading } = useInterview(interviewId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!interview || interview.status !== 'completed') {
    router.push(`/interviews/${interviewId}`);
    return null;
  }

  const feedbackItems = [
    {
      aspect: 'Communication',
      score: 85,
      feedback: 'Clear and concise communication with good structure',
      type: 'positive' as const,
    },
    {
      aspect: 'Technical Knowledge',
      score: 75,
      feedback: 'Good understanding of core concepts, could improve on advanced topics',
      type: 'neutral' as const,
    },
    {
      aspect: 'Problem Solving',
      score: 90,
      feedback: 'Excellent analytical approach and solution methodology',
      type: 'positive' as const,
    },
    {
      aspect: 'Response Time',
      score: 70,
      feedback: 'Some answers took longer than expected',
      type: 'negative' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/interviews">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
            <p className="text-muted-foreground">
              {interview.type} • {interview.difficulty}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Questions Answered</p>
              <p className="text-2xl font-bold">{interview.questions?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold">
                {interview.duration ? Math.round(interview.duration / 60) : 0} min
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="mt-1">{interview.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeedbackPanel
        score={interview.score || 0}
        feedback={
          interview.feedback ||
          'Great job! You demonstrated strong interview skills and provided thoughtful answers. Continue practicing to further improve your performance.'
        }
        items={feedbackItems}
      />

      <Card>
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interview.questions?.map((question, index) => (
            <div key={question.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">Q{index + 1}</Badge>
                    {question.score !== undefined && (
                      <Badge variant="secondary">{question.score}%</Badge>
                    )}
                  </div>
                  <p className="font-medium">{question.question}</p>
                </div>
              </div>
              {question.answer && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Your Answer:</p>
                  <p className="text-sm">{question.answer}</p>
                </div>
              )}
              {question.feedback && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Feedback:</p>
                  <p className="text-sm">{question.feedback}</p>
                </div>
              )}
              {question.aiSuggestion && (
                <div className="rounded-md bg-primary/5 p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Suggested Improvement:
                  </p>
                  <p className="text-sm">{question.aiSuggestion}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Link href="/interviews/new">
          <Button>Start Another Interview</Button>
        </Link>
        <Link href="/analytics">
          <Button variant="outline">View Analytics</Button>
        </Link>
      </div>
    </div>
  );
}
