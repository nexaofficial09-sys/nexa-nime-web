import re
import sys

with open('src/pages/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# Update initial state
content = content.replace(
    "const [animeForm, setAnimeForm] = useState({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '' });",
    "const [animeForm, setAnimeForm] = useState({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '' });"
)

content = content.replace(
    "setAnimeForm({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '' });",
    "setAnimeForm({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '' });"
)

# Add malUrl state and fetch function before handleAnimeSubmit (which is actually handleAddAnime here?)
# wait, what is it named? Let's check handleAddAnime!
if 'const handleAddAnime =' in content:
    content = content.replace("const handleAddAnime =", "    const [malUrl, setMalUrl] = useState('');\n    const [fetchingMal, setFetchingMal] = useState(false);\n\n    const fetchFromMAL = async () => {\n        if (!malUrl) return;\n        const match = malUrl.match(/anime\\/(\\d+)/);\n        if (!match) {\n            alert('Tautan MyAnimeList tidak valid. Harus mengandung /anime/ID');\n            return;\n        }\n        const id = match[1];\n        setFetchingMal(true);\n        try {\n            const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`).then(r => r.json());\n            if (res.data) {\n                const d = res.data;\n                setAnimeForm({\n                    ...animeForm,\n                    title: d.title || '',\n                    description: d.synopsis ? d.synopsis.split('[Written by MAL')[0].trim() : '',\n                    type: d.type ? d.type.toUpperCase() : 'SERIES',\n                    poster_url: d.images?.jpg?.large_image_url || '',\n                    status: d.status === 'Currently Airing' ? 'Ongoing' : 'Completed',\n                    mal_score: d.score ? d.score.toString() : '',\n                    year: d.year ? d.year.toString() : '',\n                    genres: d.genres ? d.genres.map(g => g.name).join(', ') : '',\n                    duration: d.duration || '',\n                    studio: d.studios && d.studios.length > 0 ? d.studios[0].name : ''\n                });\n            } else {\n                alert('Anime tidak ditemukan di MAL');\n            }\n        } catch (err) {\n            console.error(err);\n            alert('Gagal mengambil data dari MAL');\n        }\n        setFetchingMal(false);\n    };\n\n    const handleAddAnime =")
else:
    print('Cannot find handleAddAnime')
    sys.exit(1)

ui_addition = """
                {/* Sinkronisasi MAL */}
                <div className="bg-[#f7fafc] p-4 border-[2px] border-[#1a202c] rounded-sm mb-4">
                    <label className="block font-bold text-sm mb-2 text-[#1a202c] uppercase">TARIK DATA DARI MYANIMELIST (Opsional)</label>
                    <div className="flex gap-2">
                        <input 
                            type="url" 
                            value={malUrl} 
                            onChange={e => setMalUrl(e.target.value)} 
                            className="flex-grow border-[2px] border-[#1a202c] rounded p-2 focus:outline-none focus:ring-2 ring-[#00d4ff]" 
                            placeholder="Contoh: https://myanimelist.net/anime/33443/Luo_Xiaohei_Zhanji" 
                        />
                        <button 
                            type="button" 
                            onClick={fetchFromMAL}
                            disabled={fetchingMal}
                            className="bg-[#ffde00] text-[#1a202c] font-black px-4 py-2 border-[2px] border-[#1a202c] rounded shadow-[2px_2px_0_0_#1a202c] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-[0px] active:shadow-[0px_0px_0_0_#1a202c] transition-all disabled:opacity-50"
                        >
                            {fetchingMal ? 'SEDOT...' : 'SEDOT DATA'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">*Masukkan link MAL, tekan Sedot Data, dan formulir di bawah akan terisi otomatis!</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Judul Anime *</label>
                        <input required type="text" value={animeForm.title} onChange={e=>setAnimeForm({...animeForm, title: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 focus:outline-none focus:ring-2 ring-[#00d4ff]" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block font-bold text-sm mb-1 uppercase">Tipe</label>
                            <select value={animeForm.type} onChange={e=>setAnimeForm({...animeForm, type: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2">
                                <option value="SERIES">Series</option>
                                <option value="MOVIE">Movie</option>
                                <option value="OVA">OVA</option>
                                <option value="ONA">ONA</option>
                                <option value="SPECIAL">Special</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block font-bold text-sm mb-1 uppercase">Status</label>
                            <select value={animeForm.status} onChange={e=>setAnimeForm({...animeForm, status: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2">
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-sm mb-1 uppercase">URL Poster (HD JPG) *</label>
                    <input required type="url" value={animeForm.poster_url} onChange={e=>setAnimeForm({...animeForm, poster_url: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="https://..." />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Skor MAL</label>
                        <input type="text" value={animeForm.mal_score} onChange={e=>setAnimeForm({...animeForm, mal_score: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="8.50" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Tahun</label>
                        <input type="text" value={animeForm.year} onChange={e=>setAnimeForm({...animeForm, year: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="2023" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Durasi</label>
                        <input type="text" value={animeForm.duration} onChange={e=>setAnimeForm({...animeForm, duration: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="24 min" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Studio</label>
                        <input type="text" value={animeForm.studio} onChange={e=>setAnimeForm({...animeForm, studio: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="MAPPA" />
                    </div>
                </div>
                
                <div>
                    <label className="block font-bold text-sm mb-1 uppercase">Genre</label>
                    <input type="text" value={animeForm.genres} onChange={e=>setAnimeForm({...animeForm, genres: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="Action, Adventure, Fantasy" />
                </div>
                
                <div>
                    <label className="block font-bold text-sm mb-1 uppercase">Sinopsis *</label>
                    <textarea required rows={5} value={animeForm.description} onChange={e=>setAnimeForm({...animeForm, description: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2 text-sm leading-relaxed"></textarea>
                </div>
                <button type="submit"
"""

start_marker = '<form onSubmit={handleAddAnime} className="space-y-4">'
end_marker = '<button type="submit"'

idx_start = content.find(start_marker)
idx_end = content.find(end_marker, idx_start)

if idx_start != -1 and idx_end != -1:
    new_content = content[:idx_start + len(start_marker)] + ui_addition + content[idx_end + len(end_marker):]
    with open('src/pages/AdminDashboard.jsx', 'w') as f:
        f.write(new_content)
    print('AdminDashboard successfully modified!')
else:
    print('Could not find markers in AdminDashboard')
