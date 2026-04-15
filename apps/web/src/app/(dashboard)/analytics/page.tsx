'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInterview } from '@/hooks/useInterview';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const { interviews } = useInterview();

  const performanceData = [
    { date: '2026-04-01', score: 65 },
    { date: '2026-04-03', score: 72 },
    { date: '2026-04-05', score: 78 },
    { date: '2026-04-08', score: 75 },
    { date: '2026-04-10', score: 82 },
    { date: '2026-04-12', score: 85 },
    { date: '2026-04-14', score: 88 },
  ];

  const typeDistribution = [
    { name: 'Behavioral', value: 40, color: '#3b82f6' },
    { name: 'Technical', value: 35, color: '#8b5cf6' },
    { name: 'Case Study', value: 25, color: '#10b981' },
  ];

  const difficultyStats = [
    { difficulty: 'Easy', completed: 15, avgScore: 90 },
    { difficulty: 'Medium', completed: 12, avgScore: 78 },
    { difficulty: 'Hard', completed: 8, avgScore: 65 },
  ];

  const totalInterviews = interviews?.length || 0;
  const completedInterviews = interviews?.filter((i) => i.status === 'completed').length || 0;
  const avgScore =
    interviews
      ?.filter((i) => i.score)
      .reduce((acc, i) => acc + (i.score || 0), 0) /
      (interviews?.filter((i) => i.score).length || 1) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your interview performance and progress over time
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedInterviews} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(avgScore)}%</div>
            <p className="text-xs text-green-600 mt-1">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Practice Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12h 45m</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Interview Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficulty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={difficultyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                  <Bar dataKey="avgScore" fill="#10b981" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
