import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomDropdown from '../components/CustomDropdown';

const GENRES = [
    { id: 14, name: "Action" },
    { id: 16, name: "Adventure" },
    { id: 25, name: "Comedy" },
    { id: 43, name: "Demons" },
    { id: 20, name: "Drama" },
    { id: 17, name: "Ecchi" },
    { id: 13, name: "Fantasy" },
    { id: 37, name: "Game" },
    { id: 29, name: "Harem" },
    { id: 18, name: "Historical" },
    { id: 35, name: "Horror" },
    { id: 30, name: "Magic" },
    { id: 15, name: "Martial Arts" },
    { id: 40, name: "Mecha" },
    { id: 36, name: "Military" },
    { id: 33, name: "Music" },
    { id: 21, name: "Mystery" },
    { id: 44, name: "Parody" },
    { id: 23, name: "Psychological" },
    { id: 19, name: "Romance" },
    { id: 26, name: "School" },
    { id: 31, name: "Sci-Fi" },
    { id: 22, name: "Seinen" },
    { id: 38, name: "Shoujo" },
    { id: 49, name: "Shoujo Ai" },
    { id: 32, name: "Shounen" },
    { id: 51, name: "Shounen Ai" },
    { id: 27, name: "Slice of Life" },
    { id: 42, name: "Sports" },
    { id: 41, name: "Super Power" },
    { id: 24, name: "Supernatural" },
    { id: 34, name: "Thriller" },
    { id: 128, name: "Tokusatsu" }
];
const TYPES = ["SERIES", "MOVIE", "ONA", "OVA", "LIVE ACTION", "SPECIAL"];
const YEARS = [
    "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", 
    "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", 
    "2000an", "1900an", "UNKNOWN"
];
const STUDIOS = [
    "MAPPA", "Ufotable", "Kyoto Animation", "CloverWorks", "A-1 Pictures", 
    "WIT Studio", "Bones", "Madhouse", "Production I.G", "Pierrot", 
    "Toei Animation", "Sunrise", "Trigger", "David Production", "J.C.Staff", 
    "Silver Link", "White Fox", "LidenFilms", "P.A. Works", "Shaft", 
    "Kinema Citrus", "Doga Kobo", "8bit", "Passione", "GoHands", 
    "TMS Entertainment", "Orange", "Brain's Base", "Studio Ghibli", "Studio Deen"
];

import { useLocation } from 'react-router-dom';

