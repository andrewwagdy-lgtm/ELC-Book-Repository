
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Book } from '../types';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface LibrarianAIProps {
  books: Book[];
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const LibrarianAI: React.FC<LibrarianAIProps> = ({ books }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm the ELC Pedagogy Specialist. I've just indexed our entire expanded collection of over 200 titles. Are you looking for ESP resources, teacher's books, or something specific like legal or medical English?" }
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
      
      // Instead of sending the full JSON of 200+ books (too many tokens), 
      // we'll send a categorized summary and specific search results if possible.
      const categories = Array.from(new Set(books.map(b => b.category)));
      const categorySummary = categories.map(cat => {
        const catBooks = books.filter(b => b.category === cat).slice(0, 5).map(b => b.title).join(', ');
        return `${cat}: Includes titles like ${catBooks}...`;
      }).join('\n');

      const systemInstruction = `
        You are a specialized ELC Pedagogy Consultant at Pharos University Alexandria.
        Your audience is professional teachers and faculty.
        We have an inventory of ${books.length} academic titles.
        
        Inventory Summary:
        ${categorySummary}
        
        Guidelines:
        1. Speak professionally as a peer to university teachers.
        2. If they ask for a specific book or topic, assume we likely have it (since our list is huge).
        3. Recommend books based on pedagogical needs.
        4. Focus on professional development and student outcomes at PUA.
        5. Encourage checking out Teacher's Books for the Speakout, face2face, and Global series which we have in abundance.
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
    <div className="h-full flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Pedagogy Assistant</h1>
        <p className="text-slate-500 flex items-center gap-1.5"><Sparkles size={14} className="text-yellow-500" /> Professional guidance for the full ELC collection</p>
      </header>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-blue-100 text-blue-600' : 'bg-slate-800 text-white'}`}>
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'assistant' ? 'bg-slate-50 text-slate-700 border border-slate-100' : 'bg-blue-600 text-white'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && <Loader2 size={24} className="text-blue-400 animate-spin mx-auto my-4" />}
        </div>

        <div className="px-6 py-3 bg-slate-50/50 flex flex-wrap gap-2 border-t border-slate-100">
          <button onClick={() => setInput("What medical English resources do we have?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 transition-all">Medical ESP</button>
          <button onClick={() => setInput("Show me Speakout Teacher's Books.")} className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 transition-all">Speakout Resources</button>
          <button onClick={() => setInput("Do we have books for legal English?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 transition-all">Legal English</button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <input type="text" placeholder="Inquire about our collection of 200+ books..." className="w-full pl-6 pr-14 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 p-3 rounded-xl bg-blue-600 text-white disabled:bg-slate-200 transition-all"><Send size={20} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LibrarianAI;
