
import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { Search, Filter, BookPlus, RotateCcw, Info, Clock, Hash } from 'lucide-react';

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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Teacher Resource Inventory</h1>
        <p className="text-slate-500">Academic references, pedagogical methodology, and classroom materials.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search by title, author, or ISBN..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <BookCard key={book.id} book={book} onCheckoutClick={() => setShowCheckoutModal(book.id)} onReturnClick={() => onReturn(book.id)} />
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col min-h-[220px]">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0">
            {book.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${isAvailable ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
            {book.status}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-slate-600 mb-1 font-medium">{book.author}</p>
        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter mb-4">ISBN: {book.isbn}</p>
        
        {!isAvailable && (
          <div className="mt-auto mb-4 p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock size={14} className="text-amber-500" />
              <span>Due: {book.dueDate}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 truncate">Held by: {book.checkedOutTo}</p>
          </div>
        )}

        <div className="mt-auto">
          {isAvailable ? (
            <button onClick={onCheckoutClick} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors font-semibold shadow-sm">
              <BookPlus size={18} /> Borrow Book
            </button>
          ) : (
            <button onClick={onReturnClick} className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 py-2 rounded-xl transition-colors font-semibold">
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Assign to Teacher</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">×</button>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm leading-snug">{book.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{book.author}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">ISBN: {book.isbn}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onConfirm(teacherId, teacherName); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teacher Staff ID</label>
              <input autoFocus type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. T-10293" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name & Dept</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Prof. Ahmed - English Dept" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95">Complete Loan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
