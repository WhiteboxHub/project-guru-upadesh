'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface QuestionDisplayProps {
  question: string;
  type: string;
  difficulty: string;
  timeElapsed?: number;
}

export function QuestionDisplay({
  question,
  type,
  difficulty,
  timeElapsed,
}: QuestionDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{type}</Badge>
            <Badge
              variant={
                difficulty === 'easy'
                  ? 'default'
                  : difficulty === 'medium'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {difficulty}
            </Badge>
          </div>
          {timeElapsed !== undefined && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg leading-relaxed">{question}</CardTitle>
      </CardContent>
    </Card>
  );
}
