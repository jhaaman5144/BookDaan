import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bell, Menu, X, User, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "admin":
        return "/dashboard/admin";
      case "donor":
        return "/dashboard/donor";
      case "recipient":
      default:
        return "/dashboard/recipient";
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">BookDaan</h1>
                <p className="text-xs text-slate-500">Share Books, Spread Knowledge</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/books">
              <a className={`font-medium transition-colors ${
                location === "/books" ? "text-primary-600" : "text-slate-700 hover:text-primary-600"
              }`}>
                Browse Books
              </a>
            </Link>
            <a href="#" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              How it Works
            </a>
            <a href="#" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              Success Stories
            </a>
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
            <Link href="/books">
              <a className="block px-3 py-2 text-slate-700 hover:text-primary-600 font-medium">
                Browse Books
              </a>
            </Link>
            <a href="#" className="block px-3 py-2 text-slate-700 hover:text-primary-600 font-medium">
              How it Works
            </a>
            <a href="#" className="block px-3 py-2 text-slate-700 hover:text-primary-600 font-medium">
              Success Stories
            </a>
            
            {isAuthenticated && user ? (
              <>
                <Link href={getDashboardLink()}>
                  <a className="block px-3 py-2 text-slate-700 hover:text-primary-600 font-medium">
                    Dashboard
                  </a>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-slate-700 hover:text-primary-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login">
                <a className="block px-3 py-2 text-primary-600 font-medium">
                  Sign In
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
