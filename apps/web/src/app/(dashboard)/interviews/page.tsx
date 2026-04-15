'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInterview } from '@/hooks/useInterview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function InterviewsPage() {
  const { interviews, isLoadingList } = useInterview();
  const [filter, setFilter] = useState<string>('all');

  const filteredInterviews = interviews?.filter((interview) => {
    if (filter === 'all') return true;
    return interview.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Manage your mock interviews and practice sessions
          </p>
        </div>
        <Link href="/interviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Interview
          </Button>
        </Link>
      </div>

      <div className="flex space-x-2">
        {['all', 'in-progress', 'completed', 'scheduled'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      {isLoadingList ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInterviews && filteredInterviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInterviews.map((interview) => (
            <Link key={interview.id} href={`/interviews/${interview.id}`}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{interview.type}</Badge>
                        <Badge
                          variant={
                            interview.difficulty === 'easy'
                              ? 'default'
                              : interview.difficulty === 'medium'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {interview.difficulty}
                        </Badge>
                      </div>
                      <Badge
                        variant={
                          interview.status === 'completed'
                            ? 'default'
                            : interview.status === 'in-progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {interview.status}
                      </Badge>
                    </div>
                    {interview.score !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold">{interview.score}%</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {interview.industry && (
                    <p className="text-sm">
                      <span className="font-medium">Industry:</span> {interview.industry}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(interview.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {interview.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.round(interview.duration / 60)} min</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No interviews found</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              {filter === 'all'
                ? "You haven't created any interviews yet."
                : `No ${filter.replace('-', ' ')} interviews.`}
            </p>
            <Link href="/interviews/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Interview
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
