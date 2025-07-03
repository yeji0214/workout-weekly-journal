
import React from 'react';
import { Home, Calendar, Users, MessageSquare, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <Link to="/">
            <Button 
              variant={isActive('/') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <Home className="h-4 w-4" />
              <span className="text-xs">홈</span>
            </Button>
          </Link>
          
          <Link to="/calendar">
            <Button 
              variant={isActive('/calendar') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="text-xs">달력</span>
            </Button>
          </Link>
          
          <Link to="/teams">
            <Button 
              variant={isActive('/teams') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">팀</span>
            </Button>
          </Link>

          <Link to="/community">
            <Button 
              variant={isActive('/community') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">커뮤니티</span>
            </Button>
          </Link>

          <Link to="/settings">
            <Button 
              variant={isActive('/settings') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">설정</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
