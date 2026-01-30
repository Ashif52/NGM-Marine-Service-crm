import { HelpCircle, Menu, ChevronDown, Ship, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  currentPage: string;
  onMenuClick: () => void;
}

const pageNames: Record<string, string> = {
  dashboard: 'Dashboard',
  pms: 'Planned Maintenance System',
  'crew-logs': 'Daily Work Logs',
  invoices: 'Invoice Management',
  'access-control': 'Role & Access Control',
  masters: 'Masters',
  clients: 'Clients',
  vessels: 'Vessels',
  crew: 'Crew',
  recruitment: 'Recruitment',
  documents: 'Documents',
  'dg-communication': 'DG Communication',
  finance: 'Finance',
  reports: 'Reports',
  settings: 'Settings',
  login: 'Login',
};

export function TopBar({ currentPage, onMenuClick }: TopBarProps) {
  const { user, logout, selectedShip, setSelectedShip, ships } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.hash = 'login';
  };

  const currentShip = ships.find(s => s.id === selectedShip);
  const roleDisplay = user?.role === 'master' ? 'Master' : user?.role === 'crew' ? 'Crew' : 'Staff';
  const userInitials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      {/* Left: Menu + Page Title + Ship Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-foreground hover:bg-muted p-2 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-foreground text-xl font-semibold">{pageNames[currentPage] || 'NMG Marine CRM'}</h1>
        
        {/* Ship Selector - Only for Master */}
        {user?.role === 'master' && (
          <div className="ml-4 hidden md:block">
            <Select value={selectedShip || ''} onValueChange={setSelectedShip}>
              <SelectTrigger className="w-[220px] h-9 border-accent/30">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-accent" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {ships.map((ship) => (
                  <SelectItem key={ship.id} value={ship.id}>
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span>{ship.name}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          ship.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                          ship.status === 'maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      >
                        {ship.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Crew - Show assigned ship */}
        {user?.role === 'crew' && currentShip && (
          <div className="ml-4 hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
            <Ship className="w-4 h-4 text-accent" />
            <span className="text-sm text-foreground">{currentShip.name}</span>
          </div>
        )}
      </div>

      {/* Right: Help, User */}
      <div className="flex items-center gap-3">
        {/* Help */}
        <button className="p-2 hover:bg-accent/10 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5 text-foreground" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-accent/10 px-3 py-2 rounded transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm text-foreground">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{roleDisplay}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>My Account</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.hash = 'settings'}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}