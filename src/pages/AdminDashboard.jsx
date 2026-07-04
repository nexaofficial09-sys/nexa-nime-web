import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Trash2, Users, Film, Plus, Play, Info, Bell, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, fetchNotifications } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'anime' or 'notif'
  
  // Users Tab
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  // Notification Tab
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', expires_in_days: '7' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [activeNotifs, setActiveNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Anime Tab
  const [animeList, setAnimeList] = useState([]);
  const [loadingAnime, setLoadingAnime] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null); // For adding episodes
  const [editingAnimeId, setEditingAnimeId] = useState(null); // null = add mode, id = edit mode

  // Form states
  const [animeForm, setAnimeForm] = useState({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '', total_episodes: '', aired_start: '', aired_end: '', source: 'MyAnimeList', category_name: 'NEXA ORIGINALS' });
  const [epForm, setEpForm] = useState({ episode_number: '', video_url_1080p: '', video_url_720p: '', video_url_480p: '' });
  const [animeEpisodes, setAnimeEpisodes] = useState([]);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'anime') fetchAnime();
    if (activeTab === 'notif') fetchActiveNotifs();
  }, [user, activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/users`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) { console.error(err); }
    setLoadingUsers(false);
  };

  const fetchAnime = async () => {
    setLoadingAnime(true);
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/anime`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAnimeList(data.anime);
    } catch (err) { console.error(err); }
    setLoadingAnime(false);
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Yakin ingin menghapus pengguna ${username}?`)) return;
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        showToast(`Pengguna ${username} berhasil dihapus!`);
      } else {
        showToast("Gagal menghapus pengguna", "error");
      }
    } catch (err) { 
      console.error(err);
      showToast("Terjadi kesalahan", "error");
    }
  };

  const fetchActiveNotifs = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/notifications`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setActiveNotifs(data.notifications);
    } catch (err) { console.error(err); }
    setLoadingNotifs(false);
  };

  const handleDeleteNotif = async (notifId) => {
    if (!window.confirm(`Yakin ingin menghapus notifikasi ini?`)) return;
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/notification/${notifId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        fetchActiveNotifs();
        if (fetchNotifications) fetchNotifications();
        showToast("Notifikasi berhasil dihapus!");
      } else {
        showToast("Gagal menghapus notifikasi", "error");
      }
    } catch (err) { 
      console.error(err);
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) {
      showToast("Judul dan pesan wajib diisi!", "error");
      return;
    }
    setSendingNotif(true);
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifForm),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast("Notifikasi global berhasil dikirim!");
        setNotifForm({ title: '', message: '', type: 'info', expires_in_days: '7' });
        fetchActiveNotifs();
        if (fetchNotifications) fetchNotifications();
      } else {
        showToast(data.message || "Gagal mengirim notifikasi", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan.", "error");
    }
    setSendingNotif(false);
  };

      const [malUrl, setMalUrl] = useState('');
    const [fetchingMal, setFetchingMal] = useState(false);

    const fetchFromMAL = async () => {
        if (!malUrl) return;
        const match = malUrl.match(/anime\/(\d+)/);
        if (!match) {
            alert('Tautan MyAnimeList tidak valid. Harus mengandung /anime/ID');
            return;
        }
        const id = match[1];
        setFetchingMal(true);
        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`).then(r => r.json());
            if (res.data) {
                const d = res.data;
                setAnimeForm({
                    ...animeForm,
                    title: d.title || '',
                    description: d.synopsis ? d.synopsis.split('[Written by MAL')[0].trim() : '',
                    type: d.type ? d.type.toUpperCase() : 'SERIES',
                    poster_url: d.images?.jpg?.large_image_url || '',
                    status: d.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
                    mal_score: d.score ? d.score.toString() : '',
                    year: d.year ? d.year.toString() : '',
                    genres: d.genres ? d.genres.map(g => g.name).join(', ') : '',
                    duration: d.duration || '',
                    studio: d.studios && d.studios.length > 0 ? d.studios[0].name : '',
                    total_episodes: d.episodes ? d.episodes.toString() : '',
                    aired_start: d.aired?.from ? d.aired.from.split('T')[0] : '',
                    aired_end: d.aired?.to ? d.aired.to.split('T')[0] : '',
                    source: 'MyAnimeList'
                });
            } else {
                alert('Anime tidak ditemukan di MAL');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal mengambil data dari MAL');
        }
        setFetchingMal(false);
    };

    const translateSynopsis = async () => {
        if (!animeForm.description) return;
        try {
            const res = await fetch(`http://103.30.195.243:5000/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: animeForm.description })
            });
            const data = await res.json();
            if (data.success && data.translated) {
                setAnimeForm({...animeForm, description: data.translated});
            } else {
                alert('Gagal menerjemahkan.');
            }
        } catch (err) {
            console.error("Translation error", err);
            alert("Gagal menerjemahkan.");
        }
    };

    const handleAddAnime = async (e) => {
    e.preventDefault();
    try {
      const isEdit = editingAnimeId !== null;
      const url = isEdit 
        ? `http://103.30.195.243:5000/api/admin/anime/${editingAnimeId}` 
        : `http://103.30.195.243:5000/api/admin/anime`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animeForm),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setEditingAnimeId(null);
        setAnimeForm({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '', total_episodes: '', aired_start: '', aired_end: '', source: 'MyAnimeList', category_name: 'NEXA ORIGINALS' });
        fetchAnime();
      }
    } catch (err) { console.error(err); }
  };

  const openEditAnime = (a) => {
    setEditingAnimeId(a.id.replace('local_', ''));
    setAnimeForm({
      title: a.title || '',
      description: a.description || '',
      type: a.type || 'SERIES',
      status: a.status || 'Ongoing',
      poster_url: a.poster_url || '',
      mal_score: a.mal_score || '',
      year: a.year || '',
      genres: a.genres || '',
      duration: a.duration || '',
      studio: a.studio || '',
      total_episodes: a.total_episodes || '',
      aired_start: a.aired_start || '',
      aired_end: a.aired_end || '',
      source: a.source || 'MyAnimeList',
      category_name: a.category_name || 'NEXA ORIGINALS'
    });
    const standardCats = ['NEXA ORIGINALS', 'ANIME MOVIE', 'EPISODE BARU', 'SEDANG HANGAT', 'JUDUL BARU', 'ANIME SERIES', 'ANIME POPULER', 'PALING DI NANTI'];
    if (a.category_name && !standardCats.includes(a.category_name)) {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }
    setShowAddModal(true);
  };

  const handleDeleteAnime = (id) => {
    setConfirmModal({
        isOpen: true,
        message: "Hapus anime ini dan semua episodenya?",
        onConfirm: async () => {
            try {
              const dbId = id.replace('local_', '');
              const res = await fetch(`http://103.30.195.243:5000/api/admin/anime/${dbId}`, { method: 'DELETE', credentials: 'include' });
              const data = await res.json();
              if (data.success) fetchAnime();
            } catch (err) { console.error(err); }
        }
    });
  };

  const openEpisodes = async (anime) => {
    setSelectedAnime(anime);
    fetchEpisodes(anime.id.replace('local_', ''));
  };

  const fetchEpisodes = async (id) => {
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/anime/${id}/episodes`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAnimeEpisodes(data.episodes);
    } catch (err) { console.error(err); }
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    const dbId = selectedAnime.id.replace('local_', '');
    
    // Helper to extract src if user pastes an iframe tag
    const extractUrl = (url) => {
        if (!url) return '';
        let finalUrl = url.trim();
        if (finalUrl.toLowerCase().includes('<iframe') && finalUrl.includes('src=')) {
            const match = finalUrl.match(/src=["'](.*?)["']/);
            if (match && match[1]) {
                finalUrl = match[1];
            }
        }
        return finalUrl;
    };
    
    let resolutions = [];
    const url1080 = extractUrl(epForm.video_url_1080p);
    const url720 = extractUrl(epForm.video_url_720p);
    const url480 = extractUrl(epForm.video_url_480p);
    
    if (url480) resolutions.push({ quality: '480p', url: url480 });
    if (url720) resolutions.push({ quality: '720p', url: url720 });
    if (url1080) resolutions.push({ quality: '1080p', url: url1080 });
    
    if (resolutions.length === 0) {
        showToast("Minimal isi satu URL Video!", "error");
        return;
    }
    
    const finalUrl = JSON.stringify(resolutions);

    try {
      const res = await fetch(`http://103.30.195.243:5000/api/admin/anime/${dbId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode_number: epForm.episode_number, video_url: finalUrl }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setEpForm({ episode_number: '', video_url_1080p: '', video_url_720p: '', video_url_480p: '' });
        fetchEpisodes(dbId);
        showToast("Episode berhasil ditambahkan!");
      }
    } catch (err) { 
      console.error(err);
      showToast("Gagal menambahkan episode", "error");
    }
  };

  const handleDeleteEpisode = (epId) => {
    setConfirmModal({
        isOpen: true,
        message: "Hapus episode ini?",
        onConfirm: async () => {
            try {
              const res = await fetch(`http://103.30.195.243:5000/api/admin/episode/${epId}`, { method: 'DELETE', credentials: 'include' });
              if ((await res.json()).success) {
                fetchEpisodes(selectedAnime.id.replace('local_', ''));
                fetchAnime();
              }
            } catch (err) { console.error(err); }
        }
    });
  };

  if (!user || !user.is_admin) return null;

  return (
    <>
      <div className="w-full">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border-[3px] border-[#1a202c] rounded-md shadow-[4px_4px_0_0_#1a202c] overflow-hidden">
            <div className="bg-[#00d4ff] px-4 py-4 border-b-[3px] border-[#1a202c] flex items-center gap-3">
              <Shield size={24} className="fill-white" />
              <h1 className="text-lg font-black uppercase tracking-tight text-[#1a202c]">DASBOR ADMIN</h1>
            </div>
            
            {/* Tabs */}
            <div className="flex flex-col p-3 gap-2 bg-gray-50">
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full py-3 px-4 font-bold uppercase tracking-wide border-[3px] border-[#1a202c] rounded transition-all flex items-center justify-start gap-3 ${activeTab === 'users' ? 'bg-[#ffde00] text-[#1a202c] shadow-[2px_2px_0_0_#1a202c] translate-x-1' : 'bg-white text-slate-500 hover:bg-gray-100 hover:shadow-[2px_2px_0_0_#1a202c]'}`}
              >
                <Users size={18} /> Pengguna
              </button>
              <button 
                onClick={() => setActiveTab('anime')}
                className={`w-full py-3 px-4 font-bold uppercase tracking-wide border-[3px] border-[#1a202c] rounded transition-all flex items-center justify-start gap-3 ${activeTab === 'anime' ? 'bg-[#ffde00] text-[#1a202c] shadow-[2px_2px_0_0_#1a202c] translate-x-1' : 'bg-white text-slate-500 hover:bg-gray-100 hover:shadow-[2px_2px_0_0_#1a202c]'}`}
              >
                <Film size={18} /> Anime Lokal
              </button>
              <button 
                onClick={() => setActiveTab('notif')}
                className={`w-full py-3 px-4 font-bold uppercase tracking-wide border-[3px] border-[#1a202c] rounded transition-all flex items-center justify-start gap-3 ${activeTab === 'notif' ? 'bg-[#ffde00] text-[#1a202c] shadow-[2px_2px_0_0_#1a202c] translate-x-1' : 'bg-white text-slate-500 hover:bg-gray-100 hover:shadow-[2px_2px_0_0_#1a202c]'}`}
              >
                <Bell size={18} /> Notif Global
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white border-[3px] border-[#1a202c] rounded-md shadow-[4px_4px_0_0_#1a202c] overflow-hidden min-h-[600px]">
            <div className="p-6 sm:p-8">
          {activeTab === 'notif' && (
            <div className="w-full space-y-8">
              
              <div className="bg-[#f2f8ff] border-[3px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#ffde00] p-2 rounded-full border-[2px] border-[#1a202c]">
                    <Bell size={20} className="text-[#1a202c]" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#1a202c]">Notifikasi Global</h2>
                </div>
                <p className="text-[#1a202c] font-bold text-[11px] bg-white inline-block px-2 py-1 mb-5 border-[2px] border-[#1a202c] rounded shadow-[1px_1px_0_0_#1a202c]">📢 Akan tampil di semua layar (Login & Guest).</p>
                
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase mb-1.5 text-[#1a202c]">Judul Pengumuman</label>
                      <input type="text" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} className="w-full p-2 font-bold text-sm border-[2px] border-[#1a202c] rounded focus:outline-none focus:ring-2 ring-[#00d4ff]/50 shadow-[2px_2px_0_0_#1a202c] transition-all" placeholder="Contoh: Maintenance Server!" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase mb-1.5 text-[#1a202c]">Warna Tipe</label>
                      <select value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value})} className="w-full p-2 font-bold text-sm border-[2px] border-[#1a202c] rounded focus:outline-none focus:ring-2 ring-[#00d4ff]/50 shadow-[2px_2px_0_0_#1a202c] appearance-none cursor-pointer bg-white">
                        <option value="info">Biru (Info)</option>
                        <option value="success">Hijau (Sukses)</option>
                        <option value="warning">Kuning (Warning)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase mb-1.5 text-[#1a202c]">Isi Pesan Detail</label>
                      <textarea value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} className="w-full p-2 font-bold text-sm border-[2px] border-[#1a202c] rounded focus:outline-none focus:ring-2 ring-[#00d4ff]/50 shadow-[2px_2px_0_0_#1a202c] h-[88px] resize-none transition-all" placeholder="Tuliskan isi pesan selengkapnya..." required></textarea>
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-[11px] font-black uppercase mb-1.5 text-[#1a202c]">Hapus Otomatis</label>
                      <select value={notifForm.expires_in_days} onChange={e => setNotifForm({...notifForm, expires_in_days: e.target.value})} className="w-full p-2 font-bold text-sm border-[2px] border-[#1a202c] rounded focus:outline-none focus:ring-2 ring-[#00d4ff]/50 shadow-[2px_2px_0_0_#1a202c] appearance-none cursor-pointer bg-white mb-4">
                        <option value="1">1 Hari</option>
                        <option value="2">2 Hari</option>
                        <option value="3">3 Hari</option>
                        <option value="7">7 Hari</option>
                        <option value="">Selamanya</option>
                      </select>
                      
                      <button type="submit" disabled={sendingNotif} className="w-full mt-auto bg-[#00d4ff] text-[#1a202c] font-black text-[12px] uppercase tracking-wider py-2.5 border-[2px] border-[#1a202c] rounded shadow-[3px_3px_0_0_#1a202c] hover:bg-[#33dfff] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        <Send size={16} /> {sendingNotif ? 'MENGIRIM...' : 'SIARKAN'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <h2 className="text-2xl font-black mb-6 uppercase border-b-[4px] border-[#1a202c] inline-block pb-1">Daftar Pengumuman Aktif</h2>
                {loadingNotifs ? (
                  <div className="flex items-center gap-3 font-bold text-lg text-slate-500 animate-pulse">
                     <span className="w-4 h-4 rounded-full bg-slate-400"></span> Memuat...
                  </div>
                ) : activeNotifs.length === 0 ? (
                  <div className="bg-gray-50 border-[3px] border-dashed border-gray-300 rounded-lg p-10 text-center">
                    <p className="font-black text-2xl text-gray-400 uppercase tracking-widest">Kosong</p>
                    <p className="font-bold text-gray-500 mt-2">Belum ada pengumuman yang sedang tayang.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeNotifs.map(n => (
                      <div key={n.id} className="relative bg-white border-[2px] border-[#1a202c] rounded-md shadow-[3px_3px_0_0_#1a202c] overflow-hidden flex flex-col p-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#1a202c] transition-all">
                        <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${n.type === 'info' ? 'bg-[#00d4ff]' : n.type === 'success' ? 'bg-[#1abc9c]' : 'bg-[#ffde00]'} border-r-[2px] border-[#1a202c]`}></div>
                        <div className="pl-4">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h3 className="font-black text-sm leading-tight text-[#1a202c] truncate">{n.title}</h3>
                            <button onClick={() => handleDeleteNotif(n.id)} className="shrink-0 bg-[#ff3366] text-white p-1 rounded border-[2px] border-[#1a202c] shadow-[1px_1px_0_0_#1a202c] hover:bg-[#ff1a53] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all" title="Hapus">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="font-bold text-xs text-gray-600 mb-2 line-clamp-1">{n.message}</p>
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border-[1.5px] border-[#1a202c] shadow-[1px_1px_0_0_#1a202c] ${n.type === 'info' ? 'bg-[#00d4ff]' : n.type === 'success' ? 'bg-[#1abc9c] text-white' : 'bg-[#ffde00]'}`}>
                              {n.type === 'info' ? 'ℹ️ INFO' : n.type === 'success' ? '✅ SUKSES' : '⚠️ WARNING'}
                            </span>
                            {n.expires_at ? (
                               <span className="text-[9px] font-black px-2 py-0.5 rounded border-[1.5px] border-[#1a202c] bg-slate-100 shadow-[1px_1px_0_0_#1a202c]">⏳ HINGGA: {new Date(n.expires_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                            ) : (
                               <span className="text-[9px] font-black px-2 py-0.5 rounded border-[1.5px] border-[#1a202c] bg-slate-100 shadow-[1px_1px_0_0_#1a202c]">♾️ PERMANEN</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4 uppercase">Daftar Pengguna</h2>
              {loadingUsers ? <p>Memuat pengguna...</p> : (
                <div className="overflow-x-auto border-[2px] border-[#1a202c] rounded-md shadow-[3px_3px_0_0_#1a202c]">
                  <table className="w-full text-left">
                    <thead className="bg-[#1a202c] text-white">
                      <tr>
                        <th className="p-3 uppercase font-black text-xs tracking-wide">ID</th>
                        <th className="p-3 uppercase font-black text-xs tracking-wide">Username</th>
                        <th className="p-3 uppercase font-black text-xs tracking-wide">Role / Pangkat</th>
                        <th className="p-3 uppercase font-black text-xs tracking-wide">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b-[2px] border-[#1a202c] last:border-b-0 hover:bg-gray-50">
                          <td className="p-3 font-bold">#{u.id}</td>
                          <td className="p-3 font-bold">{u.username} {u.is_admin && <span className="ml-2 bg-[#ffde00] text-[#1a202c] text-[10px] px-2 py-0.5 rounded-full uppercase">Admin</span>}</td>
                          <td className="p-3 font-bold">{u.role}</td>
                          <td className="p-3">
                            <button disabled={u.is_admin} onClick={() => handleDeleteUser(u.id, u.username)} className="bg-[#ff3366] text-white p-2 rounded hover:-translate-y-0.5 transition-transform border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] disabled:opacity-50">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === 'anime' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold uppercase">Daftar Anime Lokal</h2>
                <button onClick={() => { setEditingAnimeId(null); setAnimeForm({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '', total_episodes: '', aired_start: '', aired_end: '', source: 'MyAnimeList', category_name: 'NEXA ORIGINALS' }); setIsCustomCategory(false); setShowAddModal(true); }} className="bg-[#00d4ff] text-[#1a202c] font-black uppercase tracking-wide px-4 py-2 border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] rounded flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                  <Plus size={18} /> Tambah Anime
                </button>
              </div>

              {loadingAnime ? <p>Memuat anime...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animeList.map(a => (
                    <div key={a.id} className="border-[2px] border-[#1a202c] p-4 rounded-md shadow-[3px_3px_0_0_#1a202c] flex gap-4 bg-white">
                      <img src={a.poster_url || 'https://via.placeholder.com/150'} className="w-24 h-32 object-cover border-[2px] border-[#1a202c] rounded" alt="poster" />
                      <div className="flex-1">
                        <h3 className="font-black text-lg leading-tight mb-1">{a.title}</h3>
                        <div className="flex gap-2 text-xs font-bold mb-2">
                          <span className="bg-gray-200 px-2 py-0.5 rounded">{a.type}</span>
                          <span className="bg-[#ffde00] px-2 py-0.5 rounded">{a.status === 'Completed' ? 'FINISHED' : a.status}</span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-2 font-bold flex flex-wrap gap-1">
                          {a.mal_score && <span className="bg-[#1a202c] text-white px-1.5 py-0.5 rounded">⭐ {a.mal_score}</span>}
                          {a.year && <span className="border border-gray-300 px-1.5 py-0.5 rounded">{a.year}</span>}
                          {a.duration && <span className="border border-gray-300 px-1.5 py-0.5 rounded">{a.duration}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{a.episodes_count} Episode tersedia</p>
                        <div className="flex gap-2">
                          <button onClick={() => openEditAnime(a)} className="flex-1 bg-[#ffde00] text-[#1a202c] font-bold text-xs py-1.5 rounded border-[2px] border-[#1a202c] hover:bg-yellow-300">Edit</button>
                          <button onClick={() => openEpisodes(a)} className="flex-1 bg-[#1a202c] text-white font-bold text-xs py-1.5 rounded border-[2px] border-[#1a202c] hover:bg-gray-800">Episode</button>
                          <button onClick={() => handleDeleteAnime(a.id)} className="bg-[#ff3366] text-white p-1.5 rounded border-[2px] border-[#1a202c]"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {animeList.length === 0 && <p className="font-bold text-slate-500">Belum ada anime lokal yang ditambahkan.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Add Anime Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border-[3px] border-[#1a202c] rounded-md shadow-[8px_8px_0_0_#1a202c] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black uppercase">{editingAnimeId ? 'Edit Anime Lokal' : 'Tambah Anime Lokal'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingAnimeId(null); }} className="text-slate-500 hover:text-[#ff3366] font-bold p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleAddAnime} className="space-y-4">
                {/* Sinkronisasi MAL */}
                <div className="bg-[#f7fafc] p-4 border-[2px] border-[#1a202c] rounded-sm mb-4">
                    <label className="block font-bold text-sm mb-2 text-[#1a202c] uppercase">TARIK DATA DARI MYANIMELIST (Opsional)</label>
                    <div className="flex gap-2">
                        <input 
                            type="url" 
                            value={malUrl} 
                            onChange={e => setMalUrl(e.target.value)} 
                            className="flex-grow border-[2px] border-[#1a202c] rounded p-2 focus:outline-none focus:ring-2 ring-[#00d4ff]" 
                            placeholder="Contoh: https://myanimelist.net/anime/33443/Luo_Xiaohei_Zhanji" 
                        />
                        <button 
                            type="button" 
                            onClick={fetchFromMAL}
                            disabled={fetchingMal}
                            className="bg-[#ffde00] text-[#1a202c] font-black px-4 py-2 border-[2px] border-[#1a202c] rounded shadow-[2px_2px_0_0_#1a202c] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-[0px] active:shadow-[0px_0px_0_0_#1a202c] transition-all disabled:opacity-50"
                        >
                            {fetchingMal ? 'SEDOT...' : 'SEDOT DATA'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">*Masukkan link MAL, tekan Sedot Data, dan formulir di bawah akan terisi otomatis!</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Judul Anime *</label>
                        <input required type="text" value={animeForm.title} onChange={e=>setAnimeForm({...animeForm, title: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 focus:outline-none focus:ring-2 ring-[#00d4ff]" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block font-bold text-sm mb-1 uppercase">Tipe</label>
                            <select value={animeForm.type} onChange={e=>setAnimeForm({...animeForm, type: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2">
                                <option value="SERIES">Series</option>
                                <option value="MOVIE">Movie</option>
                                <option value="OVA">OVA</option>
                                <option value="ONA">ONA</option>
                                <option value="SPECIAL">Special</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block font-bold text-sm mb-1 uppercase">Status</label>
                            <select value={animeForm.status} onChange={e=>setAnimeForm({...animeForm, status: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2">
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-sm mb-1 uppercase">URL Poster (HD JPG) *</label>
                    <input required type="url" value={animeForm.poster_url} onChange={e=>setAnimeForm({...animeForm, poster_url: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="https://..." />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Episode</label>
                        <input type="text" value={animeForm.total_episodes} onChange={e=>setAnimeForm({...animeForm, total_episodes: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="12" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Mulai Tayang</label>
                        <input type="date" value={animeForm.aired_start} onChange={e=>setAnimeForm({...animeForm, aired_start: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Selesai Tayang</label>
                        <input type="date" value={animeForm.aired_end} onChange={e=>setAnimeForm({...animeForm, aired_end: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Uploader</label>
                        <input type="text" value={animeForm.source} onChange={e=>setAnimeForm({...animeForm, source: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="NEXA Admin" />
                    </div>
                </div>

                <div className="bg-[#f7fafc] p-4 border-[2px] border-[#1a202c] rounded-sm mb-4">
                    <label className="block font-bold text-sm mb-2 text-[#1a202c] uppercase">Pilih Kategori Penempatan Anime *</label>
                    <select 
                        value={isCustomCategory ? 'KUSTOM_BARU' : animeForm.category_name} 
                        onChange={e => {
                            if (e.target.value === 'KUSTOM_BARU') {
                                setIsCustomCategory(true);
                                setAnimeForm({...animeForm, category_name: ''});
                            } else {
                                setIsCustomCategory(false);
                                setAnimeForm({...animeForm, category_name: e.target.value});
                            }
                        }}
                        className="w-full border-[2px] border-[#1a202c] rounded p-2 focus:outline-none focus:ring-2 ring-[#00d4ff] mb-2 font-bold uppercase"
                    >
                        <option value="NEXA ORIGINALS">NEXA ORIGINALS (Bawaan)</option>
                        <option value="ANIME MOVIE">ANIME MOVIE</option>
                        <option value="EPISODE BARU">EPISODE BARU</option>
                        <option value="SEDANG HANGAT">SEDANG HANGAT</option>
                        <option value="JUDUL BARU">JUDUL BARU</option>
                        <option value="ANIME SERIES">ANIME SERIES</option>
                        <option value="ANIME POPULER">ANIME POPULER</option>
                        <option value="PALING DI NANTI">PALING DI NANTI</option>
                        <option value="KUSTOM_BARU">+ Buat Kategori Baru Sendiri</option>
                    </select>
                    {isCustomCategory && (
                        <input 
                            type="text" 
                            required
                            placeholder="Ketik Nama Kategori Baru (misal: ANIME FAVORIT ADMIN)" 
                            value={animeForm.category_name} 
                            onChange={e => setAnimeForm({...animeForm, category_name: e.target.value})} 
                            className="w-full border-[2px] border-[#1a202c] rounded p-2 font-bold uppercase text-[#1a202c] bg-white mt-1" 
                        />
                    )}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Skor MAL</label>
                        <input type="text" value={animeForm.mal_score} onChange={e=>setAnimeForm({...animeForm, mal_score: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="8.50" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Tahun</label>
                        <input type="text" value={animeForm.year} onChange={e=>setAnimeForm({...animeForm, year: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="2023" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Durasi</label>
                        <input type="text" value={animeForm.duration} onChange={e=>setAnimeForm({...animeForm, duration: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="24 min" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Studio</label>
                        <input type="text" value={animeForm.studio} onChange={e=>setAnimeForm({...animeForm, studio: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="MAPPA" />
                    </div>
                </div>
                
                <div>
                    <label className="block font-bold text-sm mb-1 uppercase">Genre</label>
                    <input type="text" value={animeForm.genres} onChange={e=>setAnimeForm({...animeForm, genres: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="Action, Adventure, Fantasy" />
                </div>
                
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block font-bold text-sm uppercase">Sinopsis *</label>
                        <button type="button" onClick={translateSynopsis} className="text-[10px] bg-[#1a202c] text-white px-2 py-1 rounded border-[2px] border-[#1a202c] hover:bg-gray-800 uppercase font-bold">Terjemahkan ke Indo</button>
                    </div>
                    <textarea required rows={5} value={animeForm.description} onChange={e=>setAnimeForm({...animeForm, description: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 text-sm leading-relaxed"></textarea>
                </div>
                <button type="submit" className="px-4 py-2 font-black uppercase tracking-wide bg-[#ffde00] border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] rounded">{editingAnimeId ? 'Update Anime' : 'Simpan Anime'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Episodes Modal */}
      {selectedAnime && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border-[3px] border-[#1a202c] rounded-md shadow-[8px_8px_0_0_#1a202c] p-6 max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-black uppercase mb-1">Kelola Episode</h3>
            <p className="text-gray-500 font-bold mb-4">{selectedAnime.title}</p>
            
            <form onSubmit={handleAddEpisode} className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 border-[2px] border-[#1a202c] rounded">
              <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-1/3">
                    <label className="text-xs font-black mb-1 block">Episode / Movie</label>
                    <input required type="text" placeholder="Mis: 1, 2, atau Movie" value={epForm.episode_number} onChange={e=>setEpForm({...epForm, episode_number: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 text-sm font-bold" />
                  </div>
                  <div className="w-full sm:w-2/3 flex flex-col justify-end">
                    <button type="submit" className="bg-[#00d4ff] h-[40px] text-[#1a202c] border-[2px] border-[#1a202c] rounded px-4 font-black flex items-center justify-center gap-2 hover:bg-cyan-300 transition-colors shadow-[2px_2px_0_0_#1a202c]">
                      <Plus size={18} /> TAMBAH EPISODE
                    </button>
                  </div>
              </div>
              <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => setEpForm({...epForm, video_url_720p: epForm.video_url_1080p, video_url_480p: epForm.video_url_1080p})} className="text-[10px] bg-slate-200 px-2 py-1 rounded font-bold border border-slate-300 hover:bg-slate-300 transition-colors">
                      ⚡ Salin 1080p ke Semua Resolusi
                  </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                  <div>
                    <label className="text-xs font-black mb-1 block">URL 1080p</label>
                    <input type="text" placeholder="Link video/iframe 1080p" value={epForm.video_url_1080p} onChange={e=>setEpForm({...epForm, video_url_1080p: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-black mb-1 block">URL 720p</label>
                    <input type="text" placeholder="Link video/iframe 720p" value={epForm.video_url_720p} onChange={e=>setEpForm({...epForm, video_url_720p: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-black mb-1 block">URL 480p</label>
                    <input type="text" placeholder="Link video/iframe 480p" value={epForm.video_url_480p} onChange={e=>setEpForm({...epForm, video_url_480p: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 text-xs" />
                  </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold">* Kosongkan resolusi yang tidak tersedia. Minimal isi satu kolom URL.</p>
            </form>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a202c] text-white">
                  <tr>
                    <th className="p-2 font-black text-xs uppercase">Episode</th>
                    <th className="p-2 font-black text-xs uppercase">URL Video</th>
                    <th className="p-2 font-black text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {animeEpisodes.map(ep => (
                    <tr key={ep.id} className="border-b-[2px] border-[#1a202c]">
                      <td className="p-2 font-bold">{ep.episode_number}</td>
                      <td className="p-2 text-xs truncate max-w-[200px]">
                        {ep.video_url.startsWith('[') ? "Tersedia Multiple Resolusi (JSON)" : ep.video_url}
                      </td>
                      <td className="p-2">
                        <button onClick={() => handleDeleteEpisode(ep.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {animeEpisodes.length === 0 && <tr><td colSpan={3} className="p-4 text-center font-bold text-gray-400">Belum ada episode</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelectedAnime(null)} className="px-6 py-2 bg-[#1a202c] text-white font-black uppercase rounded border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#000]">Tutup</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-[3px] border-[#1a202c] shadow-[6px_6px_0_0_#1a202c] rounded-md max-w-sm w-full p-5 sm:p-6 animate-[bounce_0.3s_ease-out] flex flex-col gap-4">
            <h3 className="font-extrabold text-[#1a202c] text-lg uppercase flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={24} strokeWidth={3} />
                Konfirmasi
            </h3>
            <p className="font-bold text-sm text-slate-700 font-sans">
                {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3 mt-2">
                <button 
                    onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
                    className="px-4 py-2 font-black uppercase text-xs sm:text-sm bg-slate-200 text-[#1a202c] hover:bg-slate-300 border-[2px] border-[#1a202c] rounded-sm transition-all shadow-[3px_3px_0_0_#1a202c] hover:shadow-[5px_5px_0_0_#1a202c] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_0_#1a202c]"
                >
                    Batal
                </button>
                <button 
                    onClick={() => {
                        if (confirmModal.onConfirm) confirmModal.onConfirm();
                        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
                    }}
                    className="px-4 py-2 font-black uppercase text-xs sm:text-sm bg-[#00e5ff] text-[#1a202c] hover:bg-[#00cce6] border-[2px] border-[#1a202c] rounded-sm transition-all shadow-[3px_3px_0_0_#1a202c] hover:shadow-[5px_5px_0_0_#1a202c] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_0_#1a202c]"
                >
                    Ya, Hapus
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-[bounce_0.5s_ease-in-out]">
          <div className={`bg-white border-[3px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] rounded-md px-4 py-3 flex items-center gap-3 ${toast.type === 'error' ? 'shadow-[4px_4px_0_0_#ef4444] border-red-500' : 'shadow-[4px_4px_0_0_#10b981] border-[#10b981]'}`}>
            {toast.type === 'error' ? (
              <Info className="text-red-500 flex-shrink-0" size={20} />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
            <p className="font-extrabold text-[#1a202c] text-xs uppercase tracking-tight">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
