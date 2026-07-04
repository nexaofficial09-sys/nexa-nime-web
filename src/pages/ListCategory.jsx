import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ListCategory() {
    const { category } = useParams();
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);

    const titleMap = {
        'hot': 'SEDANG HANGAT',
        'new': 'JUDUL BARU',
        'popular': 'ANIME POPULER',
        'episodes': 'EPISODE BARU'
    };

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                if (category === 'hot') endpoint = '/api/hot';
                else if (category === 'new') endpoint = '/api/new';
                else if (category === 'popular') endpoint = '/api/popular';
                else if (category === 'episodes') endpoint = '/api/episodes';
                
                if (endpoint) {
                    const res = await fetch(`http://103.30.195.243:5000${endpoint}`).then(r => r.json());
                    let list = [];
                    if (res.data?.movie) list = res.data.movie;
                    else if (Array.isArray(res.data)) list = res.data;
                    setAnimeList(list);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        
        fetchList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category]);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border-[2px] border-[#1a202c] px-4 py-3 rounded-sm shadow-[4px_4px_0_0_#1a202c] flex items-center justify-between">
                <h1 className="font-sans font-extrabold text-2xl text-[#1a202c] tracking-tight uppercase">
                    {titleMap[category] || 'DAFTAR ANIME'}
                </h1>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 md:gap-6 pb-8">
                    {animeList.map((anime, i) => (
                        <AnimeCard key={i} anime={anime} isHot={category === 'hot' || category === 'popular'} />
                    ))}
                    {animeList.length === 0 && <p className="col-span-full text-center font-bold text-slate-500">Tidak ada data.</p>}
                </div>
            )}
        </div>
    );
}
