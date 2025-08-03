import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Trophy, Brain, Users, Zap, Shield, Calendar, Clock } from 'lucide-react';
import { contestsAPI } from '@/lib/api';

interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_public: boolean;
  allow_registration: boolean;
  max_participants: number | null;
  participant_count: number;
  is_running: boolean;
  is_upcoming: boolean;
  is_ended: boolean;
  is_participant: boolean;
  created_by: {
    id: number;
    username: string;
  };
  created_at: string;
}

export function Home() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await contestsAPI.getContests();
        const contestsData = response.data.results || response.data;
        // Show only active contests (running or upcoming)
        const activeContests = contestsData.filter((contest: Contest) => 
          contest.is_active && (contest.is_running || contest.is_upcoming)
        );
        setContests(activeContests.slice(0, 3)); // Show only first 3 contests
      } catch (error) {
        console.error('Failed to fetch contests:', error);
        setContests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const getStatusBadge = (contest: Contest) => {
    if (contest.is_running) {
      return <Badge className="bg-success text-foreground">Running</Badge>;
    } else if (contest.is_upcoming) {
      return <Badge variant="outline" className="border-accent text-accent-foreground">Upcoming</Badge>;
    } else {
      return <Badge variant="secondary">Ended</Badge>;
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
            Master Programming
            <br />
            with AI Guidance
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Practice coding problems, compete with developers worldwide, and improve your skills with intelligent AI assistance. Your journey to coding excellence starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="hero">
              <Link to="/register">
                <Code className="mr-2 h-5 w-5" />
                Start Coding
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link to="/problems">
                Explore Problems
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Quick Access
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" size="lg" className="h-20 flex-col gap-2">
              <Link to="/online-compiler">
                <Code className="h-6 w-6" />
                Online Compiler
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 flex-col gap-2">
              <Link to="/problems">
                <Brain className="h-6 w-6" />
                Practice Problems
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 flex-col gap-2">
              <Link to="/contests">
                <Trophy className="h-6 w-6" />
                Join Contests
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 flex-col gap-2">
              <Link to="/ai-assistant">
                <Zap className="h-6 w-6" />
                AI Assistant
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Active Contests Section */}
      {contests.length > 0 && (
        <section className="px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Active Contests
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contests.map((contest) => (
                <Card key={contest.id} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-2">{contest.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Trophy className="h-4 w-4" />
                          <span>by {contest.created_by.username}</span>
                        </div>
                      </div>
                      {getStatusBadge(contest)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contest.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Start: {new Date(contest.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>End: {new Date(contest.end_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{contest.participant_count} participants</span>
                        {contest.max_participants && (
                          <span className="text-xs text-muted-foreground">
                            (max {contest.max_participants})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button asChild className="w-full">
                      <Link to={`/contests/${contest.id}`}>
                        {contest.is_running ? 'Join Contest' : 'View Details'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {contests.length >= 3 && (
              <div className="text-center mt-8">
                <Button asChild variant="outline">
                  <Link to="/contests">
                    View All Contests
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose NexCode?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered Learning</CardTitle>
                <CardDescription>
                  Get instant feedback, hints, and explanations from our intelligent AI assistant
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Code className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Online Compiler</CardTitle>
                <CardDescription>
                  Professional online compiler with comprehensive error handling and multiple language support
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Trophy className="h-12 w-12 text-success mb-4" />
                <CardTitle>Competitive Programming</CardTitle>
                <CardDescription>
                  Participate in contests and climb the leaderboard to prove your skills
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-warning mb-4" />
                <CardTitle>Secure Execution</CardTitle>
                <CardDescription>
                  Run your code safely in isolated containers with proper resource limits
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of developers who are improving their coding skills with NexCode
          </p>
          <Button asChild size="xl" variant="hero">
            <Link to="/register">
              <Zap className="mr-2 h-5 w-5" />
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}