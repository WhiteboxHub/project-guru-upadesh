'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInterview } from '@/hooks/useInterview';
import { MessageSquare, CheckCircle, Clock, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { interviews, isLoadingList } = useInterview();

  const stats = {
    totalInterviews: interviews?.length || 0,
    completedInterviews: interviews?.filter((i) => i.status === 'completed').length || 0,
    inProgressInterviews: interviews?.filter((i) => i.status === 'in-progress').length || 0,
    averageScore: interviews?.filter((i) => i.score)
      .reduce((acc, i) => acc + (i.score || 0), 0) /
      (interviews?.filter((i) => i.score).length || 1) || 0,
  };

  const recentInterviews = interviews?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your interview preparation progress
          </p>
        </div>
        <Link href="/interviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Interview
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Interviews"
          value={stats.totalInterviews}
          icon={MessageSquare}
          description="All time"
        />
        <StatsCard
          title="Completed"
          value={stats.completedInterviews}
          icon={CheckCircle}
          description="Successfully finished"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressInterviews}
          icon={Clock}
          description="Currently active"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(stats.averageScore)}%`}
          icon={TrendingUp}
          description="Overall performance"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingList ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No interviews yet</p>
                <Link href="/interviews/new">
                  <Button variant="outline" size="sm" className="mt-4">
                    Start Your First Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentInterviews.map((interview) => (
                  <Link key={interview.id} href={`/interviews/${interview.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{interview.type}</Badge>
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
                        <p className="mt-2 text-sm text-muted-foreground">
                          {interview.difficulty} • {interview.industry || 'General'}
                        </p>
                      </div>
                      {interview.score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold">{interview.score}%</div>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/interviews/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Start Mock Interview
              </Button>
            </Link>
            <Link href="/questions">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Browse Questions
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
