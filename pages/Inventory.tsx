
import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { Search, BookPlus, RotateCcw, Clock, Lock, CheckCircle2 } from 'lucide-react';

interface InventoryProps {
  books: Book[];
  onCheckout: (bookId: string, teacherId: string, teacherName: string) => void;
  onReturn: (bookId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ books, onCheckout, onReturn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCheckoutModal, setShowCheckoutModal] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.isbn.includes(searchTerm);
      const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, categoryFilter]);

  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ELC Resource Inventory</h1>
          <p className="text-slate-500 font-medium mt-1">Live availability tracking for the full book collection.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Borrowed
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input type="text" placeholder="Search title, author, or ISBN..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="bg-slate-50 border-none rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <BookCard 
            key={book.id} 
            book={book} 
            onCheckoutClick={() => setShowCheckoutModal(book.id)} 
            onReturnClick={() => onReturn(book.id)} 
          />
        ))}
      </div>

      {showCheckoutModal && (
        <CheckoutModal 
          book={books.find(b => b.id === showCheckoutModal)!} 
          onClose={() => setShowCheckoutModal(null)}
          onConfirm={(tid, tname) => {
            onCheckout(showCheckoutModal, tid, tname);
            setShowCheckoutModal(null);
          }}
        />
      )}
    </div>
  );
};

const BookCard: React.FC<{ book: Book, onCheckoutClick: () => void, onReturnClick: () => void }> = ({ book, onCheckoutClick, onReturnClick }) => {
  const isAvailable = book.status === 'Available';
  
  return (
    <div className={`group bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 transition-all duration-300 flex flex-col h-full ${
      isAvailable 
        ? 'border-transparent hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1' 
        : 'border-slate-50 opacity-80'
    }`}>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-4">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
            isAvailable ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {book.category}
          </span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            isAvailable 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-200 text-slate-500'
          }`}>
            {isAvailable ? <CheckCircle2 size={12} /> : <Lock size={12} />}
            {book.status}
          </div>
        </div>
        
        <h3 className={`text-lg font-black leading-tight mb-2 line-clamp-2 ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>
          {book.title}
        </h3>
        <p className={`text-sm mb-1 font-bold ${isAvailable ? 'text-slate-600' : 'text-slate-400'}`}>
          {book.author}
        </p>
        <p className="text-[10px] text-slate-400 font-mono tracking-tighter mb-4">ISBN: {book.isbn}</p>
        
        {!isAvailable && (
          <div className="mt-auto mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Clock size={14} className="text-slate-300" />
              <span>Due Back: {book.dueDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                {book.checkedOutTo?.charAt(0)}
              </div>
              <p className="text-[11px] font-bold text-slate-500 truncate">Held by: {book.checkedOutTo}</p>
            </div>
          </div>
        )}

        <div className="mt-auto">
          {isAvailable ? (
            <button 
              onClick={onCheckoutClick} 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl transition-all font-black shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <BookPlus size={18} /> Borrow Resource
            </button>
          ) : (
            <button 
              onClick={onReturnClick} 
              className="w-full flex items-center justify-center gap-2 border-2 border-slate-100 hover:border-blue-100 hover:text-blue-600 text-slate-400 py-3 rounded-2xl transition-all font-black"
            >
              <RotateCcw size={18} /> Process Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutModal: React.FC<{ book: Book, onClose: () => void, onConfirm: (tid: string, tname: string) => void }> = ({ book, onClose, onConfirm }) => {
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Loan Assignment</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors text-xl">×</button>
        </div>
        <div className="p-8">
          <div className="mb-8 p-5 bg-blue-50 rounded-3xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Resource Selected</p>
            <h3 className="font-black text-blue-900 text-base leading-tight">{book.title}</h3>
            <p className="text-xs text-blue-600 mt-1 font-bold">{book.author}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onConfirm(teacherId, teacherName); }} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Faculty Staff ID</label>
              <input autoFocus type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all outline-none font-medium" placeholder="e.g. T-12345" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teacher Full Name</label>
              <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all outline-none font-medium" placeholder="e.g. Sarah J. Mitchell" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
            </div>
            <div className="pt-6 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">Complete Checkout</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
