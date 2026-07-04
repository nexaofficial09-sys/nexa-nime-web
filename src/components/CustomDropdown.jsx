import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({ value, options, onChange, name, placeholder = "Pilih..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Get display label
    const selectedOption = options.find(opt => opt.value === value || opt.value === Number(value) || opt.value === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val) => {
        onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    return (
        <div className="relative w-full lg:w-auto lg:min-w-[150px]" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full bg-zinc-50 border-[2px] border-[#1a202c] rounded-md px-3 py-1.5 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#00d4ff] shadow-[2px_2px_0_0_#1a202c] cursor-pointer"
            >
                <span className="truncate mr-2">{displayLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-[2px] border-[#1a202c] rounded-md shadow-[4px_4px_0_0_#1a202c] max-h-60 overflow-y-auto custom-scrollbar">
                    <ul className="py-1 text-[13px] font-bold text-[#1a202c]">
                        <li 
                            onClick={() => handleSelect("")}
                            className={`px-3 py-2 cursor-pointer hover:bg-[#00d4ff] hover:text-[#1a202c] transition-colors ${value === "" ? 'bg-[#00d4ff] text-[#1a202c]' : ''}`}
                        >
                            {placeholder}
                        </li>
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-3 py-2 cursor-pointer hover:bg-[#00d4ff] hover:text-[#1a202c] transition-colors border-t border-zinc-100 ${value === opt.value || value === Number(opt.value) || value === String(opt.value) ? 'bg-[#00d4ff] text-[#1a202c]' : ''}`}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
