import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Code, LogOut, Settings, User, Trophy, BookOpen, MessageSquare, Users } from 'lucide-react';

interface HeaderProps {
  user?: {
    username: string;
    role: string;
  } | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Code className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            NexCode
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/problems" className="text-foreground/80 hover:text-foreground transition-colors">
            Problems
          </Link>
          <Link to="/contests" className="text-foreground/80 hover:text-foreground transition-colors">
            Contests
          </Link>
          <Link to="/submissions" className="text-foreground/80 hover:text-foreground transition-colors">
            Submissions
          </Link>
          <Link to="/leaderboard" className="text-foreground/80 hover:text-foreground transition-colors">
            Leaderboard
          </Link>
          <Link to="/ai-assistant" className="text-foreground/80 hover:text-foreground transition-colors">
            AI Assistant
          </Link>
          <Link to="/online-compiler" className="text-foreground/80 hover:text-foreground transition-colors">
            Online Compiler
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/submissions')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Submissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/contests')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Contests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/leaderboard')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/ai-assistant')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  AI Assistant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/online-compiler')}>
                  <Code className="mr-2 h-4 w-4" />
                  Online Compiler
                </DropdownMenuItem>
                {user.role === 'Admin' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/contests')}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Manage Contests
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="hero" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}