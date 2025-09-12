import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Users, FolderOpen, Database, FileSearch, Key, Upload } from 'lucide-react';
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
import ChangePasswordModal from './ChangePasswordModal';
import { AuditLogger } from '../utils/auditLogger';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(() => {
    const userRole = user?.roles?.[0] || user?.role;

    // For USER role, default to upload-image (their primary function)
    if (userRole === 'USER') {
      return 'upload-image';
    }

    // For REVIEWER role, default to audit trail if they have permission
    if (userRole === 'REVIEWER') {
      if (user?.canViewAuditTrail === true) {
        return 'view-audit-trail';
      }
      return 'project-data'; // Fallback
    }

    // For ADMINISTRATOR role, default to user-management
    if (userRole === 'ADMINISTRATOR') {
      return 'user-management';
    }

    // Fallback based on permissions
    if (user?.canViewAuditTrail === true) return 'view-audit-trail';
    if (user?.canCreateProjects === true) return 'project-management';
    if (user?.canViewReports === true) return 'project-data';

    // If user has no specific permissions, default to upload image
    return 'upload-image';
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleLogout = async () => {
    try {
      // Log logout attempt
      if (user?.username) {
        await AuditLogger.logDropdownAction(user.username, 'clicked logout');
      }

      await logout();

      // Log successful logout
      if (user?.username) {
        await AuditLogger.logUserLogout(user.username);
      }

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

  // Get navigation items based on user permissions from API response
  const getNavigationItems = () => {
    const userRole = user?.roles?.[0] || user?.role;
    const navigationItems = [];

    console.log('Navbar: Building navigation for user:', {
      userRole,
      canViewAuditTrail: user?.canViewAuditTrail,
      canCreateProjects: user?.canCreateProjects,
      canViewReports: user?.canViewReports,
      fullUser: user
    });

    // Admin gets user management first
    if (userRole === 'ADMINISTRATOR') {
      navigationItems.push({
        id: 'user-management',
        label: 'User Management',
        icon: Users,
        path: '/user-management'
      });
    }

    // Non-admin users get upload image FIRST (primary functionality)
    // Admin users should NOT see upload image option
    if (userRole !== 'ADMINISTRATOR') {
      navigationItems.push({
        id: 'upload-image',
        label: 'Upload Image',
        icon: Upload,
        path: '/upload-image'
      });
    }

    // Users with canCreateProjects permission get project management
    if (user?.canCreateProjects === true) {
      navigationItems.push({
        id: 'project-management',
        label: 'Project Management',
        icon: FolderOpen,
        path: '/project-management'
      });
    }

    // Users with canViewReports permission get project data (for viewing projects)
    if (user?.canViewReports === true) {
      navigationItems.push({
        id: 'project-data',
        label: 'Project Data',
        icon: Database,
        path: '/project-data'
      });
    }

    // Users with canViewAuditTrail permission get audit trail
    if (user?.canViewAuditTrail === true) {
      navigationItems.push({
        id: 'view-audit-trail',
        label: 'Audit Trail',
        icon: FileSearch,
        path: '/view-audit-trail'
      });
    }

    return navigationItems;
  };

  return (
    <>
    <nav className="bg-z-pale-green border-b border-z-pale-green/20 shadow-lg backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo and Brand - Far Left */}
          <div className="flex items-center">
            <Link to={getNavigationItems()[0]?.path || '/user-management'} className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
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
              {getNavigationItems().map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={async () => {
                      // Log navigation click
                      if (user?.username) {
                        await AuditLogger.logNavbarClick(user.username, item.label);
                        await AuditLogger.logNavigation(user.username, window.location.pathname, item.path, 'click');
                      }

                      setActiveNav(item.id);
                      navigate(item.path);
                    }}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeNav === item.id
                        ? 'bg-z-sky/20 text-slate-900 shadow-md border border-z-sky/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-z-sky/10 hover:shadow-sm'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.label}
                    {activeNav === item.id && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-z-sky rounded-full"></div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* User Menu - Far Right */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-z-sky/20 transition-all duration-200"
                    onClick={async () => {
                      // Log dropdown menu open
                      if (user?.username) {
                        await AuditLogger.logDropdownAction(user.username, 'opened profile dropdown');
                      }
                    }}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                      <AvatarImage src="" alt={user?.username} />
                      <AvatarFallback className="bg-z-sky text-slate-900 font-semibold text-sm">
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
                          <AvatarFallback className="bg-z-sky text-slate-900 font-semibold">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-z-light-green text-slate-700 mt-1">
                            {user?.role || 'User'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-z-pale-green/20" />
                  <DropdownMenuItem
                    onClick={async () => {
                      // Log profile navigation
                      if (user?.username) {
                        await AuditLogger.logDropdownAction(user.username, 'clicked', 'View Profile');
                        await AuditLogger.logNavigation(user.username, window.location.pathname, '/profile', 'click');
                      }
                      navigate('/profile');
                    }}
                    className="hover:bg-z-sky/10 transition-colors cursor-pointer p-3"
                  >
                    <User className="mr-3 h-4 w-4 text-slate-600" />
                    <span className="font-medium">View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      // Log change password modal open
                      if (user?.username) {
                        await AuditLogger.logDropdownAction(user.username, 'clicked', 'Change Password');
                        await AuditLogger.logDialogAction(user.username, 'Change Password Modal', 'opened');
                      }
                      setShowChangePasswordModal(true);
                    }}
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
                  <Button className="bg-z-sky hover:bg-z-sky/90 text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* Change Password Modal */}
    <ChangePasswordModal
      isOpen={showChangePasswordModal}
      onClose={() => setShowChangePasswordModal(false)}
      onSuccess={() => {
        setShowChangePasswordModal(false);
        // Could add a toast notification here
      }}
      username={user?.username || ''}
    />
    </>
  );
};

export default Navbar;
