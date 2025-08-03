import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Plus, Edit, Trash2, Users, Calendar, Settings } from 'lucide-react';

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
  created_by: {
    id: number;
    username: string;
  };
  created_at: string;
}

export function AdminContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    is_public: true,
    allow_registration: true,
    max_participants: ''
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/admin/contests/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContests(data.results || data);
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/contests/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
        })
      });
      
      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          start_time: '',
          end_time: '',
          is_public: true,
          allow_registration: true,
          max_participants: ''
        });
        fetchContests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create contest');
      }
    } catch (error) {
      console.error('Failed to create contest:', error);
      alert('Failed to create contest');
    }
  };

  const handleDeleteContest = async (contestId: number) => {
    if (!confirm('Are you sure you want to delete this contest?')) return;
    
    try {
      const response = await fetch(`/api/admin/contests/${contestId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      
      if (response.ok) {
        fetchContests();
      } else {
        alert('Failed to delete contest');
      }
    } catch (error) {
      console.error('Failed to delete contest:', error);
      alert('Failed to delete contest');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contest Management</h1>
          <p className="text-muted-foreground">Create and manage programming contests</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateContest} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_participants">Max Participants (optional)</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button type="submit">Create Contest</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {contests.map((contest) => (
          <Card key={contest.id} className="bg-gradient-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{contest.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>by {contest.created_by.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{contest.participant_count} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(contest.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(contest)}
                  <div className="flex gap-1">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/contests/${contest.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteContest(contest.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{contest.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Start:</span>
                  <div className="text-muted-foreground">
                    {new Date(contest.start_time).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium">End:</span>
                  <div className="text-muted-foreground">
                    {new Date(contest.end_time).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Settings:</span>
                  <div className="text-muted-foreground">
                    {contest.is_public ? 'Public' : 'Private'} • {contest.allow_registration ? 'Registration Open' : 'Registration Closed'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Max Participants:</span>
                  <div className="text-muted-foreground">
                    {contest.max_participants || 'Unlimited'}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button asChild size="sm">
                  <Link to={`/admin/contests/${contest.id}/problems`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Problems
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/admin/contests/${contest.id}/participants`}>
                    <Users className="h-4 w-4 mr-2" />
                    View Participants
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/contests/${contest.id}/leaderboard`}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
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
          <p className="text-muted-foreground text-lg">No contests created yet.</p>
          <p className="text-sm text-muted-foreground">Create your first contest to get started!</p>
        </div>
      )}
    </div>
  );
} 