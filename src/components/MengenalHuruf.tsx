import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ChevronLeft, ChevronRight, Award, Trophy, Compass } from 'lucide-react';
import { AlphabetLetter } from '../types';
import { alphabetData } from '../data';
import { synth, speakIndonesian } from '../utils/speech';

interface MengenalHurufProps {
  unlockedList: string[];
  onLetterUnlocked: (letter: string) => void;
  stars: number;
}

export default function MengenalHuruf({ unlockedList, onLetterUnlocked, stars }: MengenalHurufProps) {
  const [filter, setFilter] = useState<'semua' | 'vokal' | 'konsonan'>('semua');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter>(alphabetData[0]);
  const [isPlayingWord, setIsPlayingWord] = useState<boolean>(false);

  // Play letter sound & pronounce example word
  const speakLetter = (item: AlphabetLetter) => {
    synth.playPop();
    setIsPlayingWord(true);
    
    // Spell: "A... untuk Apel!"
    speakIndonesian(`${item.char}. ${item.char} untuk ${item.wordExample}.`, () => {
      setIsPlayingWord(false);
    });

    // Award star if not unlocked yet
    if (!unlockedList.includes(item.char)) {
      onLetterUnlocked(item.char);
    }
  };

  const speakOnlyLetter = (char: string) => {
    synth.playPop();
    speakIndonesian(char);
  };

  const speakOnlyExample = (word: string) => {
    synth.playPop();
    speakIndonesian(word);
  };

  // Filter letter list
  const filteredLetters = alphabetData.filter((item) => {
    if (filter === 'vokal') return item.category === 'vokal';
    if (filter === 'konsonan') return item.category === 'konsonan';
    return true;
  });

  // Cycle letters
  const handlePrev = () => {
    const currentIndex = alphabetData.findIndex(item => item.char === selectedLetter.char);
    const prevIndex = (currentIndex - 1 + alphabetData.length) % alphabetData.length;
    setSelectedLetter(alphabetData[prevIndex]);
    speakLetter(alphabetData[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = alphabetData.findIndex(item => item.char === selectedLetter.char);
    const nextIndex = (currentIndex + 1) % alphabetData.length;
    setSelectedLetter(alphabetData[nextIndex]);
    speakLetter(alphabetData[nextIndex]);
  };

  const isUnlocked = unlockedList.includes(selectedLetter.char);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-rose-600 tracking-tight flex items-center justify-center gap-2">
          🌈 Mengenal Huruf A-Z
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Ketuk balon huruf di bawah untuk mendengarkan suaranya. Jelajahi semua huruf untuk mendapatkan bintang cilik!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto border border-slate-200">
        {(['semua', 'vokal', 'konsonan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              synth.playPop();
              setFilter(tab);
            }}
            className={`flex-1 py-2 font-bold text-sm text-center capitalize rounded-xl transition-all ${
              filter === tab
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id={`filter-tab-${tab}`}
          >
            {tab === 'semua' ? 'Semua Huruf' : `Huruf ${tab}`}
          </button>
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Letter Grid (7 cols) */}
        <div className="md:col-span-7 bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-rose-400" /> Ketuk untuk memilih
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              {unlockedList.length}/26 Huruf Terbuka 🌟
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {filteredLetters.map((item) => {
              const hasBeenVisited = unlockedList.includes(item.char);
              const isSelected = selectedLetter.char === item.char;

              return (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  key={item.char}
                  onClick={() => {
                    setSelectedLetter(item);
                    speakLetter(item);
                  }}
                  className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-500 ring-4 ring-rose-100 shadow-inner'
                      : item.borderColor
                  } ${item.color}`}
                  id={`letter-btn-${item.char}`}
                >
                  <span className={`text-3xl md:text-4xl font-black ${item.textColor}`}>
                    {item.char}
                  </span>
                  
                  {/* Visited / Unlocked star reward badge */}
                  {hasBeenVisited ? (
                    <div className="absolute top-1.5 right-1.5 text-[10px] bg-amber-400 text-amber-950 px-1 rounded-full font-black animate-pulse flex items-center gap-0.5 shadow-xs">
                      ⭐
                    </div>
                  ) : (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
                  )}

                  <span className="text-[10px] text-zinc-500 font-bold capitalize select-none opacity-80 mt-1">
                    {item.wordExample}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Giant Interactive Letter Board (5 cols) */}
        <div className="md:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLetter.char}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-b from-white to-pink-50/20 p-6 rounded-3xl border-3 border-rose-200 shadow-md space-y-6 flex flex-col items-center text-center relative overflow-hidden"
              id="selected-letter-panel"
            >
              {/* Sparkle background details */}
              <div className="absolute top-4 left-4 text-slate-200 text-sm">🎈</div>
              <div className="absolute bottom-4 right-4 text-slate-200 text-sm">🎡</div>
              
              {/* Unlocked Reward Prompt */}
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold shadow-xs">
                <Trophy className="w-3.5 h-3.5 fill-amber-300 text-amber-600" /> 
                {isUnlocked ? 'Sudah dapat bintang +1 ⭐' : 'Jelajahi untuk +1 ⭐'}
              </div>

              {/* Character Presentation */}
              <div className="relative">
                <h2 className="text-8xl md:text-9xl font-black text-rose-600 select-none animate-bounce" style={{ animationDuration: '3s' }}>
                  {selectedLetter.char}
                </h2>
                <div className="absolute -bottom-1 left-4 right-4 h-2 bg-pink-100 rounded-full blur-[2px] -z-10" />
              </div>

              {/* Heartbeat Animated Association Emoji */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-7xl select-none"
              >
                {selectedLetter.emoji}
              </motion.div>

              {/* Association Word */}
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest select-none">
                Contoh Benda :
              </p>
              
              <div className="space-y-1">
                <button
                  onClick={() => speakOnlyExample(selectedLetter.wordExample)}
                  className="text-4xl font-extrabold text-slate-800 hover:text-rose-600 transition-colors cursor-pointer group flex items-center justify-center gap-2"
                  id="word-example-pronounce-btn"
                >
                  {selectedLetter.wordExample} 
                  <Volume2 className="w-6 h-6 text-rose-400 group-hover:scale-125 transition-transform" />
                </button>
                <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                  Huruf {selectedLetter.category}
                </span>
              </div>

              {/* Large Speech Controls */}
              <div className="w-full grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => speakOnlyLetter(selectedLetter.char)}
                  className="py-3 px-4 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all border border-rose-300"
                  id="speak-only-letter-btn"
                >
                  🔊 Huruf "{selectedLetter.char}"
                </button>
                <button
                  onClick={() => speakLetter(selectedLetter)}
                  disabled={isPlayingWord}
                  className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md border-b-4 border-rose-700 active:scale-95 transition-all disabled:opacity-50"
                  id="speak-all-btn"
                >
                  <Volume2 className="w-4 h-4" /> Gabungkan 🔊
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="w-full flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  onClick={handlePrev}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-0.5 text-xs font-bold cursor-pointer"
                  id="prev-letter-arrow"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelum
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-0.5 text-xs font-bold cursor-pointer"
                  id="next-letter-arrow"
                >
                  Berikut <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
