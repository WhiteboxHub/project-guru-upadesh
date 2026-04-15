import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookmarkPlus, Eye } from 'lucide-react';
import { Question } from '@/services/question.service';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
}

export function QuestionCard({ question, onView, onSave }: QuestionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{question.type}</Badge>
              <Badge className={cn('border', getDifficultyColor(question.difficulty))}>
                {question.difficulty}
              </Badge>
              <Badge variant="secondary">{question.category}</Badge>
              {question.company && (
                <Badge variant="outline">{question.company}</Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            {onSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSave(question.id)}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{question.question}</p>

        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {onView && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onView(question.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
