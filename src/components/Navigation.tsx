
import React from 'react';
import { Home, Calendar, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <Link to="/">
            <Button 
              variant={isActive('/') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">홈</span>
            </Button>
          </Link>
          
          <Link to="/calendar">
            <Button 
              variant={isActive('/calendar') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">월간 히스토리</span>
            </Button>
          </Link>
          
          <Link to="/teams">
            <Button 
              variant={isActive('/teams') ? "default" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">팀</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
