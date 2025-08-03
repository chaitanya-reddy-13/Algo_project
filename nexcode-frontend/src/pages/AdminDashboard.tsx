import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Code, 
  Trophy, 
  FileText, 
  TrendingUp, 
  Calendar,
  Plus,
  Settings,
  UserCheck,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  total_users: number;
  total_problems: number;
  total_contests: number;
  total_submissions: number;
  recent_submissions: any[];
  recent_contests: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your online judge platform</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/contests/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/problems/create">
              <Code className="h-4 w-4 mr-2" />
              Add Problem
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_problems || 0}</div>
            <p className="text-xs text-muted-foreground">Available problems</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_contests || 0}</div>
            <p className="text-xs text-muted-foreground">Active contests</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_submissions || 0}</div>
            <p className="text-xs text-muted-foreground">Code submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contests">Contests</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Submissions */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recent_submissions?.slice(0, 5).map((submission: any) => (
                    <div key={submission.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-sm font-medium">{submission.participant?.user?.username || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{submission.problem?.title}</p>
                      </div>
                      <Badge variant={submission.verdict === 'Accepted' ? 'default' : 'secondary'}>
                        {submission.verdict}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Contests */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Contests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recent_contests?.slice(0, 5).map((contest: any) => (
                    <div key={contest.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-sm font-medium">{contest.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(contest.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={contest.is_running ? 'default' : contest.is_ended ? 'secondary' : 'outline'}>
                        {contest.is_running ? 'Running' : contest.is_ended ? 'Ended' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contests" className="space-y-4">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Contest Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button asChild className="h-20">
                  <Link to="/admin/contests">
                    <div className="text-center">
                      <Trophy className="h-6 w-6 mx-auto mb-2" />
                      <span>View All Contests</span>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="h-20">
                  <Link to="/admin/contests/create">
                    <div className="text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2" />
                      <span>Create Contest</span>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="h-20">
                  <Link to="/contests">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                      <span>View Public Contests</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Problem Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button asChild className="h-20">
                  <Link to="/admin/problems">
                    <div className="text-center">
                      <Code className="h-6 w-6 mx-auto mb-2" />
                      <span>View All Problems</span>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="h-20">
                  <Link to="/admin/problems/create">
                    <div className="text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2" />
                      <span>Add Problem</span>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="h-20">
                  <Link to="/problems">
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <span>View Public Problems</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button asChild className="h-20">
                  <Link to="/admin/users">
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-2" />
                      <span>View All Users</span>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="h-20">
                  <Link to="/admin/users/active">
                    <div className="text-center">
                      <UserCheck className="h-6 w-6 mx-auto mb-2" />
                      <span>Active Users</span>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="h-20">
                  <Link to="/admin/users/inactive">
                    <div className="text-center">
                      <UserX className="h-6 w-6 mx-auto mb-2" />
                      <span>Inactive Users</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 