import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types/index';

interface AIAssistantProps {
  onClose: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🤖 EDYY activated. I can help you with threat analysis, survival strategies, and emergency protocols. How can I assist you?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual Gemini API call)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('demogorgon')) {
      return '⚠️ DEMOGORGON PROTOCOL:\n\n1. Do NOT engage directly\n2. Create loud noise to disorient it\n3. Use fire or heat sources (they are sensitive to heat)\n4. Retreat to the nearest safe zone immediately\n5. Alert all team members\n6. Estimated survival rate with proper protocol: 73%\n\nWeak points: Exposed flower-like head when feeding';
    }

    if (lowerQuery.includes('safe') || lowerQuery.includes('where')) {
      return '🛡️ NEAREST SAFE ZONES:\n\n1. Community Center (0.3 miles NW) - High security\n2. Police Station (0.5 miles E) - Armed personnel\n3. School Basement (0.7 miles S) - Underground shelter\n\nAll safe zones have:\n✓ Reinforced walls\n✓ Emergency supplies\n✓ Communication equipment\n✓ Multiple exit routes';
    }

    if (lowerQuery.includes('team') || lowerQuery.includes('members')) {
      return '👥 TEAM STATUS:\n\n✅ Mike - Sector 1-A (Safe)\n✅ Lucas - Sector 2-B (Safe)\n⚠️ Dustin - Sector 7-G (Warning Zone)\n✅ Will - HQ (Safe)\n\nAll members are online and responsive.';
    }

    if (lowerQuery.includes('survive') || lowerQuery.includes('help')) {
      return '💡 SURVIVAL TIPS:\n\n1. Stay in groups (never go alone)\n2. Keep communication devices charged\n3. Carry flashlight (creatures avoid bright light)\n4. Know your evacuation routes\n5. Listen for alarm signals\n6. Report any unusual sounds or sightings\n7. Keep emergency kit nearby\n\nRemember: Quick response = Higher survival rate';
    }

    return '🤖 I understand your concern. For specific threat analysis, please provide more details about:\n\n• Location\n• Type of threat observed\n• Number of entities\n• Urgency level\n\nYou can also ask me about:\n- Safe zone locations\n- Team member status\n- Survival strategies\n- Threat identification';
  };

  return (
    <div className="bg-black rounded-lg shadow-2xl overflow-hidden hover-glow">
      {/* Header */}
      <div className="bg-purple-900/50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <div>
            <h3 className="text-sm md:text-base font-bold text-white">EDDYY</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 md:h-96 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 custom-scrollbar bg-black/40">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <Bot className="w-8 h-8 text-purple-400 bg-purple-900/50 p-1 rounded-full" />
              </div>
            )}

            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-900/50 text-white'
                  : 'bg-purple-900/30 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs text-gray-400 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <User className="w-8 h-8 text-blue-400 bg-blue-900/50 p-1 rounded-full" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <Bot className="w-8 h-8 text-purple-400 bg-purple-900/50 p-1 rounded-full" />
            <div className="bg-purple-900/30 px-4 py-3 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-black/60 p-3 md:p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about threats..."
            className="flex-1 bg-black/60 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 md:px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <p className="text-[10px] md:text-xs text-gray-500 mt-2 hidden md:block">
          💡 Try asking: "What should I do if I see a Demogorgon?" or "Where are the safe zones?"
        </p>
      </div>
    </div>
  );
}
