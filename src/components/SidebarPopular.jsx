import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export default function SidebarPopular({ popularList, title = 'ANIME POPULER' }) {
    const proxyUrl = (url) => {
        if (!url) return '';
        return `http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(url)}`;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header - same height as EPISODE BARU header */}
            <div className="bg-white border-[2px] border-[#1a202c] rounded-sm px-4 py-2.5 shadow-[3px_3px_0_0_#1a202c]">
                <h3 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">
                    {title}
                </h3>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 pl-1 pr-1">
                {popularList.map((anime, index) => (
                    <Link 
                        key={index} 
                        to={`/anime/${anime.id}`}
                        className="group block relative bg-white border-[2px] border-[#1a202c] rounded-lg shadow-[3px_3px_0_0_#1a202c] p-2 pr-3 pl-5 ml-4 mb-1 hover:-translate-y-0.5 transition-transform"
                    >
                        {/* Rank Badge with Fold */}
                        <div className="absolute -left-[18px] -top-[2px] z-10">
                            <div className="bg-[#41a3f2] text-white font-extrabold w-8 h-8 flex items-center justify-center rounded-[0.25rem] border-[2px] border-[#1a202c] relative z-10 text-sm">
                                {index + 1}
                            </div>
                            {/* Fold Triangle */}
                            <div className="absolute top-[100%] left-0 w-0 h-0 border-t-[8px] border-t-[#1a202c] border-l-[18px] border-l-transparent -mt-[2px] -z-10"></div>
                        </div>
                        
                        <div className="flex gap-3">
                            {/* Image */}
                            <div className="w-[50px] h-[65px] flex-shrink-0 border-[2px] border-[#1a202c] overflow-hidden rounded-md relative bg-zinc-100">
                                <img 
                                    src={proxyUrl(anime.image_poster || anime.image_cover)}
                                    alt={anime.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            
                            {/* Info */}
                            <div className="flex flex-col justify-center min-w-0 flex-grow py-0.5">
                                <h4 className="font-sans font-bold text-sm text-[#0f172a] line-clamp-2 leading-snug group-hover:text-[#41a3f2] transition-colors mb-0.5">
                                    {anime.title}
                                </h4>
                                {anime.genre && (
                                    <p className="text-[12px] text-slate-500 font-medium line-clamp-1">
                                        {anime.genre}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
                {popularList.length === 0 && (
                    <div className="bg-white border-[2px] border-[#1a202c] rounded-sm p-3 shadow-[3px_3px_0_0_#1a202c]">
                        <div className="flex justify-center items-center py-4"><LoadingSpinner /></div>
                    </div>
                )}
            </div>
        </div>
    );
}
