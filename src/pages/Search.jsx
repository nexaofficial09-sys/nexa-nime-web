import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword) return;
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.nexalabs.my.id/api/search?keyword=${encodeURIComponent(keyword)}`).then(r => r.json());
        if (res.data?.movie) {
          setResults(res.data.movie);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [keyword]);

  return (
    <div className="flex flex-col gap-6 min-h-[100vh]">
      <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
          <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">
               HASIL PENCARIAN: "{keyword}"
          </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
          <LoadingSpinner text="Mencari Anime..." />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:gap-4 md:gap-y-6">
            {results.map((anime, i) => (
                <AnimeCard key={`search-${i}`} anime={anime} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center gap-2 bg-white border-[2px] border-[#1a202c] rounded-sm shadow-[3px_3px_0_0_#1a202c]">
            <span className="text-4xl">🔍</span>
            <h3 className="font-bold text-lg text-[#1a202c]">Tidak ada anime ditemukan</h3>
            <p className="text-sm text-slate-500 font-semibold">Coba gunakan kata kunci lain.</p>
        </div>
      )}
    </div>
  );
}
