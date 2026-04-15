'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface FeedbackItem {
  aspect: string;
  score: number;
  feedback: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface FeedbackPanelProps {
  score: number;
  feedback: string;
  items?: FeedbackItem[];
}

export function FeedbackPanel({ score, feedback, items }: FeedbackPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIcon = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'negative':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Feedback</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Overall Score:</span>
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
        </div>
        <Progress value={score} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Overall Feedback</h4>
          <p className="text-sm text-muted-foreground">{feedback}</p>
        </div>

        {items && items.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Detailed Assessment</h4>
            {items.map((item, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getIcon(item.type)}
                    <span className="font-medium">{item.aspect}</span>
                  </div>
                  <Badge variant="outline">{item.score}%</Badge>
                </div>
                <Progress value={item.score} className="h-2" />
                <p className="text-sm text-muted-foreground">{item.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
