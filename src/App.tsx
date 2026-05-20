import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Star, 
  Home, 
  BookOpen, 
  Puzzle, 
  Trophy, 
  Volume2, 
  BookOpenCheck,
  Settings,
  GraduationCap,
  Sparkle
} from 'lucide-react';
import { UserStats } from './types';
import Dashboard from './components/Dashboard';
import MengenalHuruf from './components/MengenalHuruf';
import SukuKataPlayground from './components/SukuKataPlayground';
import PermainanSusunHuruf from './components/PermainanSusunHuruf';
import MembacaKalimat from './components/MembacaKalimat';
import { synth, speakIndonesian } from './utils/speech';

export default function App() {
  const [activeTab, setActiveTab] = useState<'beranda' | 'huruf' | 'suku' | 'game' | 'kalimat'>('beranda');
  
  // Game stats persisted locally
  const [stats, setStats] = useState<UserStats>({
    stars: 120, // Standard starting value matching user's mockup image
    unlockedLettersCount: 0,
    completedSyllablesCount: 0,
    solvedGamesCount: 0,
    completedSentencesCount: 0,
    streak: 1,
    kidName: 'Zidan',
  });

  const [unlockedLetters, setUnlockedLetters] = useState<string[]>([]);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('belajar_huruf_stats');
      const savedLetters = localStorage.getItem('belajar_huruf_unlocked');
      const savedSentences = localStorage.getItem('belajar_huruf_sentences');
      
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats({
          stars: parsed.stars !== undefined ? parsed.stars : 120,
          unlockedLettersCount: parsed.unlockedLettersCount || 0,
          completedSyllablesCount: parsed.completedSyllablesCount || 0,
          solvedGamesCount: parsed.solvedGamesCount || 0,
          completedSentencesCount: parsed.completedSentencesCount || 0,
          streak: parsed.streak || 1,
          kidName: parsed.kidName || 'Zidan'
        });
      }
      if (savedLetters) {
        setUnlockedLetters(JSON.parse(savedLetters));
      }
      if (savedSentences) {
        setCompletedSentences(JSON.parse(savedSentences));
      }
    } catch (e) {
      console.warn('Failed to load storage:', e);
    }
  }, []);

  // Save stats to localStorage on modification
  const saveToStorage = (newStats: UserStats, newLetters: string[], newSentences: string[]) => {
    try {
      localStorage.setItem('belajar_huruf_stats', JSON.stringify(newStats));
      localStorage.setItem('belajar_huruf_unlocked', JSON.stringify(newLetters));
      localStorage.setItem('belajar_huruf_sentences', JSON.stringify(newSentences));
    } catch (e) {
      console.warn('Failed to save to storage:', e);
    }
  };

  // Triggered when children unlocks a new letter
  const handleLetterUnlocked = (letter: string) => {
    if (unlockedLetters.includes(letter)) return;

    const newLetters = [...unlockedLetters, letter];
    setUnlockedLetters(newLetters);

    const newStats: UserStats = {
      ...stats,
      stars: stats.stars + 1, // Reward +1 star for exploring each letter card
      unlockedLettersCount: newLetters.length,
    };
    setStats(newStats);
    saveToStorage(newStats, newLetters, completedSentences);
  };

  // Triggered when children completes reading a sentence (+4 stars!)
  const handleSentenceRead = (sentenceId: string) => {
    if (completedSentences.includes(sentenceId)) return;

    const newSentences = [...completedSentences, sentenceId];
    setCompletedSentences(newSentences);

    const newStats: UserStats = {
      ...stats,
      stars: stats.stars + 4,
      completedSentencesCount: newSentences.length,
    };
    setStats(newStats);
    saveToStorage(newStats, unlockedLetters, newSentences);
  };

  // Earn stars from completing syllable matching puzzles (+3) or spelling games (+5)
  const earnStars = (amount: number, isSyllable: boolean = false) => {
    const isGame = !isSyllable;
    const newStats: UserStats = {
      ...stats,
      stars: stats.stars + amount,
      completedSyllablesCount: isSyllable ? stats.completedSyllablesCount + 1 : stats.completedSyllablesCount,
      solvedGamesCount: isGame ? stats.solvedGamesCount + 1 : stats.solvedGamesCount,
    };
    setStats(newStats);
    saveToStorage(newStats, unlockedLetters, completedSentences);
  };

  // Reset scores to start from scratch
  const handleResetStats = () => {
    const confirmReset = window.confirm(
      'Apakah Ayah dan Bunda ingin menghapus pencapaian dan mengulang dari awal permainan?'
    );
    if (confirmReset) {
      synth.playPop();
      const freshStats: UserStats = {
        stars: 120, // default starts fresh with standard stars
        unlockedLettersCount: 0,
        completedSyllablesCount: 0,
        solvedGamesCount: 0,
        completedSentencesCount: 0,
        streak: 1,
        kidName: 'Zidan',
      };
      setStats(freshStats);
      setUnlockedLetters([]);
      setCompletedSentences([]);
      saveToStorage(freshStats, [], []);
      speakIndonesian('Semua skor berhasil diulang! Ayo mulai belajar lagi!');
    }
  };

  // Change Child Profile Name
  const handleChangeKidName = (newName: string) => {
    const updatedStats = {
      ...stats,
      kidName: newName || 'Zidan'
    };
    setStats(updatedStats);
    saveToStorage(updatedStats, unlockedLetters, completedSentences);
    speakIndonesian(`Halo ${newName || 'Adik'}, nama barumu sudah terpasang!`);
  };

  const changeTab = (tab: 'beranda' | 'huruf' | 'suku' | 'game' | 'kalimat') => {
    synth.playPop();
    setActiveTab(tab);
    
    // Quick custom Indonesian voice assist depending on selected board tab
    if (tab === 'beranda') {
      speakIndonesian('Beranda Belajar.');
    } else if (tab === 'huruf') {
      speakIndonesian('Mari mengenal huruf.');
    } else if (tab === 'suku') {
      speakIndonesian('Mari mencocokkan suku kata.');
    } else if (tab === 'game') {
      speakIndonesian('Mari menyusun kata acak.');
    } else if (tab === 'kalimat') {
      speakIndonesian('Mari membaca kalimat sederhana.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff]/70 text-slate-800 flex flex-col md:flex-row font-sans antialiased selection:bg-amber-100 relative overflow-x-hidden">
      
      {/* 🏡 LEFT SIDEBAR NAVIGATION: Perfect high-fidelity look of desktop view from user image */}
      <aside className="w-64 bg-gradient-to-b from-[#1054a1] to-[#0c396e] border-r-4 border-[#072449] flex-shrink-0 text-white flex flex-col justify-between p-5 hidden md:flex min-h-screen select-none sticky top-0 h-screen shadow-2xl z-40">
        
        <div className="space-y-8">
          {/* Logo brand area centered */}
          <div 
            onClick={() => changeTab('beranda')}
            className="flex items-center gap-2.5 cursor-pointer group pb-4 border-b border-white/15"
          >
            <div className="bg-amber-400 text-[#1054a1] p-2 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 font-extrabold text-lg select-none">
              🎈
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-white font-sans flex flex-col">
                <span>Ayo</span>
                <span className="text-amber-400 uppercase tracking-widest text-xs mt-0.5">Membaca</span>
              </h1>
            </div>
          </div>

          {/* Sidebar Menu matching vertical list on image */}
          <nav className="flex flex-col gap-2">
            
            {/* Nav 1: Beranda */}
            <button
              onClick={() => changeTab('beranda')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-black text-sm text-left transition-all ${
                activeTab === 'beranda'
                  ? 'bg-sky-450/30 text-white border-l-4 border-amber-400 bg-sky-600/50 shadow-inner'
                  : 'text-sky-100 hover:bg-sky-700/40 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Beranda</span>
            </button>

            {/* Nav 2: Mengenal Huruf */}
            <button
              onClick={() => changeTab('huruf')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-black text-sm text-left transition-all ${
                activeTab === 'huruf'
                  ? 'bg-sky-600/50 text-white border-l-4 border-amber-400 bg-sky-600/50 shadow-inner'
                  : 'text-sky-100 hover:bg-sky-700/40 hover:text-white'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Belajar Huruf</span>
            </button>

            {/* Nav 3: Suku Kata */}
            <button
              onClick={() => changeTab('suku')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-black text-sm text-left transition-all ${
                activeTab === 'suku'
                  ? 'bg-sky-600/50 text-white border-l-4 border-amber-400 bg-sky-600/50 shadow-inner'
                  : 'text-sky-100 hover:bg-sky-700/40 hover:text-white'
              }`}
            >
              <Puzzle className="w-5 h-5" />
              <span>Belajar Membaca</span>
            </button>

            {/* Nav 4: Kalimat */}
            <button
              onClick={() => changeTab('kalimat')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-black text-sm text-left transition-all ${
                activeTab === 'kalimat'
                  ? 'bg-sky-600/50 text-white border-l-4 border-amber-400 bg-sky-600/50 shadow-inner'
                  : 'text-sky-100 hover:bg-sky-700/40 hover:text-white'
              }`}
            >
              <BookOpenCheck className="w-5 h-5" />
              <span>Baca Kata Sederhana</span>
            </button>

            {/* Nav 5: Permainan */}
            <button
              onClick={() => changeTab('game')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-black text-sm text-left transition-all ${
                activeTab === 'game'
                  ? 'bg-sky-600/50 text-white border-l-4 border-amber-400 bg-sky-600/50 shadow-inner'
                  : 'text-sky-100 hover:bg-sky-700/40 hover:text-white'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Kuis / Permainan</span>
            </button>

          </nav>
        </div>

        {/* Info label & Reset score shortcut at the bottom */}
        <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
          <div className="text-sky-200/60 font-medium">
            <p className="font-bold">Ayo Membaca v1.2</p>
            <p>Ejaan Murni Bahasa Indonesia</p>
          </div>
          <button 
            onClick={handleResetStats}
            className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/30 text-[11px]"
          >
            🔄 Ulang Pencapaian
          </button>
        </div>

      </aside>

      {/* 📱 MOBILE NAVIGATION BAR (Shown on small screens, hidden on desktop) */}
      <header className="bg-[#1054a1] border-b-3 border-amber-400 text-white sticky top-0 z-50 shadow-md md:hidden block">
        <div className="px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-2" onClick={() => changeTab('beranda')}>
            <span className="text-xl">🎒</span>
            <h1 className="text-base font-black tracking-tight uppercase">
              Ayo <span className="text-amber-400">Membaca</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-amber-400 text-amber-950 font-black px-2.5 py-1 rounded-full text-xs flex items-center gap-1 animate-pulse">
              ⭐ {stats.stars}
            </div>
            <div className="w-7 h-7 rounded-full bg-sky-400 flex items-center justify-center text-xs select-none shadow">
              👦
            </div>
          </div>
        </div>

        {/* Playful horizontal scrolling tab indicators */}
        <div className="bg-[#0b4282] overflow-x-auto scrollbar-none flex gap-1 p-2 border-t border-[#072d5a]">
          <button 
            onClick={() => changeTab('beranda')} 
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === 'beranda' ? 'bg-[#3b82f6] text-white shadow' : 'text-sky-100 hover:bg-sky-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Beranda
          </button>
          
          <button 
            onClick={() => changeTab('huruf')} 
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === 'huruf' ? 'bg-[#3b82f6] text-white shadow' : 'text-sky-100 hover:bg-sky-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Mengenal Huruf
          </button>

          <button 
            onClick={() => changeTab('suku')} 
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === 'suku' ? 'bg-[#3b82f6] text-white shadow' : 'text-sky-100 hover:bg-sky-800'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" /> Suku Kata
          </button>

          <button 
            onClick={() => changeTab('kalimat')} 
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === 'kalimat' ? 'bg-[#3b82f6] text-white shadow' : 'text-sky-100 hover:bg-sky-800'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" /> Membaca Kalimat
          </button>

          <button 
            onClick={() => changeTab('game')} 
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === 'game' ? 'bg-[#3b82f6] text-white shadow' : 'text-sky-100 hover:bg-sky-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Susun Kata
          </button>
        </div>
      </header>

      {/* 🚀 WORKSPACE VIEWPORT ON THE RIGHT */}
      <main className="flex-grow flex flex-col justify-between p-4 md:p-8 overflow-y-auto">
        
        {/* Playful Floating Cloud Vectors inside viewport edges */}
        <div className="absolute top-1/4 right-8 text-6xl select-none opacity-5 pointer-events-none">🪁</div>
        <div className="absolute bottom-1/4 left-10 text-6xl select-none opacity-5 pointer-events-none">🌈</div>

        <div className="flex-1 max-w-7xl mx-auto w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'beranda' && (
                <Dashboard
                  stats={stats}
                  onSelectTab={(tab) => {
                    if (tab === 'huruf') changeTab('huruf');
                    if (tab === 'suku') changeTab('suku');
                    if (tab === 'game') changeTab('game');
                    if (tab === 'kalimat') changeTab('kalimat');
                  }}
                  onResetStats={handleResetStats}
                  onChangeKidName={handleChangeKidName}
                />
              )}

              {activeTab === 'huruf' && (
                <MengenalHuruf
                  unlockedList={unlockedLetters}
                  onLetterUnlocked={handleLetterUnlocked}
                  stars={stats.stars}
                />
              )}

              {activeTab === 'suku' && (
                <SukuKataPlayground
                  onEarnStars={(amount) => earnStars(amount, true)}
                  stars={stats.stars}
                />
              )}

              {activeTab === 'game' && (
                <PermainanSusunHuruf
                  onEarnStars={(amount) => earnStars(amount, false)}
                  stars={stats.stars}
                />
              )}

              {activeTab === 'kalimat' && (
                <MembacaKalimat
                  onEarnStars={(amount) => handleSentenceRead(completedSentences[completedSentences.length - 1] || 'temp')}
                  completedSentences={completedSentences}
                  onSentenceRead={handleSentenceRead}
                  stars={stats.stars}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Unified Premium child educational footer */}
        <footer className="mt-16 text-center text-xs text-slate-400 max-w-lg mx-auto px-4 py-4 border-t border-slate-100 leading-relaxed font-sans select-none">
          <p className="font-extrabold text-slate-500">Ayo Membaca - Membantu Anak Indonesia Cilik Berbakat</p>
          <p className="mt-1 text-[11px]">
            Ejaan interaktif bahasa Indonesia, musik kiddy ceria, penghargaan bintang cerdas, dan animasi yang mulus.
          </p>
        </footer>

      </main>

    </div>
  );
}
