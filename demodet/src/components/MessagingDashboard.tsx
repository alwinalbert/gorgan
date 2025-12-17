import { useState } from 'react';
import { X, Send, Circle, MessageSquare, Radio } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  avatar: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

interface MessagingDashboardProps {
  onClose: () => void;
}

export default function MessagingDashboard({ onClose }: MessagingDashboardProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 1,
      text: "Anyone seen any demo-creatures lately?",
      timestamp: "10:23 AM"
    },
    {
      id: 2,
      senderId: 2,
      text: "Negative. Sensors show all clear in my sector.",
      timestamp: "10:24 AM"
    }
  ]);

  const members: Member[] = [
    {
      id: 1,
      name: "Mike Wheeler",
      role: "Party Leader",
      status: 'online',
      avatar: "MW",
      lastMessage: "Anyone seen any demo-creatures?",
      unreadCount: 2
    },
    {
      id: 2,
      name: "Eleven",
      role: "The Psychic",
      status: 'online',
      avatar: "11",
      lastMessage: "Friends don't lie.",
      unreadCount: 0
    },
    {
      id: 3,
      name: "Dustin Henderson",
      role: "Tech Expert",
      status: 'away',
      avatar: "DH",
      lastMessage: "Setting up the cerebro...",
      unreadCount: 1
    },
    {
      id: 4,
      name: "Lucas Sinclair",
      role: "The Ranger",
      status: 'online',
      avatar: "LS",
      lastMessage: "All clear on the perimeter.",
      unreadCount: 0
    },
    {
      id: 5,
      name: "Will Byers",
      role: "The Wise",
      status: 'offline',
      avatar: "WB",
      lastMessage: "Castle Byers signing off.",
      unreadCount: 0
    },
    {
      id: 6,
      name: "Max Mayfield",
      role: "The Zoomer",
      status: 'online',
      avatar: "MM",
      lastMessage: "On my way with the skateboard.",
      unreadCount: 0
    }
  ];

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
    if (messageInput.trim() && selectedMember) {
      const newMessage: Message = {
        id: messages.length + 1,
        senderId: 0, // Current user
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
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    selectedMember?.id === member.id
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
                      <h3 className="font-semibold text-white text-sm">{member.name}</h3>
                      {member.unreadCount !== undefined && member.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {member.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-red-400 font-mono">{member.role}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{member.lastMessage}</p>
                  </div>
                </button>
              ))}
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
                      <h3 className="font-bold text-white">{selectedMember.name}</h3>
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
                    const isCurrentUser = message.senderId === 0;
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
