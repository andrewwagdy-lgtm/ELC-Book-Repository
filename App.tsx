
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Book, CheckoutRecord, User } from './types';
import { INITIAL_BOOKS } from './constants';
import Inventory from './pages/Inventory';
import AdminDashboard from './pages/AdminDashboard';
import LibrarianAI from './pages/LibrarianAI';
import { BookOpen, Users, BrainCircuit, LayoutDashboard, LogOut } from 'lucide-react';

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
    dueDate.setDate(dueDate.getDate() + 30); // 30 days for teachers

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
        <nav className="w-full md:w-64 bg-[#1e3a8a] text-white flex flex-col shadow-xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-yellow-400 p-1.5 rounded-lg text-blue-900"><BookOpen size={24} /></span>
              <span>ELC Library</span>
            </h1>
            <p className="text-blue-200 text-xs mt-1 font-medium tracking-wide uppercase">Teacher Resource Center</p>
          </div>

          <div className="flex-1 px-4 space-y-2 py-4">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Book Inventory" />
            <NavLink to="/admin" icon={<Users size={20} />} label="Teacher Loans" />
            <NavLink to="/ai" icon={<BrainCircuit size={20} />} label="Pedagogy Assistant" />
          </div>

          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-blue-300">Staff Administrator</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-blue-800 rounded-lg text-blue-300 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Inventory books={books} onCheckout={handleCheckout} onReturn={handleReturn} />} />
            <Route path="/admin" element={<AdminDashboard records={records} books={books} onReturn={handleReturn} />} />
            <Route path="/ai" element={<LibrarianAI books={books} />} />
          </Routes>
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-yellow-400 text-blue-900 font-semibold shadow-lg' 
          : 'text-blue-100 hover:bg-blue-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Login: React.FC<{ onLogin: (id: string, name: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-900 mx-auto mb-4 shadow-lg">
            <BookOpen size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">ELC Teacher Portal</h2>
          <p className="text-slate-500">Pharos University Alexandria</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if(name && id) onLogin(id, name); }} className="space-y-4">
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Staff ID Number" required />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Staff Full Name" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 transition-transform active:scale-95">Enter Library System</button>
        </form>
      </div>
    </div>
  );
};

export default App;
