'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const interviewSchema = z.object({
  type: z.enum(['behavioral', 'technical', 'case-study', 'mock']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  industry: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

export default function NewInterviewPage() {
  const router = useRouter();
  const { createInterview, isCreating } = useInterview();

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      type: 'behavioral',
      difficulty: 'medium',
      industry: '',
    },
  });

  const onSubmit = (values: InterviewFormValues) => {
    createInterview(values, {
      onSuccess: (data) => {
        router.push(`/interviews/${data.data.id}`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Interview</h1>
        <p className="text-muted-foreground">
          Set up your interview preferences and get started
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Configuration</CardTitle>
          <CardDescription>
            Choose the type, difficulty, and industry for your interview practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interview type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="case-study">Case Study</SelectItem>
                        <SelectItem value="mock">Mock Interview</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of questions you want to practice
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the difficulty level that matches your preparation stage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Technology, Finance, Healthcare" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify an industry for more targeted questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
