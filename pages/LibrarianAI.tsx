
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Book } from '../types';
import { Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react';

interface LibrarianAIProps {
  books: Book[];
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const LibrarianAI: React.FC<LibrarianAIProps> = ({ books }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome back! I'm the ELC Pedagogy Specialist. Our inventory is fully synced. I can help you find specific resources or check if a teacher has already borrowed a medical or legal text. What are you looking for today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';
      
      const availableCount = books.filter(b => b.status === 'Available').length;
      const categories = Array.from(new Set(books.map(b => b.category)));
      
      const categoryContext = categories.map(cat => {
        const catBooks = books.filter(b => b.category === cat);
        const avail = catBooks.filter(b => b.status === 'Available').length;
        const borrowed = catBooks.length - avail;
        return `${cat}: Total ${catBooks.length} (${avail} available, ${borrowed} borrowed).`;
      }).join('\n');

      const systemInstruction = `
        You are a specialized ELC Pedagogy Consultant at Pharos University Alexandria.
        Your audience is professional teachers and faculty.
        Current Live Inventory Status:
        - Total Books: ${books.length}
        - Currently Available: ${availableCount}
        - Categories & Availability:
        ${categoryContext}
        
        Guidelines:
        1. Speak professionally as a peer to university teachers.
        2. Provide availability info if asked. If a category is mostly checked out, suggest related categories.
        3. Recommend books based on pedagogical needs (e.g., if they need a Teacher's Guide, mention the Speakout or Roadmap series).
        4. Focus on professional development and student outcomes at PUA.
        5. If a specific book is borrowed, reassure them that our system tracks returns and they can check back daily.
      `;

      const chat = ai.chats.create({ model, config: { systemInstruction } });
      const result = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: result.text || "Apologies, I encountered an error processing that request." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pedagogy Assistant</h1>
        <p className="text-slate-500 font-medium flex items-center gap-1.5"><Sparkles size={16} className="text-yellow-500" /> AI guidance synced with live resource availability</p>
      </header>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'assistant' 
                    ? 'bg-blue-600 text-white shadow-blue-600/20' 
                    : 'bg-slate-800 text-white shadow-slate-800/20'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={24} /> : <User size={24} />}
                </div>
                <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-50 text-slate-700 border border-slate-100' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-blue-100 flex items-center justify-center shrink-0">
                <Loader2 size={24} className="text-blue-600 animate-spin" />
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50/50 flex flex-wrap gap-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">
            <Info size={12} /> Suggestions:
          </div>
          {["ESP Medical Resources", "Available Speakout Guides", "Legal English Materials"].map(s => (
            <button 
              key={s}
              onClick={() => setInput(s)} 
              className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Inquire about pedagogical resources or availability..." 
              className="w-full pl-8 pr-16 py-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="absolute right-3 p-4 rounded-xl bg-blue-600 text-white disabled:bg-slate-200 disabled:shadow-none shadow-xl shadow-blue-600/30 transition-all active:scale-90"
            >
              <Send size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LibrarianAI;
