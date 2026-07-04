import re

with open('src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add isCustomCategory state
if 'const [isCustomCategory' not in content:
    content = content.replace(
        'const [showAddModal, setShowAddModal] = useState(false);',
        'const [showAddModal, setShowAddModal] = useState(false);\n  const [isCustomCategory, setIsCustomCategory] = useState(false);'
    )

# Update animeForm initial state
content = content.replace(
    "source: 'MyAnimeList' });",
    "source: 'MyAnimeList', category_name: 'NEXA ORIGINALS' });"
)

# Add category_name UI
old_source_input = """                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Sumber</label>
                        <input type="text" value={animeForm.source} onChange={e=>setAnimeForm({...animeForm, source: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="MyAnimeList" />
                    </div>"""

new_category_ui = """                    <div>
                        <label className="block font-bold text-sm mb-1 uppercase">Sumber</label>
                        <input type="text" value={animeForm.source} onChange={e=>setAnimeForm({...animeForm, source: e.target.value})} className="w-full border-[2px] border-[#1a202c] rounded p-2" placeholder="MyAnimeList" />
                    </div>
                </div>

                <div className="bg-[#f7fafc] p-4 border-[2px] border-[#1a202c] rounded-sm mb-4">
                    <label className="block font-bold text-sm mb-2 text-[#1a202c] uppercase">Pilih Kategori Penempatan Anime *</label>
                    <select 
                        value={isCustomCategory ? 'KUSTOM_BARU' : animeForm.category_name} 
                        onChange={e => {
                            if (e.target.value === 'KUSTOM_BARU') {
                                setIsCustomCategory(true);
                                setAnimeForm({...animeForm, category_name: ''});
                            } else {
                                setIsCustomCategory(false);
                                setAnimeForm({...animeForm, category_name: e.target.value});
                            }
                        }}
                        className="w-full border-[2px] border-[#1a202c] rounded p-2 focus:outline-none focus:ring-2 ring-[#00d4ff] mb-2 font-bold uppercase"
                    >
                        <option value="NEXA ORIGINALS">NEXA ORIGINALS (Bawaan)</option>
                        <option value="ANIME MOVIE">ANIME MOVIE</option>
                        <option value="EPISODE BARU">EPISODE BARU</option>
                        <option value="SEDANG HANGAT">SEDANG HANGAT</option>
                        <option value="JUDUL BARU">JUDUL BARU</option>
                        <option value="ANIME SERIES">ANIME SERIES</option>
                        <option value="ANIME POPULER">ANIME POPULER</option>
                        <option value="PALING DI NANTI">PALING DI NANTI</option>
                        <option value="KUSTOM_BARU">+ Buat Kategori Baru Sendiri</option>
                    </select>
                    {isCustomCategory && (
                        <input 
                            type="text" 
                            required
                            placeholder="Ketik Nama Kategori Baru (misal: ANIME FAVORIT ADMIN)" 
                            value={animeForm.category_name} 
                            onChange={e => setAnimeForm({...animeForm, category_name: e.target.value})} 
                            className="w-full border-[2px] border-[#1a202c] rounded p-2 font-bold uppercase text-[#1a202c] bg-white mt-1" 
                        />
                    )}"""

content = content.replace(old_source_input, new_category_ui)

with open('src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AdminDashboard UI updated!")
