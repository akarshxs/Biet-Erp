import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, ChevronDown, LogOut, Moon, Search, Sun, User, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListNotificationsQueryKey,
  useListNotifications,
  useMarkNotificationRead,
} from '@workspace/api-client-react';
import { Input } from './ui/input';

interface HeaderProps {
  user: any;
  activeSection: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

const SECTION_MAP: Record<string, { title: string; eyebrow: string }> = {
  dashboard: { title: 'Operations overview', eyebrow: 'Command centre' },
  users: { title: 'People & roles', eyebrow: 'Administration' },
  departments: { title: 'Departments', eyebrow: 'Academic structure' },
  subjects: { title: 'Subjects', eyebrow: 'Academic structure' },
  attendance: { title: 'Attendance', eyebrow: 'Academic structure' },
  assignments: { title: 'Assignments', eyebrow: 'Academic structure' },
  notes: { title: 'Notes & materials', eyebrow: 'Academic structure' },
  results: { title: 'Results', eyebrow: 'Academic structure' },
  fees: { title: 'Finance & fees', eyebrow: 'Administration' },
  timetable: { title: 'Timetable', eyebrow: 'Academic structure' },
  notices: { title: 'Notices', eyebrow: 'Communication' },
  events: { title: 'Events', eyebrow: 'Student life' },
  placements: { title: 'Placements', eyebrow: 'Student life' },
  library: { title: 'Library', eyebrow: 'Student life' },
  messages: { title: 'Messages', eyebrow: 'Communication' },
  analytics: { title: 'Analytics', eyebrow: 'Reporting' },
  logs: { title: 'Audit trail', eyebrow: 'Governance' },
  profile: { title: 'Profile', eyebrow: 'My account' },
  hostel: { title: 'Hostel', eyebrow: 'Operations' },
  transport: { title: 'Transport', eyebrow: 'Operations' },
  scholarships: { title: 'Scholarships', eyebrow: 'Student services' },
  'academic-calendar': { title: 'Academic calendar', eyebrow: 'Operations' },
  leave: { title: 'Leave', eyebrow: 'Student services' },
  certificates: { title: 'Certificates', eyebrow: 'Student services' },
  courses: { title: 'Courses', eyebrow: 'Academic structure' },
  gallery: { title: 'Gallery', eyebrow: 'Student life' },
};

function relativeTime(value?: string) {
  if (!value) return 'Recently';
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export default function Header({ user, activeSection, onSectionChange, onLogout }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [feedback, setFeedback] = useState('');
  const shellRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const notificationsQuery = useListNotifications();
  const notifications = notificationsQuery.data ?? [];
  const unread = useMemo(() => notifications.filter((item: any) => !item.read), [notifications]);
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    const storedTheme = localStorage.getItem('erp_theme') === 'dark' ? 'dark' : 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
        setShowProfile(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('erp_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const patchRead = (ids: string[]) => {
    queryClient.setQueryData(getListNotificationsQueryKey(), (old: any[] | undefined) =>
      (old ?? []).map((item) => ids.includes(item.id) ? { ...item, read: true } : item),
    );
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        patchRead([id]);
        setFeedback('Marked as read');
      },
      onError: () => setFeedback('Could not update notification'),
    });
  };

  const handleMarkAll = () => {
    if (unread.length === 0) return;
    const ids = unread.map((item: any) => item.id);
    let completed = 0;
    ids.forEach((id) => markRead.mutate({ id }, {
      onSuccess: () => {
        completed += 1;
        if (completed === ids.length) {
          patchRead(ids);
          setFeedback('All notifications marked as read');
        }
      },
      onError: () => setFeedback('Some notifications could not be updated'),
    }));
  };

  const section = SECTION_MAP[activeSection] ?? SECTION_MAP.dashboard;