export default function Explorer() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [animeList, setAnimeList] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({
        id_genre: queryParams.get('id_genre') || '',
        type: queryParams.get('type') || '',
        year: queryParams.get('year') || '',
        studio: queryParams.get('studio') || ''
    });

    const fetchAnime = async (targetPage) => {
        setLoading(true);
        try {
            const apiPage = targetPage - 1; // 0-based for API
            const queryParams = new URLSearchParams({
                page: apiPage,
                id_genre: filters.id_genre,
                type: filters.type,
                year: filters.year,
                studio: filters.studio
            });

            const res = await fetch(`http://127.0.0.1:5000/api/explore_anime?${queryParams.toString()}`).then(r => r.json());
            
            let fetchedList = [];
            if (res.data?.movie) {
                fetchedList = res.data.movie;
            } else if (Array.isArray(res.data)) {
                fetchedList = res.data;
            }

            if (fetchedList.length > 0) {
                setAnimeList(fetchedList);
                if (fetchedList.length < 60) {
                    setTotalPages(targetPage);
                } else if (targetPage >= totalPages) {
                    setTotalPages(targetPage + 1);
                }
            } else {
                setAnimeList([]);
                setTotalPages(targetPage > 1 ? targetPage - 1 : 1);
            }
        } catch (err) {
            console.error("Gagal memuat explorer:", err);
            setAnimeList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setTotalPages(1);
        fetchAnime(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            fetchAnime(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderPagination = () => {
        if (totalPages <= 1 && animeList.length === 0) return null;

        const buttons = [];
        const btnClass = (active) => `flex items-center justify-center min-w-[40px] px-2 h-10 border-[3px] border-[#1a202c] rounded-md font-extrabold text-[15px] shadow-[3px_3px_0_0_#1a202c] transition-transform hover:-translate-y-0.5 ${active ? 'bg-[#00d4ff] text-[#1a202c]' : 'bg-white text-[#1a202c]'}`;
        
        // Prev button
        if (page > 1) {
            buttons.push(
                <button key="prev" onClick={() => handlePageChange(page - 1)} className="px-3 h-10 bg-white border-[3px] border-[#1a202c] rounded-md font-extrabold text-[14px] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-0.5 transition-transform mr-1">
                    &larr; Sebelumnya
                </button>
            );
        }

        // Page 1
        buttons.push(
            <button key={1} onClick={() => handlePageChange(1)} className={btnClass(page === 1)}>1</button>
        );

        if (page > 3) {
            buttons.push(<span key="dots1" className="font-extrabold px-1 text-lg">...</span>);
        }

        if (page > 2) {
            buttons.push(
                <button key={page - 1} onClick={() => handlePageChange(page - 1)} className={btnClass(false)}>{page - 1}</button>
            );
        }

        if (page !== 1 && page !== totalPages) {
            buttons.push(
                <button key={page} onClick={() => handlePageChange(page)} className={btnClass(true)}>{page}</button>
            );
        }

        if (page < totalPages - 1) {
            buttons.push(
                <button key={page + 1} onClick={() => handlePageChange(page + 1)} className={btnClass(false)}>{page + 1}</button>
            );
        }

        if (page < totalPages - 2) {
            buttons.push(<span key="dots2" className="font-extrabold px-1 text-lg">...</span>);
        }

        if (totalPages > 1) {
            buttons.push(
                <button key={totalPages} onClick={() => handlePageChange(totalPages)} className={btnClass(page === totalPages)}>{totalPages}</button>
            );
        }

        // Next button
        if (page < totalPages) {
            buttons.push(
                <button key="next" onClick={() => handlePageChange(page + 1)} className="px-3 h-10 bg-white border-[3px] border-[#1a202c] rounded-md font-extrabold text-[14px] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-0.5 transition-transform ml-1">
                    Selanjutnya &rarr;
                </button>
            );
        }

        return (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {buttons}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col gap-5 animate-fade-in pb-10 min-h-[100vh]">
            
            {/* Top Filter Bar */}
            <div className="bg-white border-[3px] border-[#1a202c] rounded-md px-4 py-2 shadow-[4px_4px_0_0_#1a202c]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h1 className="font-sans font-extrabold text-xl md:text-2xl text-[#1a202c] uppercase tracking-wide flex-shrink-0">
                        Explore Anime
                    </h1>
                    
                    <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-3 w-full lg:w-auto">
                        <CustomDropdown
                            name="id_genre"
                            value={filters.id_genre}
                            onChange={handleFilterChange}
                            placeholder="Semua Genre"
                            options={GENRES.map(g => ({ value: g.id, label: g.name }))}
                        />

                        <CustomDropdown
                            name="studio"
                            value={filters.studio}
                            onChange={handleFilterChange}
                            placeholder="Semua Studio"
                            options={STUDIOS.map(s => ({ value: s, label: s }))}
                        />

                        <CustomDropdown
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            placeholder="Semua Tahun"
                            options={YEARS.map(y => ({ value: y, label: y }))}
                        />

                        <CustomDropdown
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            placeholder="Semua Tipe"
                            options={TYPES.map(t => ({ value: t, label: t }))}
                        />
                    </div>
                </div>
            </div>

            {/* Anime Grid */}
            <div className="min-h-[500px]">
                {loading && animeList.length === 0 ? (
                    <div className="flex justify-center items-center h-[300px]">
                        <LoadingSpinner text="Memuat Anime..." />
                    </div>
                ) : animeList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:gap-4 md:gap-y-6">
                            {animeList.map((anime, index) => (
                                <AnimeCard key={`${anime.id}-${index}`} anime={anime} />
                            ))}
                        </div>
                        
                        {renderPagination()}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center gap-2">
                        <span className="text-4xl">🔍</span>
                        <h3 className="font-bold text-lg text-[#1a202c]">Tidak ada anime ditemukan</h3>
                        <p className="text-sm text-slate-500 font-semibold">Coba ubah filter kategori Anda.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
