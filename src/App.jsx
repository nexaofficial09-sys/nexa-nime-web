import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, Home as HomeIcon, Calendar, Compass, Bell, User } from 'lucide-react';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Stream from './pages/Stream';
import SearchPage from './pages/Search';
import Schedule from './pages/Schedule';
import Random from './pages/Random';
import Explorer from './pages/Explorer';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Legal from './pages/Legal';
import ListCategory from './pages/ListCategory';
import Notifications from './pages/Notifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import NotificationDropdown from './components/NotificationDropdown';
import logo from './assets/logo.png';

const MARQUEE_MESSAGES = [
  "Selamat datang di NEXA Nime! Tempat terbaik untuk menonton anime favoritmu dengan subtitle Indonesia. Update setiap hari!",
  "Jangan lupa untuk bergabung dengan server Discord komunitas kami untuk berdiskusi dengan sesama pecinta anime!",
  "NEXA Nime - Platform streaming anime sub Indo dengan kualitas resolusi tertinggi (HD). Bookmark sekarang juga!",
  "Sedang mencari tontonan seru musim ini? Cek bagian Anime Populer di beranda untuk rekomendasi terbaik!",
  "Bantu dan dukung server kami agar terus berjalan dengan berdonasi melalui platform Saweria!",
  "Mulai dari judul lawas hingga rilisan episode terbaru hari ini, semuanya tersedia lengkap hanya di NEXA Nime!",
  "Jangan sampai ketinggalan jadwal! Cek jadwal rilis mingguan dan tunggu kehadiran serial favoritmu!"
];

