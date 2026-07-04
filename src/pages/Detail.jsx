import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarPopular from '../components/SidebarPopular';
import AnimeCard from '../components/AnimeCard';
import { Play } from 'lucide-react';

export default function Detail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setData(null);
    setEpisodes([]);
    const fetchData = async () => {
      try {
        let resDetail, resEpisode;
        
        if (id.startsWith('local_')) {
            const dbId = id.replace('local_', '');
            resDetail = await fetch(`https://api.nexalabs.my.id/api/custom_anime/${dbId}`).then(r => r.json());
            if (resDetail.success && resDetail.data) {
                // Map to match external API format
                resDetail.data = { movie: resDetail.data };
                resEpisode = { 
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
            [resDetail, resEpisode] = await Promise.all([
                fetch(`https://api.nexalabs.my.id/api/detail/${id}`).then(r => r.json()),
                fetch(`https://api.nexalabs.my.id/api/episode/${id}`).then(r => r.json())
            ]);
        }

        const [resPopular, resMovies] = await Promise.all([
          fetch(`https://api.nexalabs.my.id/api/popular`).then(r => r.json()),
          fetch(`https://api.nexalabs.my.id/api/movies`).then(r => r.json())
        ]);
        
        if (resDetail?.data) setData(resDetail.data);
        if (resPopular?.data?.movie) setPopularAnime(resPopular.data.movie.slice(0, 5));
        if (resEpisode?.data?.episode) {
            let epis = Array.isArray(resEpisode.data.episode) ? resEpisode.data.episode : [resEpisode.data.episode];
            if (resDetail?.data?.movie?.type?.toUpperCase() === 'MOVIE') {
                epis = epis.map(ep => ({ ...ep, title: 'MOVIE' }));
            }
            setEpisodes(epis);
        }
        if (resMovies?.data?.movie) {
            const movies = resMovies.data.movie;
            const shuffled = [...movies].sort(() => 0.5 - Math.random());
            setRecommendations(shuffled.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  if (!data) return <div className="p-8 flex justify-center items-center min-h-[50vh]"><LoadingSpinner /></div>;

  const movie = data.movie;

  const proxyUrl = (url) => url ? `http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(url)}` : '';

  const sortedEpisodes = [...episodes].sort((a, b) => {
    const aIndex = parseInt(a.index) || 0;
    const bIndex = parseInt(b.index) || 0;
    return sortOrder === 'terlama' ? aIndex - bIndex : bIndex - aIndex;
  });

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <div className="font-sans text-[13px] sm:text-sm font-extrabold text-slate-600 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Link to="/" className="text-[#5143d9] hover:text-[#00d4ff] transition-colors">Beranda</Link>
        <span className="text-slate-400 text-xs sm:text-sm">»</span>
        <span className="text-slate-600 truncate max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-xl">
            {movie?.title || "Detail Anime"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      
      {/* Kiri: Konten Utama */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
        
        {/* Cover / Header Info */}
        <div className="bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-4 md:p-6 rounded-sm flex flex-col md:flex-row gap-6">
          <div className="w-[160px] md:w-48 flex-shrink-0 border-[2px] border-[#1a202c] mx-auto md:mx-0 shadow-[3px_3px_0_0_#1a202c] bg-zinc-200 rounded-sm overflow-hidden h-fit">
             <img src={proxyUrl(movie.image_poster)} alt={movie.title} className="w-full h-auto object-cover" />
          </div>
          
          <div className="flex flex-col flex-grow text-center md:text-left">
             <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a202c] mb-3 leading-tight uppercase font-sans">
                {movie.title}
             </h1>
             
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                {movie.mal_score && (
                  <span className="bg-[#1a202c] text-white border-[2px] border-[#1a202c] text-xs font-bold px-2 py-1 flex items-center gap-1 rounded-sm shadow-[2px_2px_0_0_#00d4ff]">
                    ⭐ {movie.mal_score}
                  </span>
                )}
                <span className="bg-[#00d4ff] text-[#1a202c] border-[2px] border-[#1a202c] text-xs font-bold px-2 py-1 uppercase rounded-sm shadow-[2px_2px_0_0_#1a202c]">
                  {movie.type || 'SERIES'}
                </span>
                <span className="bg-white text-[#1a202c] border-[2px] border-[#1a202c] text-xs font-bold px-2 py-1 uppercase rounded-sm shadow-[2px_2px_0_0_#1a202c]">
                  {movie.year || '-'}
                </span>
                <span className={`border-[2px] border-[#1a202c] text-xs font-bold px-2 py-1 uppercase rounded-sm shadow-[2px_2px_0_0_#1a202c] ${(movie.status === 'Completed' || movie.status === 'FINISHED') && movie.is_custom ? 'bg-[#ffde00] text-[#1a202c]' : movie.status === 'FINISHED' ? 'bg-[#255ad5] text-white' : movie.status === 'Completed' ? 'bg-[#255ad5] text-white' : 'bg-[#2ecc71] text-white'}`}>
                  {(movie.status === 'Completed' || movie.status === 'FINISHED') && movie.is_custom ? 'FINISHED' : movie.status || 'UNKNOWN'}
                </span>
             </div>

             <div className="font-sans text-sm text-slate-700 leading-relaxed mb-4 text-justify font-medium">
               {movie.synopsis || "Sinopsis belum tersedia."}
             </div>
             
             {/* Genres */}
             {movie.genre && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                   {movie.genre.split(',').map((g, idx) => (
                      <span key={idx} className="bg-slate-100 border-[2px] border-[#1a202c] text-[#1a202c] text-xs font-bold px-2 py-1 rounded-sm shadow-[2px_2px_0_0_#1a202c] hover:bg-[#ffde00] hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[3px_3px_0_0_#1a202c] transition-all cursor-pointer uppercase">
                        {g.trim()}
                      </span>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-4 rounded-sm font-sans text-sm">
          <h2 className="font-extrabold text-lg tracking-tight text-[#1a202c] uppercase border-b-[2px] border-[#1a202c] pb-2 mb-4 inline-block">INFORMASI ANIME</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
             <div className="flex flex-col gap-3">
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Rating MAL</span> 
                  <span className="text-slate-600 font-semibold">{movie.mal_score || '-'}</span>
                </p>
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Episode</span> 
                  <span className="text-slate-600 font-semibold">{movie.episodes || '?'}</span>
                </p>
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Tipe</span> 
                  <span className="text-slate-600 font-semibold">{movie.type || '-'}</span>
                </p>
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Status</span> 
                  <span className="text-slate-600 font-semibold">{(movie.status === 'Completed' || movie.status === 'FINISHED') && movie.is_custom ? 'Finished' : movie.status || '-'}</span>
                </p>
             </div>
             
             <div className="flex flex-col gap-3">
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Uploader</span> 
                  <span className="text-slate-600 font-semibold">{movie.is_custom ? 'NEXA Admin' : (movie.source || '-')}</span>
                </p>
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Durasi</span> 
                  <span className="text-slate-600 font-semibold">{movie.duration || '-'}</span>
                </p>
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Studio</span> 
                  <span className="text-slate-600 font-semibold">{movie.studio || '-'}</span>
                </p>
             </div>
             
             <div className="flex flex-col gap-3">
                {(movie.aired_start || movie.premiered) && (
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Mulai Tayang</span> 
                  <span className="text-slate-600 font-semibold">{formatDate(movie.aired_start || movie.premiered)}</span>
                </p>
                )}
                {movie.aired_end && (
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Selesai Tayang</span> 
                  <span className="text-slate-600 font-semibold">{formatDate(movie.aired_end)}</span>
                </p>
                )}
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Views</span> 
                  <span className="text-slate-600 font-semibold">{movie.views ? Number(movie.views).toLocaleString('id-ID') : 0} x ditonton</span>
                </p>
                {movie.favorites && (
                <p className="flex gap-2">
                  <span className="font-extrabold text-[#1a202c] w-[100px] flex-shrink-0">Favorit</span> 
                  <span className="text-slate-600 font-semibold">{Number(movie.favorites).toLocaleString('id-ID')} orang</span>
                </p>
                )}
             </div>
          </div>
        </div>

        {/* Daftar Episode */}
        <section>
          {/* Header Episode & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <div className="bg-white border-[2px] border-[#1a202c] px-3 py-1.5 sm:px-4 rounded-sm shadow-[3px_3px_0_0_#1a202c] inline-flex self-start sm:self-auto">
                  <h2 className="font-sans font-extrabold text-base sm:text-lg tracking-tight text-[#1a202c] uppercase">DAFTAR EPISODE</h2>
              </div>
              
              <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:w-[200px]">
                      <input 
                          type="text" 
                          placeholder="Cari..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-100 border-[2px] border-[#1a202c] rounded-sm py-1.5 px-3 text-xs sm:text-sm font-bold text-[#1a202c] placeholder:text-slate-400 focus:outline-none focus:bg-[#ffde00] transition-colors shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)]"
                      />
                  </div>
                  <div className="relative flex-shrink-0">
                  <button 
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="bg-white border-[2px] border-[#1a202c] text-[#1a202c] text-xs font-extrabold px-4 py-2 flex items-center justify-between gap-3 rounded-sm shadow-[3px_3px_0_0_#1a202c] hover:bg-[#00d4ff] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0_0_#1a202c] transition-all uppercase tracking-tight min-w-[150px]"
                  >
                      <span>{sortOrder === 'terbaru' ? 'Paling Baru' : 'Paling Lama'}</span>
                      <svg className={`w-4 h-4 transform transition-transform ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </button>

                  {isSortOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                        <div className="absolute top-full mt-2 right-0 w-[150px] bg-white border-[2px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] rounded-sm z-20 flex flex-col overflow-hidden">
                            <button 
                                onClick={() => { setSortOrder('terbaru'); setIsSortOpen(false); }}
                                className={`px-4 py-2.5 text-left text-xs font-extrabold uppercase border-b-[2px] border-[#1a202c] hover:bg-[#00d4ff] hover:text-[#1a202c] transition-colors ${sortOrder === 'terbaru' ? 'bg-[#1a202c] text-white' : 'bg-white text-[#1a202c]'}`}
                            >
                                Paling Baru
                            </button>
                            <button 
                                onClick={() => { setSortOrder('terlama'); setIsSortOpen(false); }}
                                className={`px-4 py-2.5 text-left text-xs font-extrabold uppercase hover:bg-[#00d4ff] hover:text-[#1a202c] transition-colors ${sortOrder === 'terlama' ? 'bg-[#1a202c] text-white' : 'bg-white text-[#1a202c]'}`}
                            >
                                Paling Lama
                            </button>
                        </div>
                      </>
                  )}
              </div>
          </div>
          </div>
          
          <div className="bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] p-4 rounded-sm">
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 sm:pr-2" 
                style={{ maxHeight: '350px', scrollbarWidth: 'thin' }}
              >
                 {sortedEpisodes
                   .filter(ep => ep.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(ep.index).includes(searchQuery))
                   .map((ep, i) => (
                    <Link 
                      key={i} 
                      to={`/stream/${ep.id}`} 
                      className="flex items-center justify-between p-2.5 border-[2px] border-[#1a202c] rounded-sm hover:bg-[#00d4ff] transition-colors shadow-[2px_2px_0_0_#1a202c] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_0_#1a202c] group"
                    >
                       <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          <div className="bg-[#1a202c] w-9 h-9 flex items-center justify-center border-[2px] border-[#1a202c] rounded-sm text-white font-extrabold text-sm flex-shrink-0 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.2)]">
                             {ep.index}
                          </div>
                          <div className="flex flex-col min-w-0 pr-2">
                             <span className="font-bold font-sans text-[#1a202c] text-[13px] truncate">{ep.title}</span>
                             <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold mt-0.5">
                                 <span>{ep.key_time}</span>
                                 {ep.views && (
                                   <>
                                     <span className="w-1 h-1 bg-[#1a202c] rounded-full"></span>
                                     <span>{Number(ep.views).toLocaleString('id-ID')} view</span>
                                   </>
                                 )}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-center text-white bg-[#e50914] w-8 h-8 rounded-sm border-[2px] border-[#1a202c] shadow-[1px_1px_0_0_#1a202c] group-hover:bg-[#1a202c] transition-colors flex-shrink-0">
                         <Play size={14} className="fill-current ml-0.5" />
                       </div>
                    </Link>
                 ))}
                 
                 {episodes.length === 0 && (
                    <p className="text-sm text-slate-500 font-bold bg-slate-100 p-3 rounded-sm border-[2px] border-slate-300 col-span-full">Episode belum tersedia.</p>
                 )}
              </div>
          </div>
        </section>
        
        {/* Anime Terkait (Seasons) */}
        {data.season && data.season.length > 0 && (
          <section className="mt-4">
            <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 inline-flex">
                <h2 className="font-sans font-extrabold text-lg tracking-tight text-[#1a202c] uppercase">ANIME TERKAIT</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
                {data.season.map((anime, i) => (
                    <div key={`season-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                        <AnimeCard anime={anime} />
                    </div>
                ))}
            </div>
          </section>
        )}
        
      </div>

      {/* Kanan: Sidebar Popular & Rekomendasi */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8">
         <SidebarPopular popularList={popularAnime} />
         
         {recommendations.length > 0 && (
             <SidebarPopular popularList={recommendations} title="REKOMENDASI" />
         )}
      </div>
      
    </div>
    </div>
  );
}