  return (
    <header className="h-[72px] border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-7 sticky top-0 z-30">
      <div className="min-w-0">
        <p className="erp-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{section.eyebrow}</p>
        <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{section.title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative" ref={shellRef}>
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            data-testid="input-global-search"
            readOnly
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            placeholder="Search records"
            className="h-9 pl-9 pr-12 bg-slate-950 border-slate-800 text-sm placeholder:text-slate-500 cursor-pointer"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 erp-mono text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">⌘K</kbd>
        </div>

        <button data-testid="button-toggle-theme" onClick={toggleTheme} aria-label="Toggle theme" className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
          {theme === 'dark' ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
        </button>

        <div className="relative">
          <button
            data-testid="button-notifications"
            onClick={() => { setShowNotifications((current) => !current); setShowProfile(false); setFeedback(''); }}
            aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}
            className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unread.length > 0 && <span data-testid="status-unread-notifications" className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900" />}
          </button>
          {showNotifications && (
            <div data-testid="panel-notifications" className="absolute right-0 top-12 w-[min(380px,calc(100vw-2rem))] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
                <div>
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <p className="text-xs text-slate-500 mt-0.5">{unread.length ? `${unread.length} need your attention` : 'You are all caught up'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button data-testid="button-mark-all-notifications" onClick={handleMarkAll} disabled={!unread.length || markRead.isPending} className="text-xs font-medium text-indigo-400 hover:text-indigo-500 disabled:opacity-40 px-2 py-1">Mark all read</button>
                  <button data-testid="button-close-notifications" onClick={() => setShowNotifications(false)} className="p-1 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notificationsQuery.isLoading ? (
                  <div className="p-4 space-y-3"><div className="h-12 rounded-lg bg-slate-800 animate-pulse" /><div className="h-12 rounded-lg bg-slate-800 animate-pulse" /></div>
                ) : notificationsQuery.isError ? (
                  <div className="p-8 text-center"><Bell className="w-7 h-7 text-red-400 mx-auto mb-2" /><p className="text-sm text-red-400">Notifications unavailable</p><p className="text-xs text-slate-500 mt-1">Try again in a moment.</p></div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center"><CheckCheck className="w-7 h-7 text-emerald-400 mx-auto mb-2" /><p className="text-sm text-slate-300">No notifications yet</p><p className="text-xs text-slate-500 mt-1">New activity will appear here.</p></div>
                ) : notifications.map((item: any) => (
                  <div key={item.id} data-testid={`notification-${item.id}`} className={`p-4 border-b border-slate-800/50 last:border-0 ${item.read ? 'opacity-60' : 'bg-indigo-500/5'}`}>
                    <div className="flex gap-3">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.read ? 'bg-slate-600' : 'bg-indigo-500'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-white">{item.title}</p><span className="erp-mono text-[10px] text-slate-500 whitespace-nowrap">{relativeTime(item.createdAt)}</span></div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                        {!item.read && <button data-testid={`button-mark-notification-${item.id}`} onClick={() => handleMarkRead(item.id)} className="mt-2 inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-500"><Check className="w-3 h-3" /> Mark read</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {feedback && <div data-testid="status-notification-feedback" className="px-4 py-2 text-xs text-emerald-500 bg-emerald-500/5 border-t border-emerald-500/10">{feedback}</div>}
            </div>
          )}
        </div>

        <div className="relative">
          <button data-testid="button-profile-menu" onClick={() => { setShowProfile((current) => !current); setShowNotifications(false); }} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-800 transition-colors">
            <span className="w-8 h-8 rounded-lg overflow-hidden bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/20">
              {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : user?.name?.slice(0, 2).toUpperCase()}
            </span>
            <span className="hidden sm:block text-left max-w-[120px]"><span className="block text-xs font-semibold text-white truncate">{user?.name}</span><span className="block text-[10px] text-slate-500 capitalize">{user?.role}</span></span>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-500" />
          </button>
          {showProfile && (
            <div data-testid="menu-profile" className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
              <div className="px-4 py-3 border-b border-slate-800/50"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p></div>
              <button data-testid="button-open-profile" onClick={() => { onSectionChange?.('profile'); setShowProfile(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /> Profile</button>
              <div className="border-t border-slate-800/50 pt-1">
                <button data-testid="button-logout" onClick={() => { onLogout?.(); setShowProfile(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}