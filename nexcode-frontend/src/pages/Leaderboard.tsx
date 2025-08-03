import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, TrendingUp, Users, Calendar, Award, Crown } from 'lucide-react';
import { leaderboardAPI, problemsAPI, contestsAPI } from '@/lib/api';

interface LeaderboardEntry {
  user: {
    id: number;
    username: string;
    email: string;
  };
  problem: {
    id: number;
    title: string;
  };
  total_submissions: number;
  accepted_submissions: number;
  best_execution_time: number;
  rank: number;
}

interface ContestLeaderboardEntry {
  user: {
    id: number;
    username: string;
    email: string;
  };
  contest: {
    id: number;
    title: string;
  };
  total_score: number;
  solved_problems: number;
  total_submissions: number;
  best_execution_time: number;
  rank: number;
}

interface Contest {
  id: number;
  title: string;
  is_ended: boolean;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contestLeaderboard, setContestLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<string>('global');
  const [selectedContest, setSelectedContest] = useState<string>('all');
  const [problems, setProblems] = useState<any[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch problems using proper API function
        const problemsResponse = await problemsAPI.getProblems();
        setProblems(problemsResponse.data.results || problemsResponse.data);

        // Fetch contests using proper API function
        const contestsResponse = await contestsAPI.getContests();
        setContests(contestsResponse.data.results || contestsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await leaderboardAPI.getLeaderboard({ problem: selectedProblem !== 'global' ? parseInt(selectedProblem) : undefined });
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedProblem]);

  useEffect(() => {
    const fetchContestLeaderboard = async () => {
      if (selectedContest === 'all') {
        setContestLeaderboard([]);
        return;
      }

      try {
        const response = await contestsAPI.getContestLeaderboard(parseInt(selectedContest));
        setContestLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch contest leaderboard:', error);
        setContestLeaderboard([]);
      }
    };

    fetchContestLeaderboard();
  }, [selectedContest]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-warning" />;
      case 2:
        return <Trophy className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <Award className="h-6 w-6 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </CardHeader>
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
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers in programming challenges</p>
        </div>
      </div>

      <Tabs defaultValue="problems" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="problems">Problem Rankings</TabsTrigger>
          <TabsTrigger value="contests">Contest Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="space-y-4">
          <div className="flex justify-end">
            <Select value={selectedProblem} onValueChange={setSelectedProblem}>
              <SelectTrigger className="w-48 bg-code-bg border-code-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global Leaderboard</SelectItem>
                {problems.map((problem) => (
                  <SelectItem key={problem.id} value={problem.id.toString()}>
                    {problem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {leaderboard.map((entry, index) => (
              <Card key={entry.user.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{entry.user.username}</CardTitle>
                        {selectedProblem !== 'global' && (
                          <p className="text-sm text-muted-foreground">{entry.problem.title}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        {entry.best_execution_time}ms
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {entry.accepted_submissions}/{entry.total_submissions} submissions
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No problem leaderboard data available.</p>
              <p className="text-sm text-muted-foreground">Start solving problems to appear on the leaderboard!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contests" className="space-y-4">
          <div className="flex justify-end">
            <Select value={selectedContest} onValueChange={setSelectedContest}>
              <SelectTrigger className="w-48 bg-code-bg border-code-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select a Contest</SelectItem>
                {contests.filter(c => c.is_ended).map((contest) => (
                  <SelectItem key={contest.id} value={contest.id.toString()}>
                    {contest.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {contestLeaderboard.map((entry, index) => (
              <Card key={entry.user.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{entry.user.username}</CardTitle>
                        <p className="text-sm text-muted-foreground">{entry.contest.title}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        {entry.total_score} points
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {entry.solved_problems} problems solved
                      </div>
                      {entry.best_execution_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          {entry.best_execution_time}ms
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {selectedContest === 'all' && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Select a contest to view rankings.</p>
              <p className="text-sm text-muted-foreground">Only ended contests show leaderboards.</p>
            </div>
          )}

          {selectedContest !== 'all' && contestLeaderboard.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No contest leaderboard data available.</p>
              <p className="text-sm text-muted-foreground">No participants or submissions found for this contest.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}