import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles, Target, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Assistance',
      description: 'Get real-time AI suggestions and feedback during your practice sessions',
    },
    {
      icon: Target,
      title: 'Mock Interviews',
      description: 'Practice with industry-specific mock interviews and get detailed feedback',
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track your progress and identify areas for improvement with detailed analytics',
    },
  ];

  const benefits = [
    'Real-time interview transcription and analysis',
    'Personalized question bank based on your industry',
    'STAR method guidance for behavioral questions',
    'Technical interview preparation with coding practice',
    'Resume optimization and ATS compatibility checking',
    'Company-specific interview preparation',
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">GU</span>
            </div>
            <span className="text-xl font-bold">Guru Upadesh</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container space-y-6 py-20 md:py-28 lg:py-32">
          <div className="mx-auto flex max-w-[64rem] flex-col items-center space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Ace Your Next Interview with{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Preparation
            </h1>
            <p className="max-w-[42rem] text-lg leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Master your interview skills with real-time AI assistance, personalized mock interviews,
              and comprehensive performance analytics. Join thousands of successful candidates.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 text-center shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Comprehensive Interview Preparation
                </h2>
                <p className="text-lg text-muted-foreground">
                  From behavioral questions to technical challenges, we cover everything you need
                  to excel in your interviews.
                </p>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start space-x-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="mx-auto max-w-3xl rounded-lg bg-gradient-to-r from-primary to-blue-600 p-12 text-center text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to Ace Your Interviews?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of successful candidates who have improved their interview skills
              with Guru Upadesh.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">GU</span>
                </div>
                <span className="text-lg font-bold">Guru Upadesh</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered interview preparation platform
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Testimonials</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Guru Upadesh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
