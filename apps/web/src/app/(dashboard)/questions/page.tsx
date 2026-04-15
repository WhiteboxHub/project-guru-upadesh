'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionService } from '@/services/question.service';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { QuestionFilters } from '@/components/questions/QuestionFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle } from 'lucide-react';

export default function QuestionsPage() {
  const [filters, setFilters] = useState({});

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getQuestions(filters),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['question-categories'],
    queryFn: () => questionService.getCategories(),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['question-companies'],
    queryFn: () => questionService.getCompanies(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
        <p className="text-muted-foreground">
          Browse and practice with our comprehensive collection of interview questions
        </p>
      </div>

      <QuestionFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categoriesData?.data || []}
        companies={companiesData?.data || []}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      ) : questions && questions.data.length > 0 ? (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {questions.data.length} of {questions.meta.total} questions
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {questions.data.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onView={(id) => console.log('View question:', id)}
                onSave={(id) => console.log('Save question:', id)}
              />
            ))}
          </div>
        </>
      ) : (
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertDescription>
            No questions found matching your filters. Try adjusting your search criteria.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
