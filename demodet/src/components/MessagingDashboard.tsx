import { useState, useEffect } from 'react';
import { X, Send, Circle, MessageSquare, Radio, Loader2 } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Member {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  status: 'online' | 'offline' | 'away';
  avatar: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: number;
  senderId: string;
  text: string;
  timestamp: string;
}

interface MessagingDashboardProps {
  onClose: () => void;
}

export default function MessagingDashboard({ onClose }: MessagingDashboardProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: '1',
      text: "Welcome to the party communications system!",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [meRes, allRes] = await Promise.all([userAPI.getMe(), userAPI.getAll()]);
        const me = meRes.data || {};
        const allUsers = allRes.data || [];
        const friendUids: string[] = me.friends || [];

        const source = friendUids.length
          ? allUsers.filter((u: any) => friendUids.includes(u.uid))
          : allUsers.filter((u: any) => u.uid !== currentUser.uid);

        const formatted: Member[] = source.map((u: any) => ({
          uid: u.uid,
          displayName: u.displayName || u.email || `User_${u.uid?.slice(0, 8)}`,
          email: u.email || null,
          photoURL: u.photoURL || null,
          status: 'online',
          avatar: getAvatarInitials(u.displayName || u.email || u.uid),
          lastMessage: u.lastMessage || 'Ready to communicate',
          unreadCount: u.unreadCount || 0,
        }));

        setMembers(formatted);
        setSelectedMember((prev) => (prev ? formatted.find((m) => m.uid === prev.uid) || null : null));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser]);

  // Helper function to get avatar initials
  const getAvatarInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.split(/[\s_]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedMember && currentUser) {
      const newMessage: Message = {
        id: messages.length + 1,
        senderId: currentUser.uid,
        text: messageInput,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[80vh] bg-gradient-to-br from-gray-900 via-black to-red-950 border-2 border-red-800 rounded-lg shadow-2xl flex flex-col overflow-hidden hover-glow">
        {/* Header */}
        <div className="border-b border-red-800 bg-black/50 backdrop-blur p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold tracking-wider text-red-500 font-mono">
                  PARTY COMMUNICATIONS
                </h2>
                <p className="text-xs text-gray-400">Hawkins Lab Encrypted Channel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-red-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Members Sidebar */}
          <div className="w-80 border-r border-red-800 bg-black/30 overflow-y-auto custom-scrollbar">
            <div className="p-3 border-b border-red-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="font-semibold">{members.filter(m => m.status === 'online').length} Online</span>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No other users online yet</p>
                </div>
              ) : (
                members.map((member) => (
                  <button
                    key={member.uid}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      selectedMember?.uid === member.uid
                        ? 'bg-red-900/40 border-2 border-red-600'
                        : 'bg-gray-900/30 border-2 border-transparent hover:bg-red-900/20 hover:border-red-800/50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-900 to-red-700 rounded-full flex items-center justify-center font-bold text-white border-2 border-red-600">
                        {member.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(member.status)} rounded-full border-2 border-gray-900`} />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm">{member.displayName}</h3>
                        {member.unreadCount !== undefined && member.unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {member.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-400 font-mono">{member.email || 'Anonymous User'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{member.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-black/20">
            {selectedMember ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-red-800/50 bg-black/30">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-900 to-red-700 rounded-full flex items-center justify-center font-bold text-white border-2 border-red-600">
                        {selectedMember.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(selectedMember.status)} rounded-full border-2 border-gray-900`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{selectedMember.displayName}</h3>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Circle className={`w-2 h-2 ${getStatusColor(selectedMember.status).replace('bg-', 'fill-')}`} />
                        <span className="text-gray-400 capitalize">{selectedMember.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser?.uid;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-red-900/50 border border-red-700 text-white'
                              : 'bg-gray-800/50 border border-gray-700 text-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-red-800/50 bg-black/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-900/50 border border-red-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold border border-red-700"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Select a party member to start messaging</p>
                  <p className="text-sm mt-2">Communication is key to surviving the Upside Down</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
