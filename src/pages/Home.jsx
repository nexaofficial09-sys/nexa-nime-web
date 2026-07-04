import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import SidebarPopular from '../components/SidebarPopular';
import SidebarSchedule from '../components/SidebarSchedule';
import SidebarWaiting from '../components/SidebarWaiting';
import SidebarRecommend from '../components/SidebarRecommend';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [customAnime, setCustomAnime] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState({});
  const [newEpisodes, setNewEpisodes] = useState([]);
  const [movieAnime, setMovieAnime] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [hotAnime, setHotAnime] = useState([]);
  const [newAnime, setNewAnime] = useState([]);
  const [scheduleAnime, setScheduleAnime] = useState([]);
  const [seriesAnime, setSeriesAnime] = useState([]);
  const [waitingAnime, setWaitingAnime] = useState([]);
  const [recommendAnime, setRecommendAnime] = useState([]);
  const [seriesPage, setSeriesPage] = useState(0);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const todayStr = days[new Date().getDay()];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resNew, resMovies, resPopular, resHot, resNewTitle, resSchedule, resSeries, resWaiting, resCustom] = await Promise.all([
          fetch('http://127.0.0.1:5000/api/episodes').then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/movies').then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/popular').then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/hot').then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/new').then(r => r.json()),
          fetch(`http://127.0.0.1:5000/api/schedule?day=${todayStr}`).then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/series').then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/waiting').then(r => r.json()),
          fetch('http://127.0.0.1:5000/api/custom_anime').then(r => r.json()).catch(() => ({}))
        ]);
        
        let cGroups = {};
        let dCats = {};
        if (resCustom?.data) {
            resCustom.data.forEach(a => {
                let c = a.category_name || 'NEXA ORIGINALS';
                if (!cGroups[c]) cGroups[c] = [];
                cGroups[c].push(a);
            });
            setCustomAnime(cGroups['NEXA ORIGINALS'] || []);
            
            // Collect dynamic categories
            const standardCats = ['NEXA ORIGINALS', 'ANIME MOVIE', 'EPISODE BARU', 'SEDANG HANGAT', 'JUDUL BARU', 'ANIME SERIES', 'ANIME POPULER', 'PALING DI NANTI'];
            Object.keys(cGroups).forEach(k => {
                if (!standardCats.includes(k)) {
                    dCats[k] = cGroups[k];
                }
            });
            setDynamicCategories(dCats);
        }

        const dedupe = (arr) => {
            const seen = new Set();
            return arr.filter(item => {
                const isDuplicate = seen.has(item.id);
                seen.add(item.id);
                return !isDuplicate;
            });
        };

        const getGrp = (key) => cGroups[key] || [];

        const episodesList = resNew.data?.movie || resNew.data || [];
        setNewEpisodes(dedupe([...getGrp('EPISODE BARU'), ...episodesList]).slice(0, 15));
        
        if (resMovies.data?.movie) setMovieAnime(dedupe([...getGrp('ANIME MOVIE'), ...resMovies.data.movie]).slice(0, 15));
        if (resPopular.data?.movie) setPopularAnime(dedupe([...getGrp('ANIME POPULER'), ...resPopular.data.movie]).slice(0, 8));
        if (resHot.data?.movie) setHotAnime(dedupe([...getGrp('SEDANG HANGAT'), ...resHot.data.movie]).slice(0, 21));
        if (resNewTitle.data?.movie) setNewAnime(dedupe([...getGrp('JUDUL BARU'), ...resNewTitle.data.movie]).slice(0, 15));
        if (resSchedule.data?.movie) setScheduleAnime(dedupe(resSchedule.data.movie).slice(0, 10));
        if (resSeries.data?.movie) setSeriesAnime(dedupe([...getGrp('ANIME SERIES'), ...resSeries.data.movie]).slice(0, 28));
        if (resWaiting.data?.movie) setWaitingAnime(dedupe([...getGrp('PALING DI NANTI'), ...resWaiting.data.movie]).slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const loadMoreSeries = async () => {
    setLoadingSeries(true);
    try {
      const nextPage = seriesPage + 1;
      const res = await fetch(`http://127.0.0.1:5000/api/series?page=${nextPage}`).then(r => r.json());
      if (res.data?.movie) {
        setSeriesAnime(prev => [...prev, ...res.data.movie]);
        setSeriesPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingSeries(false);
  };

  useEffect(() => {
    const fetchRecommend = async () => {
      const cacheKey = 'nexa_nime_recommend_all';
      const cacheTimeKey = 'nexa_nime_recommend_time_all';
      const now = new Date().getTime();
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedData && cachedTime && (now - parseInt(cachedTime) < 3600000)) {
        setRecommendAnime(JSON.parse(cachedData));
      } else {
        try {
          // Ambil dari halaman acak di endpoint search (semua anime)
          const randomPage = Math.floor(Math.random() * 20) + 1;
          const res = await fetch(`http://127.0.0.1:5000/api/search?page=${randomPage}`).then(r => r.json());
          if (res.data?.movie) {
             let pool = [...res.data.movie];
             // Acak urutannya (shuffle)
             for (let i = pool.length - 1; i > 0; i--) {
                 const j = Math.floor(Math.random() * (i + 1));
                 [pool[i], pool[j]] = [pool[j], pool[i]];
             }
             const limited = pool.slice(0, 5);
             setRecommendAnime(limited);
             localStorage.setItem(cacheKey, JSON.stringify(limited));
             localStorage.setItem(cacheTimeKey, now.toString());
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchRecommend();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      
      {/* ===== NEXA ORIGINALS ===== */}
      {customAnime.length > 0 && (
        <section>
          <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
              <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">⭐ NEXA ORIGINALS</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
              {customAnime.map((anime, i) => (
                  <div key={`custom-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                      <AnimeCard anime={anime} />
                  </div>
              ))}
          </div>
        </section>
      )}

      {/* ===== ANIME MOVIE (Full Width, Horizontal Scroll) ===== */}
      <section>
        <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
            <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">ANIME MOVIE</h2>
            <Link to="/explorer?type=MOVIE" className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 font-extrabold text-[12px] rounded-[6px] shadow-[2px_3px_0_0_#1a202c] hover:-translate-y-0.5 transition-transform text-[#1a202c] uppercase tracking-wide">
              MOVIE LAINNYA
            </Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
            {movieAnime.map((anime, i) => (
                <div key={`movie-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                    <AnimeCard anime={anime} isHot={true} />
                </div>
            ))}
            {movieAnime.length === 0 && <div className="flex w-full min-h-[150px] justify-center items-center"><LoadingSpinner /></div>}
        </div>
      </section>

      {/* ===== EPISODE BARU + ANIME POPULER (Side by Side) ===== */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: EPISODE BARU */}
        <div className="flex-grow min-w-0">
          {/* Section: EPISODE BARU */}
          <section className="mb-8">
              <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4">
                  <h2 className="font-sans font-extrabold text-lg tracking-tight text-[#1a202c] uppercase">EPISODE BARU</h2>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
                  {newEpisodes.map((anime, i) => (
                      <div key={`new-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                          <AnimeCard anime={anime} />
                      </div>
                  ))}
                  {newEpisodes.length === 0 && <div className="flex w-full min-h-[150px] justify-center items-center"><LoadingSpinner /></div>}
              </div>
          </section>

          {/* Section: SEDANG HANGAT */}
          <section className="mb-8">
              <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
                  <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">SEDANG HANGAT</h2>
                  <Link to="/list/hot" className="bg-white border-[2px] border-[#1a202c] px-3 sm:px-4 py-1.5 font-extrabold text-[10px] sm:text-[12px] rounded-[6px] shadow-[2px_3px_0_0_#1a202c] hover:-translate-y-0.5 transition-transform text-[#1a202c] uppercase tracking-wide">
                    HANGAT LAINNYA
                  </Link>
              </div>
              
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:gap-4 md:gap-y-6 pb-4">
                  {hotAnime.map((anime, i) => (
                      <AnimeCard key={`hot-${i}`} anime={anime} isHot={true} />
                  ))}
                  {hotAnime.length === 0 && <div className="col-span-full flex min-h-[150px] justify-center items-center"><LoadingSpinner /></div>}
              </div>
          </section>

          {/* Section: JUDUL BARU */}
          <section>
              <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
                  <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">JUDUL BARU</h2>
                  <Link to="/list/new" className="bg-white border-[2px] border-[#1a202c] px-3 sm:px-4 py-1.5 font-extrabold text-[10px] sm:text-[12px] rounded-[6px] shadow-[2px_3px_0_0_#1a202c] hover:-translate-y-0.5 transition-transform text-[#1a202c] uppercase tracking-wide">
                    BARU LAINNYA
                  </Link>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
                  {newAnime.map((anime, i) => (
                      <div key={`newtitle-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                          <AnimeCard anime={anime} />
                      </div>
                  ))}
                  {newAnime.length === 0 && <div className="flex w-full min-h-[150px] justify-center items-center"><LoadingSpinner /></div>}
              </div>
          </section>

          {/* Section: ANIME SERIES (Pagination) */}
          <section className="mb-8 mt-8">
              <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
                  <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">ANIME SERIES</h2>
              </div>
              
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:gap-4 md:gap-y-6 pb-4">
                  {seriesAnime.map((anime, i) => (
                      <AnimeCard key={`series-grid-${i}`} anime={anime} />
                  ))}
                  {seriesAnime.length === 0 && <div className="col-span-full flex min-h-[150px] justify-center items-center"><LoadingSpinner /></div>}
              </div>

              <div className="flex justify-center mt-4">
                  <button 
                      onClick={loadMoreSeries}
                      disabled={loadingSeries}
                      className="bg-white border-[2px] border-[#1a202c] px-8 py-2.5 font-extrabold text-[14px] rounded-[6px] shadow-[3px_4px_0_0_#1a202c] hover:-translate-y-0.5 transition-transform text-[#1a202c] uppercase tracking-wide disabled:opacity-50"
                  >
                      {loadingSeries ? 'LOADING...' : 'MUAT LEBIH BANYAK'}
                  </button>
              </div>
          </section>
        </div>

        {/* Right: ANIME POPULER & JADWAL & WAITING & RECOMMEND */}
        <div className="w-full lg:w-[280px] flex-shrink-0">
           <div className="flex flex-col gap-6">
              <SidebarPopular popularList={popularAnime} />
              <SidebarSchedule scheduleList={scheduleAnime} currentDay={todayStr} />
              <SidebarWaiting waitingList={waitingAnime} />
              <SidebarRecommend recommendList={recommendAnime} />
           </div>
        </div>
      </div>
    </div>
  );
}
