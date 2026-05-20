import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Puzzle, 
  Speech, 
  Flame, 
  Star, 
  GraduationCap, 
  Smile, 
  Settings, 
  ChevronDown, 
  User, 
  Edit3, 
  Check, 
  Volume2 
} from 'lucide-react';
import { UserStats } from '../types';
import { synth, speakIndonesian } from '../utils/speech';
import { syllableWordsData, sentencesData, gameWordsData } from '../data';

interface DashboardProps {
  stats: UserStats;
  onSelectTab: (tab: 'huruf' | 'suku' | 'game' | 'kalimat') => void;
  onResetStats: () => void;
  onChangeKidName: (newName: string) => void;
}

export default function Dashboard({ 
  stats, 
  onSelectTab, 
  onResetStats, 
  onChangeKidName 
}: DashboardProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats.kidName || 'Zidan');

  const kidName = stats.kidName || 'Zidan';

  // Dynamic calculations for circular progress percentages
  const letterProgressPercent = Math.min(Math.round((stats.unlockedLettersCount / 26) * 100), 100) || 0;
  // Syllables progress calculated dynamically based on total syllable words count
  const syllableProgressPercent = Math.min(Math.round((stats.completedSyllablesCount / syllableWordsData.length) * 100), 100) || 0;
  // Sentences progress calculated dynamically based on total sentences count
  const sentenceProgressPercent = Math.min(Math.round((stats.completedSentencesCount / sentencesData.length) * 100), 100) || 0;
  // Solved spelling games based on total words count
  const gameProgressPercent = Math.min(Math.round((stats.solvedGamesCount / gameWordsData.length) * 100), 100) || 0;

  const speakWelcome = () => {
    synth.playPop();
    speakIndonesian(`Halo sahabat pintar! Selamat datang kembali, ${kidName}. Mari kita belajar membaca dengan gembira bersama Kiki si Dinosaurus!`);
  };

  const speakTip = (tipText: string) => {
    synth.playPop();
    speakIndonesian(tipText);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onChangeKidName(tempName.trim());
      setIsEditingName(false);
      setShowProfileDropdown(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-1 antialiased text-slate-800">
      
      {/* Top Header Row matching the premium image design */}
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-3 px-5 rounded-3xl border border-sky-100 shadow-xs">
        {/* Brand Banner with custom tagline */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎒</span>
          <div>
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">Pondok Belajar</span>
            <h2 className="text-base font-black text-[#1054a1] leading-none">Ayo Membaca</h2>
          </div>
        </div>

        {/* Info widgets line up: Stars Tracker & Profile Widget */}
        <div className="flex items-center gap-4">
          
          {/* Dynamic star pill */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              synth.playLevelUp();
              speakIndonesian(`Bintang kamu saat ini adalah ${stats.stars}! Luar biasa hebat!`);
            }}
            className="flex items-center gap-2 bg-[#fef3c7] hover:bg-[#fde68a] transition-colors border-2 border-amber-300 py-1.5 px-4 rounded-full font-black text-amber-700 shadow-xs cursor-pointer select-none text-sm"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span className="font-mono">{stats.stars}</span>
          </motion.div>

          {/* Child Profile Dropdown Card */}
          <div className="relative">
            <button 
              onClick={() => {
                synth.playPop();
                setShowProfileDropdown(!showProfileDropdown);
              }}
              className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100/80 border border-sky-100 p-1.5 px-3 rounded-2xl cursor-pointer select-none transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-lg shadow-sm border border-white">
                👦
              </div>
              <span className="text-sm font-black text-slate-700">Hai, {kidName}!</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Options Card */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-slate-100 shadow-xl p-4 z-50 space-y-3"
                >
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-dashed border-slate-100">
                    Akun Belajar Anak
                  </p>

                  {isEditingName ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 block">Nama Panggilan Anak:</label>
                      <div className="flex gap-1">
                        <input 
                          type="text" 
                          value={tempName} 
                          onChange={(e) => setTempName(e.target.value)} 
                          className="flex-1 text-xs border border-slate-200 p-2 rounded-xl focus:outline-teal-400 font-bold"
                          placeholder="Ketik nama anak..."
                          maxLength={15}
                        />
                        <button 
                          onClick={handleSaveName}
                          className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">NAMA SEKOLAH</span>
                        <span className="text-sm font-extrabold text-[#1054a1]">{kidName}</span>
                      </div>
                      <button 
                        onClick={() => {
                          synth.playPop();
                          setIsEditingName(true);
                        }}
                        className="p-1 px-2.5 bg-white border border-slate-100 rounded-lg text-slate-500 hover:text-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Ubah
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        synth.playPop();
                        setShowProfileDropdown(false);
                        onResetStats();
                      }}
                      className="w-full text-left p-2 hover:bg-rose-50 rounded-xl text-neutral-500 hover:text-red-600 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      🔄 Ulangi Semua Pencapaian
                    </button>
                    <button 
                      onClick={() => {
                        synth.playPop();
                        setShowProfileDropdown(false);
                        speakIndonesian("Ayo membaca dirancang secara interaktif untuk melatih motorik dan ejaan anak sejak dini!");
                      }}
                      className="w-full text-left p-2 hover:bg-sky-50 rounded-xl text-slate-500 hover:text-[#1054a1] transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      📢 Dengar Panduan Guru
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Hero Welcome Banner Card featuring generated smiling boy illustration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-[#e0f2fe] via-[#ecfbfd] to-[#fffde6] rounded-[40px] border-4 border-white shadow-md overflow-hidden min-h-[280px] relative">
        
        {/* Decorative clouds */}
        <span className="absolute top-4 right-10 text-4xl select-none opacity-20 animate-wiggle">☁️</span>
        <span className="absolute bottom-6 left-1/3 text-4xl select-none opacity-20 animate-wiggle">☁️</span>

        {/* Left Side: Generative illustration matching dashboard mockup */}
        <div className="lg:col-span-5 relative flex items-center justify-center bg-sky-200/40 p-6 lg:p-0">
          <img 
            src="/src/assets/images/occi.png" 
            alt="Anak Membaca" 
            referrerPolicy="no-referrer"
            className="w-full max-w-[280px] lg:max-w-full h-auto max-h-[290px] object-contain rounded-3xl transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-white/75 backdrop-blur-md px-3 py-1 rounded-xl border border-sky-100 text-[10px] font-black uppercase text-sky-700 tracking-wider">
            Petualangan Edukasi
          </div>
        </div>

        {/* Right Side: Welcome message with responsive text */}
        <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center text-center lg:text-left space-y-4">
          <div className="inline-flex self-center lg:self-start items-center gap-1.5 px-3 py-1 bg-sky-400/10 border border-sky-200 rounded-full text-sky-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" /> Sahabat Pintar
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            Selamat datang kembali,<br/>
            <span className="text-[#1054a1] drop-shadow-xs relative">
              {kidName}!
              <span className="absolute left-0 right-0 bottom-1 h-2 bg-amber-200/70 -z-10 rounded" />
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 font-medium max-w-md leading-relaxed">
            Yuk, kita bersenang-senang mengumpulkan bintang sambil pintar mengenal huruf, melafalkan suku kata, dan melatih kalimat membaca!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start">
            <button 
              onClick={speakWelcome}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl border-b-4 border-teal-700 font-extrabold flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5 transition-all cursor-pointer text-sm"
            >
              <Volume2 className="w-4 h-4 animate-bounce" /> Sapa Aku Kiki! 🔊
            </button>
            <button 
              onClick={() => {
                synth.playPop();
                onSelectTab('huruf');
              }}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold rounded-2xl border-b-4 border-amber-600 text-sm shadow-sm active:translate-y-0.5 transition-all text-center cursor-pointer"
            >
              Mulai Petualangan 🚀
            </button>
          </div>
        </div>

      </div>

      {/* Path Menu: Four Core cards from the Uploaded Image Mockup */}
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-4 px-1 flex items-center gap-2">
          <span>📚</span> Pilih Papan Belajarmu:
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Module 1: Mengenal Huruf */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => {
              synth.playPop();
              onSelectTab('huruf');
            }}
            className="bg-white p-5 rounded-[32px] border-3 border-[#fed7aa] hover:shadow-lg transition-all cursor-pointer flex flex-col h-full relative overflow-hidden group shadow-xs"
          >
            {/* Playful letter graphics badge */}
            <div className="absolute top-4 right-4 text-4xl select-none font-bold text-amber-500 opacity-20 group-hover:scale-110 transition-transform">
              🔤
            </div>
            {/* Illustration space */}
            <div className="bg-[#fff7ed] flex items-center justify-center h-28 w-28 rounded-full mb-4 mx-auto border-2 border-orange-100 group-hover:rotate-6 transition-transform">
              <span className="text-6xl font-black text-amber-500 select-none">A</span>
              <span className="text-4xl font-black text-rose-500 self-end -ml-2 -mb-2 select-none">B</span>
              <span className="text-2xl font-black text-sky-500 self-start -ml-1 mt-2 select-none">C</span>
            </div>
            <div className="text-center space-y-1.5 flex-1 flex flex-col">
              <h4 className="text-lg font-black text-amber-600">Mengenal Huruf</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 flex-grow">
                Belajar & dengar ejaan huruf A-Z disertai hewan dan contoh interaktif!
              </p>
              <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs rounded-2xl border-b-4 border-orange-700 shadow-sm uppercase group-hover:translate-y-0.5 transition-all cursor-pointer">
                Mulai Belajar
              </button>
            </div>
          </motion.div>

          {/* Module 2: Belajar Membaca (Suku Kata) */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => {
              synth.playPop();
              onSelectTab('suku');
            }}
            className="bg-white p-5 rounded-[32px] border-3 border-[#bbf7d0] hover:shadow-lg transition-all cursor-pointer flex flex-col h-full relative overflow-hidden group shadow-xs"
          >
            <div className="absolute top-4 right-4 text-4xl select-none font-bold text-emerald-500 opacity-20 group-hover:scale-110 transition-transform">
              📖
            </div>
            <div className="bg-[#f0fdf4] flex items-center justify-center h-28 w-28 rounded-full mb-4 mx-auto border-2 border-emerald-100 group-hover:rotate-6 transition-transform">
              <span className="text-5xl select-none">📚📖</span>
            </div>
            <div className="text-center space-y-1.5 flex-1 flex flex-col">
              <h4 className="text-lg font-black text-emerald-600 font-sans">Belajar Membaca</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 flex-grow">
                Gabung potongan suku kata BA-PA, MI-MI menjadi ejaan suara lengkap!
              </p>
              <button className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-extrabold text-xs rounded-2xl border-b-4 border-green-700 shadow-sm uppercase group-hover:translate-y-0.5 transition-all cursor-pointer">
                Mulai Gabung
              </button>
            </div>
          </motion.div>

          {/* Module 3: Baca Kata (Membaca Kalimat Sederhana) */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => {
              synth.playPop();
              onSelectTab('kalimat');
            }}
            className="bg-white p-5 rounded-[32px] border-3 border-[#93c5fd] hover:shadow-lg transition-all cursor-pointer flex flex-col h-full relative overflow-hidden group shadow-xs"
          >
            <div className="absolute top-4 right-4 text-4xl select-none font-bold text-blue-500 opacity-20 group-hover:scale-110 transition-transform">
              🧱
            </div>
            <div className="bg-[#f0f9ff] flex items-center justify-center h-28 w-28 rounded-full mb-4 mx-auto border-2 border-blue-100 gap-1 group-hover:scale-105 transition-all">
              <span className="bg-blue-500 text-white font-black text-xs px-2 py-1 rounded shadow-xs select-none">BA</span>
              <span className="bg-orange-400 text-white font-black text-xs px-2 py-1 rounded shadow-xs select-none">TA</span>
            </div>
            <div className="text-center space-y-1.5 flex-1 flex flex-col">
              <h4 className="text-lg font-black text-blue-600 font-sans">Membaca Kata</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 flex-grow">
                Latihan melafalkan kata demi kata menjadi pembacaan kalimat yang utuh!
              </p>
              <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-extrabold text-xs rounded-2xl border-b-4 border-blue-700 shadow-sm uppercase group-hover:translate-y-0.5 transition-all cursor-pointer">
                Latihan Kata
              </button>
            </div>
          </motion.div>

          {/* Module 4: Kuis Harian (Susun Balon Kata) */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => {
              synth.playPop();
              onSelectTab('game');
            }}
            className="bg-white p-5 rounded-[32px] border-3 border-[#c084fc] hover:shadow-lg transition-all cursor-pointer flex flex-col h-full relative overflow-hidden group shadow-xs"
          >
            <div className="absolute top-4 right-4 text-4xl select-none font-bold text-purple-500 opacity-20 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <div className="bg-[#faf5ff] flex items-center justify-center h-28 w-28 rounded-full mb-4 mx-auto border-2 border-purple-100 group-hover:rotate-12 transition-transform">
              <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-300 animate-bounce" />
            </div>
            <div className="text-center space-y-1.5 flex-1 flex flex-col">
              <h4 className="text-lg font-black text-purple-600 font-sans">Kuis Harian</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 flex-grow">
                Main balon terapung seru, pecahkan dan urutkan huruf menjadi kata rahasia!
              </p>
              <button className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-extrabold text-xs rounded-2xl border-b-4 border-purple-700 shadow-sm uppercase group-hover:translate-y-0.5 transition-all cursor-pointer">
                Mulai Bermain
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Progress & Motivation Widget split row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left widget: Progress Belajar Section (7 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[36px] border border-slate-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>📈</span> Progress Belajar Anak
            </h3>
            <span className="text-[10px] bg-sky-50 text-sky-700 font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
              Live Tracker ⭐
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Chart 1: Mengenal Huruf */}
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-sky-50/40 border border-sky-100/50">
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#f1f5f9" fill="transparent" />
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#38bdf8" fill="transparent" 
                    strokeDasharray="201" 
                    strokeDashoffset={201 - (201 * letterProgressPercent) / 100} 
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="text-base font-black text-sky-700">{letterProgressPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Mengenal Huruf</span>
              <span className="text-[11px] text-sky-700 font-black tracking-normal mt-0.5">{stats.unlockedLettersCount}/26 Huruf</span>
            </div>

            {/* Chart 2: Suku Kata */}
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/50">
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#f1f5f9" fill="transparent" />
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#34d399" fill="transparent" 
                    strokeDasharray="201" 
                    strokeDashoffset={201 - (201 * syllableProgressPercent) / 100} 
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="text-base font-black text-emerald-700">{syllableProgressPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Suku Kata</span>
              <span className="text-[11px] text-emerald-700 font-black tracking-normal mt-0.5">{stats.completedSyllablesCount} Suku</span>
            </div>

            {/* Chart 3: Membaca Kalimat */}
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-orange-50/40 border border-orange-100/50">
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#f1f5f9" fill="transparent" />
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#fb923c" fill="transparent" 
                    strokeDasharray="201" 
                    strokeDashoffset={201 - (201 * sentenceProgressPercent) / 100} 
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="text-base font-black text-orange-700">{sentenceProgressPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Membaca Kata</span>
              <span className="text-[11px] text-orange-700 font-black tracking-normal mt-0.5">{stats.completedSentencesCount}/8 Kalimat</span>
            </div>

            {/* Chart 4: Kuis Harian */}
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-purple-50/40 border border-purple-100/50">
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#f1f5f9" fill="transparent" />
                  <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#c084fc" fill="transparent" 
                    strokeDasharray="201" 
                    strokeDashoffset={201 - (201 * gameProgressPercent) / 100} 
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="text-base font-black text-purple-700">{gameProgressPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Kuis Harian</span>
              <span className="text-[11px] text-purple-700 font-black tracking-normal mt-0.5">Skor: {stats.solvedGamesCount * 10}XP</span>
            </div>

          </div>
        </div>

        {/* Right widget: Motivation Card (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#1054a1]/5 to-[#1054a1]/10 p-6 rounded-[36px] border-2 border-dashed border-[#1054a1]/20 flex flex-col items-center text-center space-y-4">
          
          {/* Animated bouncy golden star */}
          <motion.div 
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl cursor-pointer select-none"
            onClick={() => speakTip("Jangan berhenti belajar ya! Setiap hari belajar, setiap hari tambah hebat!")}
          >
            ⭐
          </motion.div>

          <div className="space-y-1.5">
            <h4 className="text-base font-black text-[#1054a1] uppercase tracking-wider">Jangan Berhenti Belajarmu!</h4>
            <p className="text-xs text-slate-700 font-extrabold bg-white/75 px-3 py-1.5 rounded-2xl border border-sky-100/50 leading-relaxed">
              "Setiap hari belajar,<br/>setiap hari hebat! Belajar membaca membuka jendela dunia!" 🌟
            </p>
          </div>

          <div className="pt-2 w-full">
            <button 
              onClick={() => {
                synth.playSuccess();
                speakTip("Tip Hari Ini: Ketuk lah setiap huruf di halaman Menghafal Huruf untuk mendengarkan nama pancingan benda lucunya!");
              }}
              className="w-full py-2 bg-[#1054a1] hover:bg-[#0c3f7a] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
            >
              Dapatkan Tips Hebat ⚡
            </button>
          </div>

        </div>

      </div>

      {/* Guide notes for parents on bottom margin */}
      <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl text-xs text-slate-500 font-semibold flex items-center md:flex-row flex-col gap-3">
        <span className="text-2xl select-none">💡</span>
        <div className="text-center md:text-left">
          <p className="font-extrabold text-slate-700">Tips untuk Orang Tua:</p>
          Aplikasi ini memutarkan audio pelafalan bahasa Indonesia yang jernih secara real-time. Pastikan pengeras suara (speaker) perangkat Anda dinyalakan agar anak-anak memperoleh pengalaman belajar multisensori yang maksimal.
        </div>
      </div>

    </div>
  );
}
