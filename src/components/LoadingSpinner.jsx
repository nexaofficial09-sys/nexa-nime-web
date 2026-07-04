import React from 'react';

export default function LoadingSpinner({ text = "Memuat..." }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="loadingspinner">
                <div id="square1"></div>
                <div id="square2"></div>
                <div id="square3"></div>
                <div id="square4"></div>
                <div id="square5"></div>
            </div>
            {text && (
                <p className="font-sans font-extrabold text-[12px] text-[#1a202c] uppercase tracking-wider animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}
