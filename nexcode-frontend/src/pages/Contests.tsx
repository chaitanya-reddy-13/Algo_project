import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, Users, Clock, Play, CheckCircle, XCircle } from 'lucide-react';
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

export function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await contestsAPI.getContests({ status: statusFilter });
        setContests(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch contests:', error);
        setContests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [statusFilter]);

  const registerForContest = async (contestId: number) => {
    try {
      await contestsAPI.registerForContest(contestId);
      // Refresh contests to update participant count
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to register for contest:', error);
      alert(error.response?.data?.error || 'Failed to register for contest');
    }
  };

  const getStatusBadge = (contest: Contest) => {
    if (contest.is_running) {
      return <Badge className="bg-green-500">Running</Badge>;
    } else if (contest.is_ended) {
      return <Badge variant="secondary">Ended</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const getActionButton = (contest: Contest) => {
    if (contest.is_ended) {
      return (
        <Button asChild variant="outline">
          <Link to={`/contests/${contest.id}/leaderboard`}>
            <Trophy className="h-4 w-4 mr-2" />
            View Results
          </Link>
        </Button>
      );
    } else if (contest.is_running) {
      if (contest.is_participant) {
        return (
          <Button asChild variant="outline" className="bg-success/10 text-success border-success/20">
            <Link to={`/contests/${contest.id}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </Link>
          </Button>
        );
      } else {
        return (
          <Button asChild>
            <Link to={`/contests/${contest.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Participate
            </Link>
          </Button>
        );
      }
    } else if (contest.allow_registration) {
      if (contest.is_participant) {
        return (
          <Button variant="outline" className="bg-success/10 text-success border-success/20" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Registered
          </Button>
        );
      } else {
        return (
          <Button onClick={() => registerForContest(contest.id)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Register
          </Button>
        );
      }
    } else {
      return (
        <Button variant="outline" disabled>
          <XCircle className="h-4 w-4 mr-2" />
          Registration Closed
        </Button>
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contests</h1>
          <p className="text-muted-foreground">Compete with other programmers</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-code-bg border-code-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contests</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contests.map((contest) => (
          <Card key={contest.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
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
              <p className="text-sm text-muted-foreground line-clamp-3">
                {contest.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Start: {new Date(contest.start_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>End: {new Date(contest.end_time).toLocaleString()}</span>
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
              
              <div className="flex gap-2">
                {getActionButton(contest)}
                <Button asChild variant="outline" size="sm">
                  <Link to={`/contests/${contest.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contests.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No contests found.</p>
          <p className="text-sm text-muted-foreground">Check back later for new contests!</p>
        </div>
      )}
    </div>
  );
} 