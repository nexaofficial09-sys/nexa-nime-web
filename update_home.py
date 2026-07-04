import re

with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add dynamicCategories state
if 'const [dynamicCategories' not in content:
    content = content.replace(
        'const [customAnime, setCustomAnime] = useState([]);',
        'const [customAnime, setCustomAnime] = useState([]);\n  const [dynamicCategories, setDynamicCategories] = useState({});'
    )

# 2. Update fetchData logic
old_fetch = """        const episodesList = resNew.data?.movie || resNew.data || [];
        setNewEpisodes(episodesList.slice(0, 15));
        
        if (resMovies.data?.movie) setMovieAnime(resMovies.data.movie.slice(0, 15)); // Increased to 15 to show scrolling
        if (resPopular.data?.movie) setPopularAnime(resPopular.data.movie.slice(0, 8));
        if (resHot.data?.movie) setHotAnime(resHot.data.movie.slice(0, 15));
        if (resNewTitle.data?.movie) setNewAnime(resNewTitle.data.movie.slice(0, 15));
        if (resSchedule.data?.movie) setScheduleAnime(resSchedule.data.movie.slice(0, 10));
        if (resSeries.data?.movie) setSeriesAnime(resSeries.data.movie.slice(0, 15));
        if (resWaiting.data?.movie) setWaitingAnime(resWaiting.data.movie.slice(0, 10));
        if (resCustom?.data) setCustomAnime(resCustom.data);"""

new_fetch = """        let cGroups = {};
        let dCats = {};
        if (resCustom?.data) {
            resCustom.data.forEach(a => {
                let c = a.category_name || 'NEXA ORIGINALS';
                if (!cGroups[c]) cGroups[c] = [];
                cGroups[c].push(a);
            });
            setCustomAnime(cGroups['NEXA ORIGINALS'] || []);
            
            // Collect dynamic categories
            const standardCats = ['NEXA ORIGINALS', 'ANIME MOVIE', 'EPISODE BARU', 'SEDANG HANGAT', 'JUDUL BARU', 'ANIME SERIES', 'ANIME POPULER', 'PALING DI NANTI'];
            Object.keys(cGroups).forEach(k => {
                if (!standardCats.includes(k)) {
                    dCats[k] = cGroups[k];
                }
            });
            setDynamicCategories(dCats);
        }

        const getGrp = (key) => cGroups[key] || [];

        const episodesList = resNew.data?.movie || resNew.data || [];
        setNewEpisodes([...getGrp('EPISODE BARU'), ...episodesList].slice(0, 15));
        
        if (resMovies.data?.movie) setMovieAnime([...getGrp('ANIME MOVIE'), ...resMovies.data.movie].slice(0, 15));
        if (resPopular.data?.movie) setPopularAnime([...getGrp('ANIME POPULER'), ...resPopular.data.movie].slice(0, 8));
        if (resHot.data?.movie) setHotAnime([...getGrp('SEDANG HANGAT'), ...resHot.data.movie].slice(0, 15));
        if (resNewTitle.data?.movie) setNewAnime([...getGrp('JUDUL BARU'), ...resNewTitle.data.movie].slice(0, 15));
        if (resSchedule.data?.movie) setScheduleAnime(resSchedule.data.movie.slice(0, 10));
        if (resSeries.data?.movie) setSeriesAnime([...getGrp('ANIME SERIES'), ...resSeries.data.movie].slice(0, 15));
        if (resWaiting.data?.movie) setWaitingAnime([...getGrp('PALING DI NANTI'), ...resWaiting.data.movie].slice(0, 10));"""

content = content.replace(old_fetch, new_fetch)

# 3. Dynamic Render block
old_nexa = """        {/* ===== NEXA ORIGINALS ===== */}
        {customAnime.length > 0 && (
          <section>
            <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
              <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">⭐ NEXA ORIGINALS</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
                {customAnime.map((anime, i) => (
                    <div key={`custom-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                        <AnimeCard anime={anime} />
                    </div>
                ))}
            </div>
          </section>
        )}"""

new_nexa = """        {/* ===== NEXA ORIGINALS ===== */}
        {customAnime.length > 0 && (
          <section>
            <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
              <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">NEXA ORIGINALS</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
                {customAnime.map((anime, i) => (
                    <div key={`custom-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                        <AnimeCard anime={anime} />
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* ===== DYNAMIC CATEGORIES ===== */}
        {Object.keys(dynamicCategories).map(catName => (
          <section key={catName}>
            <div className="bg-white border-[2px] border-[#1a202c] px-4 py-1.5 rounded-sm shadow-[3px_3px_0_0_#1a202c] mb-4 flex items-center justify-between">
              <h2 className="font-sans font-extrabold text-lg text-[#1a202c] tracking-tight uppercase">{catName}</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin' }}>
                {dynamicCategories[catName].map((anime, i) => (
                    <div key={`dcat-${catName}-${i}`} className="flex-shrink-0 w-[145px] md:w-[155px] lg:w-[160px] snap-start">
                        <AnimeCard anime={anime} isHot={true} />
                    </div>
                ))}
            </div>
          </section>
        ))}"""

content = content.replace(old_nexa, new_nexa)

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Home.jsx fully updated!")
