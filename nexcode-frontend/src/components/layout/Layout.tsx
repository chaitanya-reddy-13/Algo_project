import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  user?: {
    username: string;
    role: string;
  } | null;
  onLogout: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}