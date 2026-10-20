import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList, FileText,
  Award, DollarSign, Bell, Briefcase, Library, CalendarDays,
  MessageSquare, LogOut, ChevronLeft, ChevronRight, Building2,
  BarChart3, Shield, ClipboardCheck, Command, FileCheck, User,
  Image, CalendarRange, Home, Bus, GraduationCap, CalendarOff, BadgeCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  user: any;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  showBadge?: boolean;
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    ]
  },
  {
    label: 'ACADEMIC',
    items: [
      { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'] },
      { id: 'assignments', label: 'Assignments', icon: ClipboardList, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod'] },
      { id: 'subjects', label: 'Subjects', icon: BookOpen, roles: ['owner', 'admin', 'administrator', 'teacher', 'hod', 'principal'] },
      { id: 'results', label: 'Results', icon: Award, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'] },
      { id: 'timetable', label: 'Timetable', icon: CalendarDays, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'parent'] },
      { id: 'notes', label: 'Notes', icon: FileText, roles: ['teacher', 'student', 'hod'] },
    ]
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { id: 'users', label: 'Users', icon: Users, roles: ['owner', 'admin', 'administrator', 'hod', 'principal'] },
      { id: 'departments', label: 'Departments', icon: Building2, roles: ['owner', 'admin', 'administrator', 'hod', 'principal'] },
      { id: 'documents', label: 'Documents', icon: FileCheck, roles: ['owner', 'admin', 'administrator'] },
      { id: 'fees', label: 'Fees', icon: DollarSign, roles: ['owner', 'admin', 'administrator', 'student', 'principal', 'parent'] },
      { id: 'courses', label: 'Courses', icon: GraduationCap, roles: ['owner', 'admin', 'administrator', 'principal'] },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['owner', 'admin', 'administrator', 'principal'] },
      { id: 'logs', label: 'Audit Logs', icon: Shield, roles: ['owner', 'administrator', 'principal'] },
    ]
  },
  {
    label: 'STUDENT LIFE',
    items: [
      { id: 'events', label: 'Events', icon: Calendar, roles: ['owner', 'admin', 'administrator', 'student', 'hod', 'principal', 'parent'] },
      { id: 'placements', label: 'Placements', icon: Briefcase, roles: ['owner', 'admin', 'administrator', 'student', 'principal'] },
      { id: 'library', label: 'Library', icon: Library, roles: ['owner', 'admin', 'administrator', 'student', 'principal'] },
      { id: 'notices', label: 'Notices', icon: Bell, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'] },
      { id: 'gallery', label: 'Gallery', icon: Image, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal'] },
      { id: 'academic-calendar', label: 'Academic Calendar', icon: CalendarRange, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    ]
  },
  {
    label: 'STUDENT SERVICES',
    items: [
      { id: 'hostel', label: 'Hostel', icon: Home, roles: ['owner', 'admin', 'administrator', 'student', 'hod', 'principal', 'parent'] },
      { id: 'transport', label: 'Transport', icon: Bus, roles: ['owner', 'admin', 'administrator', 'student', 'principal', 'parent'] },
      { id: 'scholarships', label: 'Scholarships', icon: GraduationCap, roles: ['owner', 'admin', 'administrator', 'student'] },
      { id: 'leave', label: 'Leave', icon: CalendarOff, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal'] },
      { id: 'certificates', label: 'Certificates', icon: BadgeCheck, roles: ['student'] },
    ]
  },
  {
    label: 'MY ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', icon: User, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'] },
      { id: 'documents', label: 'Documents', icon: FileCheck, roles: ['student'] },
    ]
  },
  {
    label: 'COMMUNICATION',
    items: [
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['owner', 'admin', 'administrator', 'teacher', 'student', 'hod', 'principal', 'parent'], showBadge: true },
    ]
  }
];

export default function Sidebar({ user, activeSection, onSectionChange, onLogout, collapsed, onToggleCollapse }: SidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const stored = localStorage.getItem('erp_messages');
      if (stored) {
        const messages = JSON.parse(stored);
        const unread = messages.filter((m: any) => m.toId === user.id && !m.read).length;
        setUnreadCount(unread);
      }
    };
    
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-slate-950 border-r border-slate-800/50 transition-all duration-300 relative flex-shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("h-14 flex items-center px-4 border-b border-slate-800/50", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10 p-0.5 flex-shrink-0 shadow-sm border border-slate-700/50">
          <img src="/download.jpg" alt="BIET ERP Logo" className="w-full h-full object-contain rounded-md" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
             <span className="font-bold text-sm text-white truncate leading-tight">BIET ERP</span>
            <span className="erp-mono text-[9px] text-slate-500 uppercase tracking-widest truncate leading-tight">Operations ERP</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {NAV_GROUPS.map((group, idx) => {
          const items = group.items.filter(item => item.roles.includes(user?.role));
          if (items.length === 0) return null;
          return (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 tracking-wider">
                  {group.label}
                </div>
              )}
              <nav className="space-y-0.5 px-2">
                {items.map(item => {
                  const active = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-testid={`nav-${item.id}`}
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                        active ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                        collapsed && "justify-center"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                      )}
                      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.showBadge && unreadCount > 0 && (
                            <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* User profile & toggle */}
      <div className="p-3 border-t border-slate-800/50">
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-sm z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2 py-1")}>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-tight mt-0.5">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