function Layout({ children }) {
  const [keyword, setKeyword] = useState('');
  const [marqueeText, setMarqueeText] = useState(MARQUEE_MESSAGES[0]);
  const [liveResults, setLiveResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthMobileOpen, setIsAuthMobileOpen] = useState(false);
  const { user } = useAuth();
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItemBase = "inline-flex items-center justify-center px-4 pt-[6px] pb-[2px] transition-all duration-150 rounded-md font-extrabold";
  const navItemActive = "bg-white border-[2px] border-[#1a202c] shadow-[0_4px_0_0_#1a202c] text-[#1a202c] active:shadow-none active:translate-y-[4px]";
  const navItemInactive = "border-[2px] border-transparent text-[#1a202c] hover:text-white";

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowDropdown(false);
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  React.useEffect(() => {
    const randomMsg = MARQUEE_MESSAGES[Math.floor(Math.random() * MARQUEE_MESSAGES.length)];
    setMarqueeText(randomMsg);
  }, [location.pathname]);

  React.useEffect(() => {
    const fetchLiveSearch = async () => {
      if (!keyword.trim()) {
        setLiveResults([]);
        setShowDropdown(false);
        setIsTyping(false);
        return;
      }
      setIsTyping(true);
      setShowDropdown(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/search?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLiveResults((data.data?.movie || []).slice(0, 4));
      } catch (err) {
        console.error(err);
        setLiveResults([]);
      } finally {
        setIsTyping(false);
      }
    };

    const debounceTimer = setTimeout(fetchLiveSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [keyword]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex-col relative z-50">
        {/* Main Header */}
        <div className="bg-white border-b-[3px] border-[#1a202c]">
          <div className="max-w-[1500px] mx-auto px-4 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logo} alt="NEXA Nime Logo" className="h-[28px] sm:h-[34px] md:h-[34px] w-auto object-contain" />
            </Link>

            {/* Search Bar */}
            <div className="relative" ref={dropdownRef}>
              <form onSubmit={handleSearch} className="flex items-center gap-1 sm:gap-2">
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    if (e.target.value.trim()) setShowDropdown(true);
                  }}
                  onFocus={() => { if (keyword.trim()) setShowDropdown(true); }}
                  placeholder="Cari Anime..." 
                  className="w-[200px] sm:w-[260px] md:w-[320px] bg-white px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] md:text-[15px] font-bold text-[#1a202c] focus:outline-none placeholder:text-slate-500 border-[2px] border-[#1a202c] rounded-[0.4em] shadow-[2px_3px_0_0_#1a202c]"
                />
                <button type="submit" className="btn-cari-3d text-[12px] sm:text-[14px] md:text-[15px] px-3 sm:px-5 py-[0.55em]">
                  CARI
                </button>
              </form>
              
              {/* Live Search Dropdown */}
              {showDropdown && keyword.trim() && (
                <div className="absolute top-[calc(100%+8px)] right-0 md:left-0 md:right-auto w-[300px] md:w-full bg-white border-[3px] border-[#1a202c] rounded-md shadow-[4px_4px_0_0_#1a202c] z-[60] flex flex-col overflow-hidden">
                    {isTyping ? (
                        <div className="p-4 text-center font-bold text-slate-500 text-sm">Mencari...</div>
                    ) : liveResults.length > 0 ? (
                        <>
                            {liveResults.map((anime, i) => (
                                <Link 
                                    key={i} 
                                    to={`/anime/${anime.id}`}
                                    onClick={() => { setShowDropdown(false); setKeyword(''); }}
                                    className={`flex gap-3 p-3 hover:bg-slate-100 transition-colors ${i !== liveResults.length - 1 ? 'border-b-[2px] border-[#1a202c]' : ''}`}
                                >
                                    <img 
                                        src={`http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(anime.thumbnail || anime.image || anime.image_poster || '')}`} 
                                        alt={anime.title} 
                                        className="w-12 h-16 object-cover border-[2px] border-[#1a202c] rounded-sm flex-shrink-0 bg-zinc-200"
                                    />
                                    <div className="flex flex-col justify-center min-w-0">
                                        <h4 className="font-bold text-[#1a202c] text-[14px] leading-tight line-clamp-1 mb-1">{anime.title}</h4>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold mb-1">
                                            <span className="bg-[#00d4ff] text-[#1a202c] px-1.5 py-0.5 border-[1.5px] border-[#1a202c] rounded-[4px] leading-none uppercase">{anime.type || 'SERIES'}</span>
                                            <span className="text-slate-600">Likes: <span className="text-[#e50914]">{anime.favorites ? Number(anime.favorites).toLocaleString('en-US') : 0}</span></span>
                                            <span className="text-slate-600">{anime.views ? Number(anime.views).toLocaleString('en-US') : 0} Views</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 line-clamp-1 font-semibold">{anime.genre || (anime.genres ? anime.genres.join(', ') : '')}</p>
                                    </div>
                                </Link>
                            ))}
                            <button 
                                onClick={handleSearch}
                                className="w-full bg-[#1d8deb] hover:bg-blue-600 text-white font-extrabold text-[12px] py-2 border-t-[3px] border-[#1a202c] transition-colors flex items-center justify-center gap-1"
                            >
                                LIHAT SEMUA HASIL <span className="text-[14px]">→</span>
                            </button>
                        </>
                    ) : (
                        <div className="p-4 text-center font-bold text-slate-500 text-sm">Tidak ada hasil ditemukan.</div>
                    )}
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Navbar (Cyan) */}
        <div className="hidden md:block bg-[#00d4ff] border-b-[3px] border-[#1a202c]">
          <div className="max-w-[1500px] mx-auto px-4 flex items-center justify-between pt-1 pb-0.5">
            
            <nav className="flex items-center gap-2 overflow-x-auto text-[14px] tracking-wide text-[#1a202c] pb-1.5 flex-grow" style={{scrollbarWidth: 'none'}}>
              <Link 
                to="/" 
                className={`${navItemBase} ${location.pathname === '/' ? navItemActive : navItemInactive}`}
              >
                HOME
              </Link>
              <Link 
                to="/jadwal" 
                className={`${navItemBase} ${location.pathname === '/jadwal' ? navItemActive : navItemInactive}`}
              >
                JADWAL RILIS
              </Link>
              <Link 
                to="/explorer" 
                className={`${navItemBase} ${location.pathname === '/explorer' ? navItemActive : navItemInactive}`}
              >
                EXPLORER
              </Link>
            </nav>

            <div className="flex items-center flex-shrink-0 pb-1.5 pl-2 sm:pl-4 border-l-[2px] border-[#1a202c]/20 ml-2">
              <UserArea />
            </div>

          </div>
        </div>

        {/* Action & Marquee Bar */}
        <div className="bg-white border-b-[2px] border-[#1a202c]/20 py-2 sm:py-2.5">
          <div className="max-w-[1500px] mx-auto px-4 flex flex-col md:flex-row items-stretch gap-2 md:gap-4">
            
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto pb-1 md:pb-0" style={{scrollbarWidth: 'none'}}>
              <a href="https://wa.me/6285793644998" target="_blank" rel="noopener noreferrer" className="group bg-[#1a202c] rounded-md block flex-shrink-0 mt-1">
                <span className="bg-[#2ecc71] group-hover:brightness-110 text-white font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[13px] rounded-md border-[2px] border-[#1a202c] flex items-center whitespace-nowrap transform -translate-y-[3px] group-hover:-translate-y-[4px] group-active:translate-y-0 transition-transform duration-150">
                  <svg viewBox="0 0 448 512" width="12" height="12" fill="currentColor" className="inline-block mr-1.5 sm:w-[14px] sm:h-[14px]"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.7c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                  WA Admin
                </span>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb8N9Ko1Xquf4AEgd22J" target="_blank" rel="noopener noreferrer" className="group bg-[#1a202c] rounded-md block flex-shrink-0 mt-1">
                <span className="bg-[#1abc9c] group-hover:brightness-110 text-white font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[13px] rounded-md border-[2px] border-[#1a202c] flex items-center whitespace-nowrap transform -translate-y-[3px] group-hover:-translate-y-[4px] group-active:translate-y-0 transition-transform duration-150">
                  <svg viewBox="0 0 448 512" width="12" height="12" fill="currentColor" className="inline-block mr-1.5 sm:w-[14px] sm:h-[14px]"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.7c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                  Saluran
                </span>
              </a>
              <a href="https://saweria.co/NEXAOfficial" target="_blank" rel="noopener noreferrer" className="group bg-[#1a202c] rounded-md block flex-shrink-0 mt-1">
                <span className="bg-[#f1c40f] group-hover:brightness-110 text-white font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[13px] rounded-md border-[2px] border-[#1a202c] flex items-center whitespace-nowrap transform -translate-y-[3px] group-hover:-translate-y-[4px] group-active:translate-y-0 transition-transform duration-150">
                  <svg viewBox="0 0 640 512" width="13" height="13" fill="currentColor" className="inline-block mr-1.5 sm:w-[16px] sm:h-[16px]"><path d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-26.6 0-48.3-21.7-48.3-48.3s21.7-48.3 48.3-48.3h543.4c26.6 0 48.3 21.7 48.3 48.3s-21.7 48.3-48.3 48.3z"/></svg>
                  Saweria
                </span>
              </a>
            </div>

            {/* Marquee */}
            <div className="hidden md:flex flex-1 bg-white border-[2px] border-[#1a202c] rounded-md shadow-[2px_3px_0_0_#1a202c] overflow-hidden items-center py-1.5 md:py-0 md:h-[34px]">
              <marquee className="text-[13px] sm:text-[14px] font-bold text-[#1a202c] tracking-wide">
                {marqueeText}
              </marquee>
            </div>

          </div>
        </div>

      </header>

      <main className="max-w-[1500px] mx-auto px-4 pt-6 pb-32 md:pb-48 flex-grow w-full">
        {children}
      </main>
      
      <footer className="bg-white border-t-[3px] border-[#1a202c] mt-auto relative overflow-hidden pb-16 md:pb-0">
         <div className="max-w-[1500px] mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              
              {/* Brand & Detail (Col 1-2) */}
              <div className="md:col-span-2 pr-0 md:pr-10 mb-2 md:mb-0">
                 <img src={logo} alt="NEXA Nime Logo" className="h-[30px] w-auto object-contain mb-3" />
                 <p className="font-sans font-extrabold text-[#1a202c] text-[13px] mb-2 uppercase tracking-tight">Platform Streaming Anime Terlengkap</p>
                 <p className="font-sans font-medium text-[11px] sm:text-[12px] text-slate-600 leading-relaxed">
                   Destinasi utama streaming anime subtitle Indonesia. Nikmati ribuan koleksi anime berkualitas tinggi (HD) secara gratis dengan pembaruan episode super cepat dan antarmuka yang bersih dari gangguan.
                 </p>
              </div>

              <div className="md:col-span-2 flex flex-col items-start md:items-end">
                  {/* Tautan Berguna */}
                  <div className="w-full md:w-auto">
                     <h4 className="font-sans font-extrabold text-[11px] sm:text-[12px] text-[#1a202c] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#e50914] rounded-full inline-block border border-[#1a202c]"></span> Tautan Berguna
                     </h4>
                     <ul className="flex flex-col gap-2 text-[11px] sm:text-[12px] font-bold text-slate-600">
                       <li><Link to="/" className="hover:text-[#00d4ff] hover:underline underline-offset-4 transition-all">Beranda</Link></li>
                       <li><Link to="/jadwal" className="hover:text-[#00d4ff] hover:underline underline-offset-4 transition-all">Jadwal Rilis</Link></li>
                       <li><Link to="/explorer?sort=popular" className="hover:text-[#00d4ff] hover:underline underline-offset-4 transition-all">Anime Populer</Link></li>
                       <li><a href="https://wa.me/6285793644998" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d4ff] hover:underline underline-offset-4 transition-all">Request Anime</a></li>
                     </ul>
                  </div>
              </div>

            </div>
            
            <div className="border-t-[2px] border-[#1a202c] pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-[10px] font-extrabold text-[#1a202c] uppercase tracking-wider text-center">© 2026 NEXA NIME. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-3 sm:gap-4 text-[10px] font-extrabold text-[#1a202c] uppercase tracking-wider">
                <Link to="/legal/tos" className="hover:text-[#00d4ff] transition-colors">Terms of Service</Link>
                <Link to="/legal/privacy" className="hover:text-[#00d4ff] transition-colors">Privacy Policy</Link>
                <Link to="/legal/dmca" className="hover:text-[#00d4ff] transition-colors">DMCA</Link>
              </div>
            </div>
         </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
          {/* Raised Center Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[20px] z-10">
              <Link to="/explorer" className="bg-[#1a202c] rounded-2xl block">
                  <div className={`flex items-center justify-center w-[56px] h-[56px] rounded-2xl border-[3px] border-[#1a202c] transition-all duration-100 -translate-y-[4px] active:translate-y-0 ${
                      location.pathname === '/explorer' ? 'bg-[#a855f7] text-white' : 'bg-[#00d4ff] text-[#1a202c]'
                  }`}>
                      <Compass size={26} strokeWidth={3} />
                  </div>
              </Link>
          </div>

          {/* Bar */}
          <div className="bg-white border-t-[3px] border-[#1a202c] rounded-t-2xl px-4 h-[60px] flex items-center justify-between">
              <Link to="/" className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${location.pathname === '/' ? 'text-[#a855f7]' : 'text-[#1a202c]'}`}>
                  <HomeIcon size={22} strokeWidth={location.pathname === '/' ? 3 : 2.5} />
                  <span className="text-[9px] font-extrabold tracking-tight uppercase">Home</span>
              </Link>

              <Link to="/jadwal" className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${location.pathname === '/jadwal' ? 'text-[#a855f7]' : 'text-[#1a202c]'}`}>
                  <Calendar size={22} strokeWidth={location.pathname === '/jadwal' ? 3 : 2.5} />
                  <span className="text-[9px] font-extrabold tracking-tight uppercase">Jadwal</span>
              </Link>

              {/* Spacer */}
              <div className="w-14"></div>

              <NotificationDropdown mobileMode={true} />

              {user ? (
                  <Link to="/profile" className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${location.pathname === '/profile' ? 'text-[#a855f7]' : 'text-[#1a202c]'}`}>
                      <User size={22} strokeWidth={location.pathname === '/profile' ? 3 : 2.5} />
                      <span className="text-[9px] font-extrabold tracking-tight uppercase">Profil</span>
                  </Link>
              ) : (
                  <button onClick={() => setIsAuthMobileOpen(true)} className="flex flex-col items-center justify-center w-14 gap-0.5 text-[#1a202c] transition-colors">
                      <User size={22} strokeWidth={2.5} />
                      <span className="text-[9px] font-extrabold tracking-tight uppercase">Profil</span>
                  </button>
              )}
          </div>
      </nav>
      
      <AuthModal isOpen={isAuthMobileOpen} onClose={() => setIsAuthMobileOpen(false)} />
    </div>
  );
}

function UserArea() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (loading) return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse border-[2px] border-[#1a202c]"></div>;

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationDropdown />
        {user ? (
          <>
            {user.is_admin && (
              <Link to="/admin" className="hidden sm:flex items-center gap-1.5 bg-[#00d4ff] border-[2px] border-[#1a202c] rounded-md py-1 px-3 shadow-[2px_2px_0_0_#1a202c] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_0_#1a202c] transition-all font-extrabold text-[#1a202c] text-xs uppercase">
                Dasbor
              </Link>
            )}
            <Link to="/profile" className="flex items-center gap-2 bg-[#ffde00] border-[2px] border-[#1a202c] rounded-md py-1 px-2 sm:px-3 shadow-[2px_2px_0_0_#1a202c] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_0_#1a202c] transition-all">
              <img 
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}&backgroundColor=b6e3f4`}
                alt="Avatar"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[1.5px] border-[#1a202c] bg-white object-cover"
              />
              <span className="hidden sm:inline font-extrabold text-[#1a202c] text-xs uppercase max-w-[80px] truncate">{user.display_name || user.username}</span>
            </Link>
          </>
        ) : (
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="bg-[#1a202c] text-white hover:bg-[#00d4ff] hover:text-[#1a202c] font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-1.5 border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all rounded-md uppercase tracking-wider flex items-center gap-1.5"
          >
            <User size={14} className="stroke-[3px]" />
            Masuk
          </button>
        )}
      </div>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jadwal" element={<Schedule />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/random" element={<Random />} />
            <Route path="/anime/:id" element={<Detail />} />
            <Route path="/stream/:id" element={<Stream />} />
            <Route path="/legal/:type" element={<Legal />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/list/:category" element={<ListCategory />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
