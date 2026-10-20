import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Edit, Send, Trash2, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useListUsers, getListUsersQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  toName: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  thread: Array<{ from: string; body: string; timestamp: string }>;
}

export default function MessagesPage({ user }: { user: any }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [search, setSearch] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: allUsers = [] } = useListUsers(undefined, { query: { enabled: true, queryKey: getListUsersQueryKey() } });

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Auto-poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = () => {
    const stored = localStorage.getItem('erp_messages');
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  };

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem('erp_messages', JSON.stringify(msgs));
    setMessages(msgs);
  };

  const handleSendMessage = (recipientId: string, recipientName: string, subject: string, body: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      fromId: user.id,
      fromName: user.name,
      fromRole: user.role,
      toId: recipientId,
      toName: recipientName,
      subject,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      thread: [],
    };
    saveMessages([...messages, newMsg]);
    toast({ title: 'Message sent' });
    setShowNewMessage(false);
  };

  const handleReply = () => {
    if (!selectedConversation || !replyText.trim()) return;
    
    const updated = messages.map(m => {
      if (m.id === selectedConversation.id) {
        return {
          ...m,
          thread: [
            ...m.thread,
            {
              from: user.id,
              body: replyText,
              timestamp: new Date().toISOString(),
            }
          ],
        };
      }
      return m;
    });
    saveMessages(updated);
    setReplyText('');
    toast({ title: 'Reply sent' });
    setSelectedConversation(updated.find(m => m.id === selectedConversation.id) || null);
  };

  const handleMarkRead = (msg: Message) => {
    const updated = messages.map(m => m.id === msg.id ? { ...m, read: true } : m);
    saveMessages(updated);
    setSelectedConversation(updated.find(m => m.id === msg.id) || null);
  };

  const handleMarkAllRead = () => {
    const updated = messages.map(m => 
      m.toId === user.id ? { ...m, read: true } : m
    );
    saveMessages(updated);
    toast({ title: 'All messages marked as read' });
  };

  const handleDelete = (msgId: string) => {
    if (!confirm('Delete this message?')) return;
    saveMessages(messages.filter(m => m.id !== msgId));
    setSelectedConversation(null);
    toast({ title: 'Message deleted' });
  };

  const myMessages = messages.filter(m => m.toId === user.id || m.fromId === user.id);
  const unreadCount = messages.filter(m => m.toId === user.id && !m.read).length;

  // Group messages by conversation partner
  const conversations = myMessages.reduce((acc, msg) => {
    const partnerId = msg.fromId === user.id ? msg.toId : msg.fromId;
    const partnerName = msg.fromId === user.id ? msg.toName : msg.fromName;
    
    if (!acc[partnerId]) {
      acc[partnerId] = {
        partnerId,
        partnerName,
        lastMessage: msg,
        unreadCount: 0,
      };
    }
    
    // Update to most recent message
    if (new Date(msg.timestamp) > new Date(acc[partnerId].lastMessage.timestamp)) {
      acc[partnerId].lastMessage = msg;
    }
    
    // Count unread
    if (msg.toId === user.id && !msg.read) {
      acc[partnerId].unreadCount++;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const conversationList = Object.values(conversations).sort((a: any, b: any) => 
    new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );

  const filteredConversations = conversationList.filter((c: any) =>
    c.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Messages</h1>
          <p className="text-sm text-slate-400">Internal communication hub • {unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden flex shadow-sm">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-800/60 flex flex-col bg-slate-950/50">
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <span className="font-semibold text-white">Inbox ({unreadCount})</span>
            <button 
              onClick={() => setShowNewMessage(true)}
              className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search messages..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-9 bg-slate-900 border-slate-800 text-xs text-white" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv: any) => {
              const isActive = selectedConversation && 
                (selectedConversation.fromId === conv.partnerId || selectedConversation.toId === conv.partnerId);
              return (
                <div 
                  key={conv.partnerId}
                  onClick={() => {
                    setSelectedConversation(conv.lastMessage);
                    if (conv.lastMessage.toId === user.id && !conv.lastMessage.read) {
                      handleMarkRead(conv.lastMessage);
                    }
                  }}
                  className={cn(
                    "p-4 border-b border-slate-800/40 cursor-pointer transition-colors",
                    isActive ? 'bg-slate-800/60' : conv.unreadCount > 0 ? 'bg-slate-800/40 hover:bg-slate-800/50' : 'hover:bg-slate-800/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-medium text-xs flex-shrink-0">
                      {conv.partnerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? 'text-white' : 'text-slate-300'}`}>
                          {conv.partnerName}
                        </span>
                        <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{formatTime(conv.lastMessage.timestamp)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-indigo-300 font-medium' : 'text-slate-500'}`}>
                          {conv.lastMessage.body.substring(0, 40)}...
                        </p>
                        {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ml-2">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No messages found
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950/20">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-medium text-sm">
                    {(selectedConversation.fromId === user.id ? selectedConversation.toName : selectedConversation.fromName).charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {selectedConversation.fromId === user.id ? selectedConversation.toName : selectedConversation.fromName}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {selectedConversation.fromId === user.id ? '' : selectedConversation.fromRole}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDelete(selectedConversation.id)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{formatTime(selectedConversation.timestamp)}</span>
                    {selectedConversation.read && selectedConversation.fromId === user.id && (
                      <CheckCheck className="w-3 h-3 text-blue-400" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      selectedConversation.fromId === user.id
                        ? 'ml-auto bg-indigo-600 text-white'
                        : 'mr-auto bg-slate-700 text-slate-100'
                    )}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-80">{selectedConversation.subject}</p>
                    <p className="text-sm">{selectedConversation.body}</p>
                  </div>
                </div>

                {/* Thread replies */}
                {selectedConversation.thread.map((reply, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="text-xs text-slate-500">{formatTime(reply.timestamp)}</div>
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-3",
                        reply.from === user.id
                          ? 'ml-auto bg-indigo-600 text-white'
                          : 'mr-auto bg-slate-700 text-slate-100'
                      )}
                    >
                      <p className="text-sm">{reply.body}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder="Type your reply..."
                    className="flex-1 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm resize-none min-h-[60px]"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-[60px] px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select a conversation</h3>
              <p className="text-sm text-slate-500 max-w-sm">Choose a contact from the sidebar to start messaging or create a new conversation.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Message Sheet */}
      <NewMessageSheet
        open={showNewMessage}
        onOpenChange={setShowNewMessage}
        users={allUsers.filter((u: any) => u.id !== user.id)}
        onSend={handleSendMessage}
      />
    </div>
  );
}

function NewMessageSheet({ open, onOpenChange, users, onSend }: any) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!recipient || !subject.trim() || !body.trim()) return;
    const recipientUser = users.find((u: any) => u.id === recipient);
    onSend(recipient, recipientUser?.name, subject, body);
    setRecipient('');
    setSubject('');
    setBody('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-slate-950 border-slate-800 sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-white">New Message</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">Recipient</label>
            <select
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-white text-sm focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select recipient...</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">Subject</label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Message subject..."
              className="bg-slate-900 border-slate-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">Message</label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Type your message..."
              className="bg-slate-900 border-slate-800 text-white min-h-[200px]"
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!recipient || !subject.trim() || !body.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" /> Send Message
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
