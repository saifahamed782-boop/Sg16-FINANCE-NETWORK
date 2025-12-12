import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello. I am SAIF-AI, powered by Gemini 3.0 Pro. How can I assist with your capital requirements?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Convert to Gemini history format
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await sendChatMessage(history, userMsg.text);
    
    setMessages(prev => [...prev, {
      role: 'model',
      text: responseText,
      timestamp: new Date()
    }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gold-500 rounded-full shadow-2xl z-50 flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
      >
        <div className="absolute inset-0 rounded-full bg-gold-400 animate-ping opacity-20 group-hover:opacity-40"></div>
        {isOpen ? (
          <svg className="w-6 h-6 text-black relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-6 h-6 text-black relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-tech-900 border border-gold-600/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="bg-tech-950 p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 blur-sm opacity-50"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm tracking-wide">SAIF-AI Support</span>
                <span className="text-[10px] text-gold-500 font-mono uppercase tracking-wider">Gemini 3.0 Pro Active</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-tech-900/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gold-500 text-black rounded-tr-sm font-medium' 
                    : 'bg-tech-800 text-gray-200 rounded-tl-sm border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                 <div className="bg-tech-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 border border-white/5 shadow-lg items-center">
                   <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                   <span className="text-[10px] text-gray-500 ml-2 font-mono uppercase">Thinking</span>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-tech-950 border-t border-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inquire about loans..."
                className="flex-1 bg-tech-900 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500/50 border border-gray-800 transition-all placeholder-gray-600"
              />
              <button 
                type="submit"
                className="bg-gold-500 hover:bg-gold-400 text-black px-3 rounded-xl transition-all shadow-[0_0_15px_rgba(184,134,11,0.2)] hover:shadow-[0_0_20px_rgba(184,134,11,0.4)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};