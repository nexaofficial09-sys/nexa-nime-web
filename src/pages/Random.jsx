import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Random() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRandomAnime = async () => {
            try {
                // Mengambil halaman acak dari API pencarian untuk mendapatkan pool anime yang acak
                const randomPage = Math.floor(Math.random() * 20) + 1;
                const res = await fetch(`http://127.0.0.1:5000/api/search?page=${randomPage}`).then(r => r.json());
                
                if (res.data?.movie && res.data.movie.length > 0) {
                    const pool = res.data.movie;
                    const randomAnime = pool[Math.floor(Math.random() * pool.length)];
                    
                    // Langsung redirect ke halaman detail anime yang terpilih (replace agar tidak tersimpan di history mundur)
                    navigate(`/anime/${randomAnime.id}`, { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (err) {
                console.error("Gagal mendapatkan anime acak:", err);
                navigate('/', { replace: true });
            }
        };

        fetchRandomAnime();
    }, [navigate]);

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-[50vh] gap-5 pb-10">
            <LoadingSpinner text="Mencari Anime Acak Untukmu..." />
        </div>
    );
}
