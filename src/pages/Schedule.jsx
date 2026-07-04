import React, { useEffect, useState } from 'react';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Schedule() {
    const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU', 'RANDOM'];
    const currentDayStr = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // getDay() is 0 for Sunday
    const initialDay = days.includes(currentDayStr) ? currentDayStr : 'SENIN';

    const [selectedDay, setSelectedDay] = useState(initialDay);
    const [scheduleAnime, setScheduleAnime] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/schedule?day=${selectedDay}`).then(r => r.json());
                if (res.data?.movie) {
                    setScheduleAnime(res.data.movie);
                } else if (Array.isArray(res.data)) {
                    setScheduleAnime(res.data);
                } else {
                    setScheduleAnime([]);
                }
            } catch (err) {
                console.error("Failed to fetch schedule:", err);
                setScheduleAnime([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [selectedDay]);

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in pb-10 min-h-[100vh]">
            {/* Header */}
            <div className="bg-white border-[3px] border-[#1a202c] rounded-md px-6 py-2 shadow-[4px_4px_0_0_#1a202c]">
                <h1 className="font-sans font-extrabold text-xl md:text-2xl text-[#1a202c] uppercase tracking-wide">
                    Jadwal Rilis Mingguan
                </h1>
                <p className="text-[13px] font-bold text-slate-500 mt-0.5">Pilih hari untuk melihat jadwal rilis anime favoritmu.</p>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 snap-x w-full" style={{ scrollbarWidth: 'thin' }}>
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className="group bg-[#1a202c] rounded-[0.4em] block flex-shrink-0 snap-start mt-1.5 mb-1"
                    >
                        <span className={`block border-[2px] border-[#1a202c] rounded-[0.4em] px-5 py-2 text-[13px] font-extrabold tracking-wide uppercase transition-transform duration-100 -translate-y-[4px] group-hover:-translate-y-[6px] group-active:translate-y-0 ${
                            selectedDay === day
                                ? 'bg-[#00d4ff] text-[#1a202c]'
                                : 'bg-white text-[#1a202c]'
                        }`}>
                            {day}
                        </span>
                    </button>
                ))}
            </div>

            {/* Anime Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-[50vh]">
                        <LoadingSpinner text="Memuat Jadwal..." />
                    </div>
                ) : scheduleAnime.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:gap-4 md:gap-y-6">
                        {scheduleAnime.map((anime, index) => (
                            <AnimeCard key={`${anime.id}-${index}`} anime={anime} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 font-bold">Tidak ada jadwal rilis hari ini.</div>
                )}
            </div>
        </div>
    );
}
