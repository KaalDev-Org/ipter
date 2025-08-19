import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Users, FolderOpen, Database, FileSearch, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import ZuelligIcon from './ui/zuellig-icon';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('user-management');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="bg-gradient-to-r from-z-ivory via-white to-z-light-green border-b border-z-pale-green/20 shadow-lg backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo and Brand - Far Left */}
          <div className="flex items-center">
            <Link to="/user-management" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-z-sky to-z-pale-green rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <ZuelligIcon className="text-slate-900" width={28} height={28} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-header font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                  IPTER
                </h1>
                <span className="text-xs text-gray-500 font-body">
                  by Zuellig Pharma
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveNav('user-management');
                  navigate('/user-management');
                }}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeNav === 'user-management'
                    ? 'bg-gradient-to-r from-z-sky/20 to-z-pale-green/20 text-slate-900 shadow-md border border-z-sky/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-z-sky/10 hover:to-z-pale-green/10 hover:shadow-sm'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                User Management
                {activeNav === 'user-management' && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-z-sky to-z-pale-green rounded-full"></div>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveNav('project-management');
                  navigate('/project-management');
                }}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeNav === 'project-management'
                    ? 'bg-gradient-to-r from-z-sky/20 to-z-pale-green/20 text-slate-900 shadow-md border border-z-sky/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-z-sky/10 hover:to-z-pale-green/10 hover:shadow-sm'
                }`}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Project Management
                {activeNav === 'project-management' && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-z-sky to-z-pale-green rounded-full"></div>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveNav('view-project-data');
                  navigate('/view-project-data');
                }}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeNav === 'view-project-data'
                    ? 'bg-gradient-to-r from-z-sky/20 to-z-pale-green/20 text-slate-900 shadow-md border border-z-sky/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-z-sky/10 hover:to-z-pale-green/10 hover:shadow-sm'
                }`}
              >
                <Database className="w-4 h-4 mr-2" />
                View Project Data
                {activeNav === 'view-project-data' && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-z-sky to-z-pale-green rounded-full"></div>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveNav('view-audit-trail');
                  navigate('/view-audit-trail');
                }}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeNav === 'view-audit-trail'
                    ? 'bg-gradient-to-r from-z-sky/20 to-z-pale-green/20 text-slate-900 shadow-md border border-z-sky/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-z-sky/10 hover:to-z-pale-green/10 hover:shadow-sm'
                }`}
              >
                <FileSearch className="w-4 h-4 mr-2" />
                View Audit Trail
                {activeNav === 'view-audit-trail' && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-z-sky to-z-pale-green rounded-full"></div>
                )}
              </Button>
            </div>
          </div>

          {/* User Menu - Far Right */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-z-sky/20 transition-all duration-200">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                      <AvatarImage src="" alt={user?.username} />
                      <AvatarFallback className="bg-gradient-to-br from-z-sky to-z-pale-green text-slate-900 font-semibold text-sm">
                        {getInitials(user?.firstName, user?.lastName, user?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 bg-white/95 backdrop-blur-sm border border-z-pale-green/20 shadow-xl rounded-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" alt={user?.username} />
                          <AvatarFallback className="bg-gradient-to-br from-z-sky to-z-pale-green text-slate-900 font-semibold">
                            {getInitials(user?.firstName, user?.lastName, user?.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold leading-none text-slate-900">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.username
                            }
                          </p>
                          <p className="text-xs leading-none text-gray-600 mt-1">
                            {user?.email}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-z-light-green text-slate-700 mt-1">
                            {user?.roles?.[0] || 'User'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-z-pale-green/20" />
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    className="hover:bg-z-sky/10 transition-colors cursor-pointer p-3"
                  >
                    <User className="mr-3 h-4 w-4 text-slate-600" />
                    <span className="font-medium">View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/change-password')}
                    className="hover:bg-z-sky/10 transition-colors cursor-pointer p-3"
                  >
                    <Key className="mr-3 h-4 w-4 text-slate-600" />
                    <span className="font-medium">Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-z-pale-green/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer p-3"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-z-sky to-z-pale-green hover:from-z-sky/90 hover:to-z-pale-green/90 text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
