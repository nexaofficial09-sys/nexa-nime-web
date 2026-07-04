import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export default function SidebarWaiting({ waitingList }) {
    const proxyUrl = (url) => {
        if (!url) return '';
        return `https://api.nexalabs.my.id/proxy_image?url=${encodeURIComponent(url)}`;
    };

    return (
        <div className="flex flex-col gap-4 mt-8">
            {/* Header */}
            <div className="bg-white border-[2px] border-[#1a202c] rounded-sm px-4 py-2.5 shadow-[3px_3px_0_0_#1a202c]">
                <h3 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">
                    PALING DI NANTI
                </h3>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {waitingList.map((anime, index) => (
                    <Link 
                        key={index} 
                        to={`/anime/${anime.id}`}
                        className="group block relative bg-white border-[2px] border-[#1a202c] rounded-lg shadow-[3px_3px_0_0_#1a202c] p-2 hover:-translate-y-0.5 transition-transform"
                    >
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
                                <div className="flex justify-between items-center mt-auto">
                                    {anime.genre && (
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1 truncate pr-2">
                                            {anime.genre}
                                        </p>
                                    )}
                                    <span className="text-[9px] font-extrabold bg-[#f39c12] text-white px-1.5 py-0.5 rounded-[4px] whitespace-nowrap shadow-sm">
                                        WAITING
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {waitingList.length === 0 && (
                    <div className="bg-white border-[2px] border-[#1a202c] rounded-sm p-3 shadow-[3px_3px_0_0_#1a202c]">
                        <div className="flex justify-center items-center py-4"><LoadingSpinner /></div>
                    </div>
                )}
            </div>
        </div>
    );
}
