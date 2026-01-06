import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Page title */}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {getPageTitle(location.pathname)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              {/* <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button> */}

              {/* User menu */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role} {user?.ship_name && `• ${user.ship_name}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pms': 'Planned Maintenance System',
    '/crew-logs': 'Daily Work Logs',
    '/vessels': 'Fleet Management',
    '/crew': 'Crew Management',
    '/masters': 'Masters',
    '/clients': 'Clients',
    '/recruitment': 'Recruitment',
    '/invoices': 'Invoicing',
    '/finance': 'Finance',
    '/reports': 'Reports',
    '/documents': 'Documents',
    '/settings': 'Settings',
    '/access-control': 'Access Control',
    '/dg-communication': 'DG Communication',
    '/manuals': 'Manuals & Procedures',
    '/emergency': 'Emergency Preparedness',
    '/incidents': 'Incident Reporting',
    '/audits': 'Audits & Reviews',
    '/cargo': 'Cargo Operations',
    '/bunkering': 'Bunkering',
  };

  return routes[pathname] || 'NMG Marine';
}
