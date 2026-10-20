import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  userRole: string;
}

export function CommandPalette({ isOpen, onClose, onNavigate, userRole }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent generally, but can trigger an event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ACTIONS = [
    { label: 'Dashboard', section: 'dashboard', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Attendance', section: 'attendance', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Assignments', section: 'assignments', roles: ['owner', 'admin', 'teacher', 'student', 'hod'] },
    { label: 'Subjects', section: 'subjects', roles: ['owner', 'admin', 'teacher', 'hod', 'principal'] },
    { label: 'Results', section: 'results', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Timetable', section: 'timetable', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'parent'] },
    { label: 'Notes', section: 'notes', roles: ['teacher', 'student', 'hod'] },
    { label: 'Users', section: 'users', roles: ['owner', 'admin', 'hod', 'principal'] },
    { label: 'Departments', section: 'departments', roles: ['owner', 'admin', 'hod', 'principal'] },
    { label: 'Fees', section: 'fees', roles: ['owner', 'admin', 'student', 'principal', 'parent'] },
    { label: 'Courses', section: 'courses', roles: ['owner', 'admin', 'principal'] },
    { label: 'Analytics', section: 'analytics', roles: ['owner', 'admin', 'principal'] },
    { label: 'Audit Logs', section: 'logs', roles: ['owner', 'principal'] },
    { label: 'Events', section: 'events', roles: ['owner', 'admin', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Placements', section: 'placements', roles: ['owner', 'admin', 'student', 'principal'] },
    { label: 'Library', section: 'library', roles: ['owner', 'admin', 'student', 'principal'] },
    { label: 'Notices', section: 'notices', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Gallery', section: 'gallery', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal'] },
    { label: 'Academic Calendar', section: 'academic-calendar', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Hostel', section: 'hostel', roles: ['owner', 'admin', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Transport', section: 'transport', roles: ['owner', 'admin', 'student', 'principal', 'parent'] },
    { label: 'Scholarships', section: 'scholarships', roles: ['owner', 'admin', 'student'] },
    { label: 'Leave', section: 'leave', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal'] },
    { label: 'Certificates', section: 'certificates', roles: ['student'] },
    { label: 'Profile', section: 'profile', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
    { label: 'Messages', section: 'messages', roles: ['owner', 'admin', 'teacher', 'student', 'hod', 'principal', 'parent'] },
  ];

  const allowedActions = ACTIONS.filter(a => a.roles.includes(userRole));
  const filtered = allowedActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900/95 backdrop-blur">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative flex items-center p-3 border-b border-slate-800">
          <Search className="absolute left-4 w-5 h-5 text-slate-500" />
          <Input 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 border-0 bg-transparent text-white focus-visible:ring-0 text-lg placeholder:text-slate-500"
            placeholder="Type a command or search..."
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 tracking-wider">Navigation</div>
              {filtered.map(action => (
                <button
                  key={action.section}
                  onClick={() => {
                    onNavigate(action.section);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-3 text-sm text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg flex items-center justify-between group transition-colors"
                >
                  <span>{action.label}</span>
                  <span className="text-xs text-slate-600 group-hover:text-indigo-500/50">Go to</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}