import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarPopular from '../components/SidebarPopular';
import { Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Stream() {
  const { user } = useAuth();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [popularAnime, setPopularAnime] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [animeDetail, setAnimeDetail] = useState(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [failedServers, setFailedServers] = useState(new Set());
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedTime, setSavedTime] = useState(0);
  const videoRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const savedTimeRef = useRef(0);
  const hasSeekedRef = useRef(false);

  useEffect(() => {
    setIsNavigating(true);
    setSelectedServer(0);
    setFailedServers(new Set());
    const fetchData = async () => {
      try {
        let resStream;
        if (id.startsWith('local_')) {
            const dbId = id.replace('local_', '');
            const rawStream = await fetch(`https://api.nexalabs.my.id/api/custom_episode/${dbId}`).then(r => r.json());
            if (rawStream.success && rawStream.data) {
                resStream = { 
                    data: { 
                        server: rawStream.data.videoPlayer, 
                        episode: { 
                            id_movie: `local_${rawStream.data.anime_id}`,
                            index: rawStream.data.index,
                            title: rawStream.data.title
                        } 
                    } 
                };
            }
        } else {
            resStream = await fetch(`https://api.nexalabs.my.id/api/stream/${id}`).then(r => r.json());
        }

        const [resPopular] = await Promise.all([
          fetch(`https://api.nexalabs.my.id/api/popular`).then(r => r.json())
        ]);
        if (resStream?.data) {
           if (resStream.data.episode?.id_movie) {
               const movieId = resStream.data.episode.id_movie;
               let resEp, resDetail;
               
               if (movieId.startsWith('local_')) {
                   const animeId = movieId.replace('local_', '');
                   resDetail = await fetch(`https://api.nexalabs.my.id/api/custom_anime/${animeId}`).then(r => r.json());
                   if (resDetail.success && resDetail.data) {
                       resDetail.data = { movie: resDetail.data };
                       resEp = {
                           data: {
                               episode: (resDetail.data.movie.episode_list || []).map(ep => ({
                                   id: ep.id_episode,
                                   index: ep.episode,
                                   title: resDetail.data.movie.type === 'MOVIE' ? 'MOVIE' : `Episode ${ep.episode}`,
                                   key_time: 'NEXA Originals',
                                   views: 0
                               }))
                           }
                       };
                   }
               } else {
                   [resEp, resDetail] = await Promise.all([
                     fetch(`https://api.nexalabs.my.id/api/episode/${movieId}`).then(r => r.json()),
                     fetch(`https://api.nexalabs.my.id/api/detail/${movieId}`).then(r => r.json())
                   ]);
               }
               
               if (resEp?.data?.episode) {
                   let epis = Array.isArray(resEp.data.episode) ? resEp.data.episode : [resEp.data.episode];
                   if (resDetail?.data?.movie?.type?.toUpperCase() === 'MOVIE') {
                       epis = epis.map(ep => ({ ...ep, title: 'MOVIE' }));
                   }
                   setEpisodes(epis);
               }
               if (resDetail?.data?.movie) {
                   setAnimeDetail(resDetail.data.movie);
                   if (resDetail.data.movie.type?.toUpperCase() === 'MOVIE' && resStream?.data?.episode) {
                       resStream.data.episode.title = 'MOVIE';
                   }
               }
               
               if (user) {
                   fetch(`https://api.nexalabs.my.id/api/history/${movieId}`, { credentials: 'include' })
                   .then(r => r.json())
                   .then(resHistory => {
                       if (resHistory?.success && (resHistory?.episode_id === id || String(resHistory?.episode) === String(resStream.data.episode.index))) {
                           setSavedTime(resHistory.time_watched || 0);
                           savedTimeRef.current = resHistory.time_watched || 0;
                           hasSeekedRef.current = false;
                       } else {
                           setSavedTime(0);
                           savedTimeRef.current = 0;
                           hasSeekedRef.current = false;
                       }
                       setData(resStream.data);
                   }).catch(err => {
                       console.error("Error fetching history:", err);
                       setData(resStream.data);
                   });
               } else {
                   setData(resStream.data);
               }
           } else {
               setData(resStream.data);
           }
           setIsNavigating(false);
        }
        if (resPopular.data?.movie) setPopularAnime(resPopular.data.movie.slice(0, 5));
      } catch (err) {
        console.error(err);
        setIsNavigating(false);
      }
    };
    fetchData();
  }, [id]);

  const rawServers = data?.server || [];
  // Paksa hapus server RAPSODI 360p yang selalu error (hanya suara)
  let servers = rawServers.filter(s => !(s.name === 'RAPSODI' && s.quality === '360p'));
  
  // Urutkan resolusi dari yang terkecil ke terbesar berdasarkan angka p (misal: 480p -> 720p -> 1080p)
  servers = servers.sort((a, b) => {
      const getVal = (q) => parseInt(String(q).replace(/[^0-9]/g, '')) || 9999;
      return getVal(a.quality) - getVal(b.quality);
  });
  
  const currentServer = servers[selectedServer];

  useEffect(() => {
    if (videoRef.current && currentServer) {
        setIsVideoLoading(true);
        videoRef.current.load();
        hasSeekedRef.current = false; // Reset whenever server changes
    }
  }, [currentServer?.link]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && savedTime > 0 && !hasSeekedRef.current) {
        const attemptSeek = () => {
            if (video.readyState >= 1) { // HAVE_METADATA or higher
                setTimeout(() => {
                    if (video) video.currentTime = savedTime;
                }, 100);
                hasSeekedRef.current = true;
            }
        };
        
        attemptSeek();
        // Fallback listener if not ready yet
        video.addEventListener('loadedmetadata', attemptSeek);
        return () => video.removeEventListener('loadedmetadata', attemptSeek);
    }
  }, [savedTime, currentServer]);

  // Track iframe watch history on load since iframes don't fire onTimeUpdate
  useEffect(() => {
      if (user && data?.episode?.id_movie && animeDetail && currentServer?.type === 'iframe') {
          fetch(`https://api.nexalabs.my.id/api/history`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                  anime_id: data.episode.id_movie,
                  episode_id: id,
                  episode: data.episode.index || data.episode.episode || "",
                  title: animeDetail.title,
                  time_watched: 0, // Cannot track exact time for iframes
                  image: animeDetail.image_poster
              })
          }).catch(err => console.error("Gagal menyimpan riwayat:", err));
      }
  }, [user, data, animeDetail, currentServer, id]);

  if (!data) return <div className="p-8 flex justify-center items-center min-h-[50vh]"><LoadingSpinner /></div>;

  const episode = data.episode;
  
  // Hitung episode prev dan next dari array episodes
  const sortedEpisodes = [...episodes].sort((a, b) => parseInt(a.index) - parseInt(b.index));
  const currentIndex = sortedEpisodes.findIndex(ep => ep.id === episode?.id);
  
  let prevEp = null;
  let nextEp = null;
  if (currentIndex !== -1) {
      if (currentIndex > 0) prevEp = sortedEpisodes[currentIndex - 1];
      if (currentIndex < sortedEpisodes.length - 1) nextEp = sortedEpisodes[currentIndex + 1];
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <div className="font-sans text-[13px] sm:text-sm font-extrabold text-slate-600 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Link to="/" className="text-[#5143d9] hover:text-[#00d4ff] transition-colors">Beranda</Link>
        <span className="text-slate-400 text-xs sm:text-sm">»</span>
        <Link to={episode?.id_movie ? `/anime/${episode.id_movie}` : "/"} className="text-[#5143d9] hover:text-[#00d4ff] transition-colors truncate max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md">
            {animeDetail?.title || "Detail Anime"}
        </Link>
        <span className="text-slate-400 text-xs sm:text-sm">»</span>
        <span className="text-slate-600 truncate max-w-[100px] sm:max-w-[200px]">
            {episode?.title || "Episode"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Kiri: Streaming & Komentar */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
        
        {/* Video Player */}
        <div className="bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-3 md:p-4 rounded-sm flex flex-col gap-4">
            {/* Header info for video */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="font-sans text-xl md:text-2xl font-extrabold uppercase text-[#1a202c]">
                    {episode?.title || "Episode"}
                </h1>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        {prevEp && (
                        <Link to={`/stream/${prevEp.id}`} className="bg-[#1a202c] text-white hover:bg-[#ffde00] hover:text-[#1a202c] font-extrabold text-xs px-2 md:px-3 py-1.5 border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all duration-200 ease-in-out rounded-sm uppercase tracking-wider flex items-center gap-1">
                            &lt; Prev
                        </Link>
                        )}
                        <Link to={`/anime/${episode.id_movie}`} className="bg-white text-[#1a202c] hover:bg-[#00d4ff] font-extrabold text-xs px-2 md:px-3 py-1.5 border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all duration-200 ease-in-out rounded-sm uppercase tracking-wider">
                            Detail Anime
                        </Link>
                        {nextEp && (
                        <Link to={`/stream/${nextEp.id}`} className="bg-[#1a202c] text-white hover:bg-[#ffde00] hover:text-[#1a202c] font-extrabold text-xs px-2 md:px-3 py-1.5 border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all duration-200 ease-in-out rounded-sm uppercase tracking-wider flex items-center gap-1">
                            Next &gt;
                        </Link>
                        )}
                </div>
            </div>

            {/* Player Container */}
            <div className="aspect-video bg-black w-full relative border-[2px] border-[#1a202c] rounded-sm shadow-[3px_3px_0_0_#1a202c] overflow-hidden">
                {(isNavigating || isVideoLoading) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                        <LoadingSpinner text="" />
                    </div>
                )}
                {currentServer ? (
                    currentServer.type === 'iframe' ? (
                        <iframe 
                            src={currentServer.link} 
                            className={`w-full h-full border-none transition-opacity duration-300 ${(isNavigating || isVideoLoading) ? 'opacity-0' : 'opacity-100'}`}
                            allowFullScreen 
                            allow="autoplay"
                            title="Video Player"
                            onLoad={() => setIsVideoLoading(false)}
                        />
                    ) : (
                        <video 
                            ref={videoRef}
                            src={currentServer.link} 
                            controls 
                            autoPlay
                            poster={episode?.image}
                            className={`w-full h-full outline-none transition-opacity duration-300 ${(isNavigating || isVideoLoading) ? 'opacity-0' : 'opacity-100'}`}
                            onCanPlay={() => {
                                setIsVideoLoading(false);
                            }}
                            onError={() => setIsVideoLoading(false)}
                            onLoadedMetadata={(e) => {
                                if (savedTimeRef.current > 0 && !hasSeekedRef.current) {
                                    const target = e.target;
                                    setTimeout(() => {
                                        target.currentTime = savedTimeRef.current;
                                    }, 100);
                                    hasSeekedRef.current = true;
                                }
                                // Deteksi jika video gagal dirender (unsupported codec seperti HEVC di Chrome)
                                if (e.target.videoWidth === 0 && e.target.duration > 0) {
                                    console.warn("Format video tidak didukung (HEVC). Menyembunyikan server ini...");
                                    setFailedServers(prev => {
                                        const newSet = new Set(prev);
                                        newSet.add(selectedServer);
                                        return newSet;
                                    });
                                    setSelectedServer(prev => {
                                        let next = prev + 1;
                                        return next < servers.length ? next : prev;
                                    });
                                }
                            }}
                            onTimeUpdate={(e) => {
                                if (!user || !episode?.id_movie || !animeDetail) return;
                                const currentTime = e.target.currentTime;
                                const now = Date.now();
                                // Throttle update history setiap 5 detik
                                if (now - lastUpdateTime.current > 5000) {
                                    lastUpdateTime.current = now;
                                    fetch(`https://api.nexalabs.my.id/api/history`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                            anime_id: episode.id_movie,
                                            episode_id: id,
                                            episode: episode.index || episode.episode || "",
                                            title: animeDetail?.title || episode.title,
                                            time_watched: currentTime,
                                            image: animeDetail?.image_poster || episode.image
                                        })
                                    }).catch(err => console.error("Gagal menyimpan riwayat:", err));
                                }
                            }}
                            onPause={(e) => {
                                if (!user || !episode?.id_movie || !animeDetail) return;
                                const currentTime = e.target.currentTime;
                                lastUpdateTime.current = Date.now(); // Reset throttle
                                fetch(`https://api.nexalabs.my.id/api/history`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                        anime_id: episode.id_movie,
                                        episode_id: id,
                                        episode: episode.index || episode.episode || "",
                                        title: animeDetail.title,
                                        time_watched: currentTime,
                                        image: animeDetail.image_poster
                                    })
                                }).catch(err => console.error("Gagal menyimpan riwayat:", err));
                            }}
                        />
                    )
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-white font-sans font-bold">
                        Video tidak tersedia
                    </div>
                )}
            </div>
        </div>

        {/* Server Selection */}
        {servers.length > 0 && (
            <div className="bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-4 rounded-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-col gap-3">
                    <span className="font-extrabold text-xs text-[#1a202c] uppercase">Pilih Resolusi:</span>
                    <div className="flex flex-wrap gap-2">
                        {servers.map((server, index) => {
                            if (failedServers.has(index)) return null;
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedServer(index)}
                                    className={`font-extrabold text-xs px-4 py-2 border-[2px] border-[#1a202c] rounded-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] ${
                                        selectedServer === index 
                                        ? 'bg-[#00d4ff] text-[#1a202c] shadow-[3px_3px_0_0_#1a202c]' 
                                        : 'bg-white text-[#1a202c] hover:bg-[#ffde00] shadow-[2px_2px_0_0_#1a202c]'
                                    }`}
                                >
                                    {server.quality}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* Komentar (Desktop Only) */}
        <div className="hidden lg:flex bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-4 md:p-6 rounded-sm flex-col gap-4">
            <h2 className="font-sans text-lg font-extrabold uppercase text-[#1a202c] border-b-[2px] border-[#1a202c] pb-2">
                Komentar
            </h2>
            <div className="text-center py-8 text-sm font-bold text-slate-500">
                Fitur komentar sedang dalam pengembangan.
            </div>
        </div>

      </div>

      {/* Kanan: Sidebar (Episode & Populer) */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8">
         
         {/* Episode List */}
         {episodes.length > 0 && (
             <div className="flex flex-col gap-4">
                 <div className="bg-white border-[2px] border-[#1a202c] rounded-sm p-2 sm:px-4 sm:py-2.5 shadow-[3px_3px_0_0_#1a202c] flex flex-row items-center justify-between gap-2 sm:gap-3">
                     <h3 className="font-sans font-extrabold text-sm sm:text-lg text-[#1a202c] tracking-tight uppercase flex-shrink-0">
                         EPISODE
                     </h3>
                     <div className="relative w-full max-w-[150px] sm:max-w-[200px]">
                         <input 
                             type="text" 
                             placeholder="Cari..." 
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="w-full bg-slate-100 border-[2px] border-[#1a202c] rounded-sm py-1 sm:py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-[#1a202c] placeholder:text-slate-400 focus:outline-none focus:bg-[#ffde00] transition-colors shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)]"
                         />
                     </div>
                 </div>
                 
                 <div className="bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-3 rounded-sm">
                     <div 
                         className="flex flex-col gap-2.5 overflow-y-auto pr-1" 
                         style={{ maxHeight: '380px', scrollbarWidth: 'thin' }}
                     >
                         {episodes.filter(ep => ep.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(ep.index).includes(searchQuery)).map((ep, i) => {
                            const isCurrent = ep.id === id;
                            return (
                             <Link 
                               key={i} 
                               to={`/stream/${ep.id}`} 
                               className={`flex items-center justify-between p-2 border-[2px] border-[#1a202c] rounded-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] shadow-[2px_2px_0_0_#1a202c] group ${isCurrent ? 'bg-[#00d4ff]' : 'hover:bg-[#00d4ff] bg-white'}`}
                             >
                                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                   <div className={`w-8 h-8 flex items-center justify-center border-[2px] border-[#1a202c] rounded-sm font-extrabold text-xs flex-shrink-0 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.2)] ${isCurrent ? 'bg-white text-[#1a202c]' : 'bg-[#1a202c] text-white group-hover:bg-white group-hover:text-[#1a202c] transition-colors'}`}>
                                      {ep.index}
                                   </div>
                                   <div className="flex flex-col min-w-0 pr-1">
                                      <span className="font-bold font-sans text-[#1a202c] text-[13px] truncate">{ep.title}</span>
                                      <div className="text-[9px] text-[#1a202c]/70 font-extrabold uppercase mt-0.5">
                                          {ep.key_time}
                                      </div>
                                   </div>
                                </div>
                                {!isCurrent && (
                                   <div className="flex items-center justify-center text-white bg-[#e50914] w-7 h-7 rounded-sm border-[2px] border-[#1a202c] group-hover:bg-[#1a202c] transition-colors flex-shrink-0">
                                     <Play size={12} className="fill-current ml-0.5" />
                                   </div>
                                )}
                             </Link>
                            )
                         })}
                     </div>
                 </div>
             </div>
         )}
         
         {/* Komentar (Mobile Only) */}
         <div className="flex lg:hidden bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-4 rounded-sm flex-col gap-4">
             <h2 className="font-sans text-lg font-extrabold uppercase text-[#1a202c] border-b-[2px] border-[#1a202c] pb-2">
                 Komentar
             </h2>
             <div className="text-center py-6 text-sm font-bold text-slate-500">
                 Fitur komentar sedang dalam pengembangan.
             </div>
         </div>
         
         {/* Anime Populer */}
         <SidebarPopular popularList={popularAnime} />
      </div>

    </div>
    </div>
  );
}
