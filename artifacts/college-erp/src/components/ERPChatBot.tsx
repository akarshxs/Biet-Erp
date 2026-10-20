import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const KNOWLEDGE_BASE: Record<string, Record<string, string>> = {
  common: {
    'hello|hi|hey|help': "Hello! I'm your BIET ERP college assistant. I can help with navigation, features, and common tasks. What do you need?",
    'logout|sign out': "Click your avatar in the bottom-left sidebar to logout, or use the top-right user menu.",
    'password|change password': "Go to Profile → Change Password section to update your password.",
    'profile|my profile': "Click 'Profile' in the sidebar or your avatar to view/edit your profile.",
    'college|name|about': "You're using the BIET ERP college management system.",
  },
  student: {
    'attendance|present|absent': "View your attendance in the Attendance section. Each subject shows your percentage. Green = OK (>75%), Amber = Warning (60-75%), Red = Danger (<60%).",
    'assignment|homework|submission': "Check the Assignments section for all active assignments, due dates, and submission status.",
    'result|marks|grade|cgpa|sgpa': "Your results are in the Results section, organized by semester. SGPA and CGPA are calculated automatically.",
    'fee|fees|payment|dues': "Check your fee status in the Fees section. You can view outstanding dues and payment history.",
    'timetable|schedule|class|timing': "Your class timetable is in the Timetable section, showing daily schedule by subject.",
    'notice|announcement|news': "College notices and announcements are in the Notices section.",
    'document|upload|admission|certificate': "Upload your admission documents in the Documents section. Keep all 15 documents uploaded for a smooth admission process.",
    'library|book|issue': "Browse and issue books from the Library section.",
    'message|chat|teacher': "Send direct messages to teachers/admin from the Messages section.",
    'placement|job|interview': "Check placement opportunities and company visits in the Placements section.",
    'event|festival|cultural': "View upcoming college events and festivals in the Events section.",
  },
  teacher: {
    'attendance|mark|present': "Mark student attendance subject-wise in the Attendance section. Select subject, date, then mark each student.",
    'assignment|create|homework': "Create and manage assignments in the Assignments section. Track submission counts and review student work.",
    'result|marks|grade|enter': "Enter student marks in the Results section. Select student and subject to record grades.",
    'notes|material|upload|study': "Upload study materials and notes in the Notes/Materials section for students to access.",
    'timetable|schedule|class': "View your teaching schedule in the Timetable section.",
    'student|list|class': "View your assigned students in the Users or Attendance section.",
  },
  admin: {
    'user|student|teacher|manage': "Manage all users (students, teachers, admins) in the Users section. Add, edit, deactivate accounts.",
    'department|add|manage': "Manage departments in the Departments section.",
    'analytics|report|stats|dashboard': "View comprehensive analytics and reports in the Analytics section.",
    'fee|fees|payment|collect': "Manage student fee records in the Fees section. Track paid/pending/partial payments.",
    'log|activity|audit': "View system activity logs in the Logs section.",
    'document|verify|admission': "Review and verify student documents in the Documents section.",
    'subject|course|add': "Manage subjects and courses in the Subjects section.",
  },
};

const QUICK_CHIPS: Record<string, string[]> = {
  student: ["My Attendance", "Assignment Due", "My Results", "Fee Status", "Documents"],
  teacher: ["Mark Attendance", "Create Assignment", "Enter Results", "Upload Notes"],
  admin: ["Manage Users", "View Analytics", "Fee Management", "Verify Documents"],
  owner: ["Manage Users", "View Analytics", "Fee Management", "Verify Documents"],
};

export default function ERPChatBot({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      addBotMessage(`Hi ${user.name?.split(' ')[0] || 'there'}! I'm your BIET ERP college assistant. How can I help you today?`);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'bot',
      content,
      timestamp: new Date(),
    }]);
  };

  const findResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Check common knowledge base first
    for (const [pattern, response] of Object.entries(KNOWLEDGE_BASE.common)) {
      const patterns = pattern.split('|');
      if (patterns.some(p => lowerQuery.includes(p))) {
        return response;
      }
    }

    // Check role-specific knowledge base
    const roleKB = KNOWLEDGE_BASE[user.role] || {};
    for (const [pattern, response] of Object.entries(roleKB)) {
      const patterns = pattern.split('|');
      if (patterns.some(p => lowerQuery.includes(p))) {
        return response;
      }
    }

    // Default response
    return "I'm not sure about that. Try navigating to the relevant section from the sidebar, or check the Help documentation. You can also contact the admin for specific queries.";
  };

  const handleSend = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || isTyping) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Show typing indicator
    setIsTyping(true);

    try {
      const history = [...messages, userMsg].map((message) => ({
        role: message.role === 'bot' ? 'assistant' : 'user',
        content: message.content,
      }));
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('erp_token') || ''}` },
        body: JSON.stringify({ messages: history }),
      });
      const data = await response.json();
      addBotMessage(response.ok && data.content ? data.content : findResponse(text));
    } catch {
      addBotMessage(findResponse(text));
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setInput(chip);
    void handleSend(chip);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[hsl(18_74%_46%)] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center text-white z-50 animate-pulse hover:animate-none"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-[hsl(215_42%_16%)] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">College Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/80">Online • {user.role}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick chips - show after first bot message */}
        {messages.length === 1 && messages[0].role === 'bot' && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_CHIPS[user.role]?.map(chip => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm h-9"
          />
          <Button
            onClick={() => void handleSend()}
            disabled={!input.trim()}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
