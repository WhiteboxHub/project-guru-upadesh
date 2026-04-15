'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, Send, Sparkles } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  onRequestSuggestion?: () => void;
  isSubmitting?: boolean;
  isLoadingSuggestion?: boolean;
  suggestion?: string;
}

export function AnswerInput({
  onSubmit,
  onRequestSuggestion,
  isSubmitting,
  isLoadingSuggestion,
  suggestion,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Answer</CardTitle>
          <div className="flex items-center space-x-2">
            {onRequestSuggestion && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestSuggestion}
                disabled={isLoadingSuggestion}
              >
                {isLoadingSuggestion ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI Suggestion
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestion && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Suggestion</span>
            </div>
            <p className="text-sm text-muted-foreground">{suggestion}</p>
          </div>
        )}

        <Textarea
          placeholder="Type your answer here... (Ctrl/Cmd + Enter to submit)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] resize-none"
        />

        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {answer.length} characters
          </p>
          <Button onClick={handleSubmit} disabled={!answer.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
