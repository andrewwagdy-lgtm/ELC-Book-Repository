
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Book, CheckoutRecord, User } from './types';
import { INITIAL_BOOKS } from './constants';
import Inventory from './pages/Inventory';
import AdminDashboard from './pages/AdminDashboard';
import LibrarianAI from './pages/LibrarianAI';
import { BookOpen, Users, BrainCircuit, LayoutDashboard, LogOut, Wifi } from 'lucide-react';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('elc_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [records, setRecords] = useState<CheckoutRecord[]>(() => {
    const saved = localStorage.getItem('elc_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('elc_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Effect to handle Cross-Tab Synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'elc_books' && e.newValue) {
        setBooks(JSON.parse(e.newValue));
      }
      if (e.key === 'elc_records' && e.newValue) {
        setRecords(JSON.parse(e.newValue));
      }
      if (e.key === 'elc_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('elc_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('elc_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('elc_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('elc_user');
    }
  }, [currentUser]);

  const handleCheckout = (bookId: string, teacherId: string, teacherName: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newRecord: CheckoutRecord = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      teacherId,
      teacherName,
      checkoutDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Active'
    };

    setRecords(prev => [...prev, newRecord]);
    setBooks(prev => prev.map(b => 
      b.id === bookId ? { ...b, status: 'Checked Out', checkedOutTo: teacherName, dueDate: newRecord.dueDate } : b
    ));
  };

  const handleReturn = (bookId: string) => {
    setRecords(prev => prev.map(r => 
      (r.bookId === bookId && r.status === 'Active') ? { ...r, status: 'Returned' } : r
    ));
    setBooks(prev => prev.map(b => 
      b.id === bookId ? { ...b, status: 'Available', checkedOutTo: undefined, dueDate: undefined } : b
    ));
  };

  const handleLogin = (id: string, name: string) => {
    setCurrentUser({ id, name, role: 'Admin' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <nav className="w-full md:w-72 bg-[#1e3a8a] text-white flex flex-col shadow-xl z-20">
          <div className="p-8">
            <h1 className="text-2xl font-black flex items-center gap-3">
              <span className="bg-yellow-400 p-2 rounded-xl text-blue-900 shadow-lg shadow-blue-950/50"><BookOpen size={28} /></span>
              <span className="tracking-tight">ELC Library</span>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-blue-200 text-[10px] font-bold tracking-widest uppercase">Live System Active</p>
            </div>
          </div>

          <div className="flex-1 px-4 space-y-2 py-4">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Book Inventory" />
            <NavLink to="/admin" icon={<Users size={20} />} label="Teacher Loans" />
            <NavLink to="/ai" icon={<BrainCircuit size={20} />} label="Pedagogy Assistant" />
          </div>

          <div className="p-6 border-t border-blue-800/50 bg-blue-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-blue-900 font-black shadow-inner">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter opacity-70">Staff Administrator</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-500/20 rounded-xl text-blue-300 hover:text-red-300 transition-all active:scale-90"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-6 md:p-10 overflow-auto bg-slate-50 relative">
          <div className="max-w-7xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<Inventory books={books} onCheckout={handleCheckout} onReturn={handleReturn} />} />
              <Route path="/admin" element={<AdminDashboard records={records} books={books} onReturn={handleReturn} />} />
              <Route path="/ai" element={<LibrarianAI books={books} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
        isActive 
          ? 'bg-yellow-400 text-blue-900 font-bold shadow-xl translate-x-1' 
          : 'text-blue-100 hover:bg-blue-800/50 hover:translate-x-1'
      }`}
    >
      <span className={`${isActive ? 'text-blue-900' : 'text-blue-300 group-hover:text-white'} transition-colors`}>{icon}</span>
      <span className="tracking-tight">{label}</span>
    </Link>
  );
};

const Login: React.FC<{ onLogin: (id: string, name: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a8a] p-6">
      <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md border border-white/10">
        <div className="text-center mb-10">
          <div className="bg-yellow-400 w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-blue-900 mx-auto mb-6 shadow-2xl shadow-yellow-400/20">
            <BookOpen size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">ELC Teacher Portal</h2>
          <p className="text-slate-500 font-medium mt-1">Pharos University Alexandria</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if(name && id) onLogin(id, name); }} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic ID</label>
            <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium" placeholder="Staff ID Number" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium" placeholder="Staff Name" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 mt-4 transition-all active:scale-[0.98]">Enter Library System</button>
        </form>
      </div>
    </div>
  );
};

export default App;
