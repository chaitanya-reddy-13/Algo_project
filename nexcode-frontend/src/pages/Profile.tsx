import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Trophy, Code, Settings } from 'lucide-react';
import { authAPI, submissionsAPI, Submission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  bio?: string;
  date_joined: string;
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchSubmissions();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setEditForm({
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await submissionsAPI.getSubmissions();
      // Handle paginated response structure
      const submissionsData = response.data.results || response.data;
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setSubmissions([]);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update API call
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    const totalSubmissions = (submissions || []).length;
    const acceptedSubmissions = (submissions || []).filter(s => s.verdict === 'Accepted').length;
    const successRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
    
    return {
      totalSubmissions,
      acceptedSubmissions,
      successRate: successRate.toFixed(1),
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Failed to load profile.</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and view statistics</p>
        </div>
        <Button
          variant={isEditing ? "destructive" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
        >
          <Settings className="mr-2 h-4 w-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profile.username}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-2">
                  {profile.role}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(profile.date_joined).toLocaleDateString()}</span>
              </div>
              {profile.bio && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-gradient-card border-border mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm">Total Submissions</span>
                </div>
                <span className="font-bold">{stats.totalSubmissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="text-sm">Accepted</span>
                </div>
                <span className="font-bold">{stats.acceptedSubmissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-warning" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <span className="font-bold">{stats.successRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>
                    Your latest code submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(submissions || []).slice(0, 10).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">Submission #{submission.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Problem #{submission.problem ? (typeof submission.problem === 'object' ? submission.problem.id : submission.problem) : 'unknown'} • {submission.language} • {new Date(submission.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          submission.verdict === 'Accepted' ? 'border-success text-success' :
                          submission.verdict === 'Wrong Answer' ? 'border-destructive text-destructive' :
                          'border-warning text-warning'
                        }>
                          {submission.verdict}
                        </Badge>
                      </div>
                    ))}
                    {(submissions || []).length === 0 && (
                      <div className="text-center py-8">
                        <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No submissions yet. Start solving problems!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 