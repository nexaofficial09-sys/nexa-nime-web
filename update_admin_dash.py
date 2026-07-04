import re

with open('src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update animeForm initial states
content = content.replace(
    "const [animeForm, setAnimeForm] = useState({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '' });",
    "const [animeForm, setAnimeForm] = useState({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '', total_episodes: '', aired_start: '', aired_end: '', source: 'MyAnimeList' });"
)
content = content.replace(
    "setAnimeForm({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '' });",
    "setAnimeForm({ title: '', description: '', type: 'SERIES', status: 'Ongoing', poster_url: '', mal_score: '', year: '', genres: '', duration: '', studio: '', total_episodes: '', aired_start: '', aired_end: '', source: 'MyAnimeList' });"
)

# Replace fetchFromMAL logic
old_fetch_logic = """                    studio: d.studios && d.studios.length > 0 ? d.studios[0].name : ''
                });"""

new_fetch_logic = """                    studio: d.studios && d.studios.length > 0 ? d.studios[0].name : '',
                    total_episodes: d.episodes ? d.episodes.toString() : '',
                    aired_start: d.aired?.from ? d.aired.from.split('T')[0] : '',
                    aired_end: d.aired?.to ? d.aired.to.split('T')[0] : '',
                    source: 'MyAnimeList'
                });"""
content = content.replace(old_fetch_logic, new_fetch_logic)

# Add Translate function
translate_func = """    const translateSynopsis = async () => {
        if (!animeForm.description) return;
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(animeForm.description)}&langpair=en|id`);
            const data = await res.json();
            if (data.responseData && data.responseData.translatedText) {
                setAnimeForm({...animeForm, description: data.responseData.translatedText});
            }
        } catch (err) {
            console.error("Translation error", err);
            alert("Gagal menerjemahkan.");
        }
    };"""

# Insert translation function before handleAddAnime
content = content.replace("const handleAddAnime =", translate_func + "\n\n    const handleAddAnime =")

# Add the new UI inputs for episodes, source, aired
# They should go near the score/year/duration/studio grid
old_grid = """                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Skor MAL</label>"""

new_grid = """                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Episode</label>
                        <input type="text" value={animeForm.total_episodes} onChange={e=>setAnimeForm({...animeForm, total_episodes: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="12" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Mulai Tayang</label>
                        <input type="date" value={animeForm.aired_start} onChange={e=>setAnimeForm({...animeForm, aired_start: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Selesai Tayang</label>
                        <input type="date" value={animeForm.aired_end} onChange={e=>setAnimeForm({...animeForm, aired_end: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Sumber</label>
                        <input type="text" value={animeForm.source} onChange={e=>setAnimeForm({...animeForm, source: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="MyAnimeList" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Skor MAL</label>"""

content = content.replace(old_grid, new_grid)

# Add Translate Button next to Synopsis label
old_synopsis_label = """<label className="block font-bold text-sm mb-1 uppercase">Sinopsis *</label>"""
new_synopsis_label = """<div className="flex justify-between items-end mb-1">
                        <label className="block font-bold text-sm uppercase">Sinopsis *</label>
                        <button type="button" onClick={translateSynopsis} className="text-[10px] bg-[#1a202c] text-white px-2 py-1 rounded border-[2px] border-[#1a202c] hover:bg-gray-800 uppercase font-bold">Terjemahkan ke Indo</button>
                    </div>"""

content = content.replace(old_synopsis_label, new_synopsis_label)

with open('src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AdminDashboard fully updated!")
