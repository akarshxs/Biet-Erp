import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/LoginPage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import SubjectsPage from '@/pages/SubjectsPage';
import AttendancePage from '@/pages/AttendancePage';
import AssignmentsPage from '@/pages/AssignmentsPage';
import NotesPage from '@/pages/NotesPage';
import ResultsPage from '@/pages/ResultsPage';
import FeesPage from '@/pages/FeesPage';
import TimetablePage from '@/pages/TimetablePage';
import NoticesPage from '@/pages/NoticesPage';
import EventsPage from '@/pages/EventsPage';
import PlacementsPage from '@/pages/PlacementsPage';
import LibraryPage from '@/pages/LibraryPage';
import MessagesPage from '@/pages/MessagesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import LogsPage from '@/pages/LogsPage';
import ProfilePage from '@/pages/ProfilePage';
import DocumentsPage from '@/pages/DocumentsPage';
import ERPChatBot from '@/components/ERPChatBot';
import { AnimatePresence, motion } from 'framer-motion';

import HostelPage from '@/pages/HostelPage';
import TransportPage from '@/pages/TransportPage';
import ScholarshipsPage from '@/pages/ScholarshipsPage';
import AcademicCalendarPage from '@/pages/AcademicCalendarPage';
import LeavePage from '@/pages/LeavePage';
import CertificatesPage from '@/pages/CertificatesPage';
import CoursesPage from '@/pages/CoursesPage';
import GalleryPage from '@/pages/GalleryPage';
import { CommandPalette } from '@/components/CommandPalette';
import RecordManager from '@/components/RecordManager';
import { recordModules } from '@/lib/recordModules';

// Wire up JWT token getter for all generated API hooks
setAuthTokenGetter(() => localStorage.getItem('erp_token'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  department?: string | null;
  semester?: number | null;
  profileImage?: string | null;
  employeeId?: string | null;
  rollNumber?: string | null;
  admissionYear?: number | null;
  batch?: string | null;
  designation?: string | null;
  qualification?: string | null;
  experience?: string | null;
  isActive: boolean;
  createdAt: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const activeSection = location === '/' ? 'dashboard' : location.replace(/^\/+/, '');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const userData = localStorage.getItem('erp_user');
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      }
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    setUser(userData);
    setLocation('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
    setLocation('/');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('erp_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoginPage onLogin={handleLogin} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const renderPage = () => {
    const recordModule = recordModules[activeSection];
    const canManageRecords =
      ['owner', 'admin', 'administrator', 'teacher', 'hod', 'principal'].includes(user.role) &&
      (!recordModule?.adminOnly || ['owner', 'admin', 'administrator', 'principal'].includes(user.role));
    if (recordModule && canManageRecords) return <RecordManager section={activeSection} user={user} />;
    switch (activeSection) {
      case 'dashboard': return <DashboardPage user={user} onNavigate={(section) => setLocation(section === 'dashboard' ? '/' : `/${section}`)} />;
      case 'users': return <UsersPage user={user} />;
      case 'departments': return <DepartmentsPage user={user} />;
      case 'subjects': return <SubjectsPage user={user} />;
      case 'attendance': return <AttendancePage user={user} />;
      case 'assignments': return <AssignmentsPage user={user} />;
      case 'notes': return <NotesPage user={user} />;
      case 'results': return <ResultsPage user={user} />;
      case 'fees': return <FeesPage user={user} />;
      case 'timetable': return <TimetablePage user={user} />;
      case 'notices': return <NoticesPage user={user} />;
      case 'events': return <EventsPage user={user} />;
      case 'placements': return <PlacementsPage user={user} />;
      case 'library': return <LibraryPage user={user} />;
      case 'messages': return <MessagesPage user={user} />;
      case 'analytics': return <AnalyticsPage user={user} />;
      case 'logs': return <LogsPage user={user} />;
      case 'profile': return <ProfilePage user={user} onUpdate={handleUserUpdate} onBack={() => setLocation('/')} />;
      case 'documents': return <DocumentsPage user={user} />;
      case 'hostel': return <HostelPage user={user} />;
      case 'transport': return <TransportPage user={user} />;
      case 'scholarships': return <ScholarshipsPage user={user} />;
      case 'academic-calendar': return <AcademicCalendarPage user={user} />;
      case 'leave': return <LeavePage user={user} />;
      case 'certificates': return <CertificatesPage user={user} />;
      case 'courses': return <CoursesPage user={user} />;
      case 'gallery': return <GalleryPage user={user} />;
      default: return <DashboardPage user={user} onNavigate={(section) => setLocation(section === 'dashboard' ? '/' : `/${section}`)} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen w-full bg-background text-foreground flex overflow-hidden">
          <Sidebar
            user={user}
            activeSection={activeSection}
            onSectionChange={(section) => setLocation(section === 'dashboard' ? '/' : `/${section}`)}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              user={user}
              activeSection={activeSection}
               onSectionChange={(section) => setLocation(section === 'dashboard' ? '/' : `/${section}`)}
              onLogout={handleLogout}
            />
            <main className="flex-1 overflow-y-auto p-6 relative">
              <div className="max-w-[1400px] mx-auto w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderPage()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
          <ERPChatBot user={user} />
           <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onNavigate={(section) => setLocation(section === 'dashboard' ? '/' : `/${section}`)} userRole={user.role} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
