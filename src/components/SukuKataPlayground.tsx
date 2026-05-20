import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, BookOpen, Star, Undo, ArrowRight, Play } from 'lucide-react';
import { SyllableWord } from '../types';
import { syllableWordsData } from '../data';
import { synth, speakIndonesian } from '../utils/speech';

const blockColorPalettes = [
  {
    bg: 'bg-[#fff1f2] hover:bg-[#ffe4e6]', // soft rose
    text: 'text-[#e11d48]',
    border: 'border-[#fecdd3]',
    borderBottom: 'border-b-[#be123c]',
  },
  {
    bg: 'bg-[#ecfeff] hover:bg-[#cffafe]', // soft cyan
    text: 'text-[#0891b2]',
    border: 'border-[#a5f3fc]',
    borderBottom: 'border-b-[#0e7490]',
  },
  {
    bg: 'bg-[#fef9c3] hover:bg-[#fef08a]', // soft yellow
    text: 'text-[#ca8a04]',
    border: 'border-[#fef08a]',
    borderBottom: 'border-b-[#a16207]',
  },
  {
    bg: 'bg-[#f5f3ff] hover:bg-[#ede9fe]', // soft violet
    text: 'text-[#7c3aed]',
    border: 'border-[#ddd6fe]',
    borderBottom: 'border-b-[#6d28d9]',
  },
  {
    bg: 'bg-[#f0fdf4] hover:bg-[#dcfce7]', // soft emerald
    text: 'text-[#16a34a]',
    border: 'border-[#bbf7d0]',
    borderBottom: 'border-b-[#15803d]',
  },
  {
    bg: 'bg-[#fdf2f8] hover:bg-[#fce7f3]', // soft pink
    text: 'text-[#db2777]',
    border: 'border-[#fbcfe8]',
    borderBottom: 'border-b-[#be185d]',
  },
];

interface SukuKataPlaygroundProps {
  onEarnStars: (amount: number) => void;
  stars: number;
}

export default function SukuKataPlayground({ onEarnStars, stars }: SukuKataPlaygroundProps) {
  const [activeTab, setActiveTab] = useState<'eksplorasi' | 'puzzle'>('eksplorasi');
  
  // Exploration States
  const [selectedWord, setSelectedWord] = useState<SyllableWord>(syllableWordsData[0]);

  // Puzzle Game States
  const [gameIndex, setGameIndex] = useState<number>(0);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<'idle' | 'success' | 'fail'>('idle');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Current word for syllable combination quiz
  const currentQuizWord = syllableWordsData[gameIndex % syllableWordsData.length];

  // Set up options for the puzzle: the correct right syllable plus 3 random wrong ending syllables
  useEffect(() => {
    generatePuzzleOptions();
  }, [gameIndex, activeTab]);

  const generatePuzzleOptions = () => {
    const word = syllableWordsData[gameIndex % syllableWordsData.length];
    const correctSyllable = word.syllables[word.syllables.length - 1]; // e.g., 'pi' from 'Sa+pi'
    
    // Choose wrong options from other words
    const allEndings = syllableWordsData
      .map(w => w.syllables[w.syllables.length - 1])
      .filter(s => s.toLowerCase() !== correctSyllable.toLowerCase());
    
    // Unique endings
    const uniqueEndings = Array.from(new Set(allEndings));
    
    // Pick 3 random
    const shuffledWrong = uniqueEndings.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Combine and shuffle
    const combined = [correctSyllable, ...shuffledWrong].sort(() => 0.5 - Math.random());
    setShuffledOptions(combined);
    setSelectedMatch(null);
    setQuizState('idle');
  };

  // Play full syllables: "Bu... Ku... Buku!"
  const speakSyllablesWord = (wordObj: SyllableWord) => {
    synth.playPop();
    const joinedWithSpacing = wordObj.syllables.join('... ');
    speakIndonesian(`${joinedWithSpacing}... ${wordObj.word}!`);
  };

  // Speak a single syllable part (e.g. "bu")
  const speakSingleSyllable = (syllable: string) => {
    synth.playPop();
    speakIndonesian(syllable);
  };

  // Handle Match Selection in puzzle
  const handleOptionClick = (option: string) => {
    if (quizState === 'success') return; // already solved
    
    setSelectedMatch(option);
    speakSingleSyllable(option);

    const word = syllableWordsData[gameIndex % syllableWordsData.length];
    const correctSyllable = word.syllables[word.syllables.length - 1];

    if (option.toLowerCase() === correctSyllable.toLowerCase()) {
      setQuizState('success');
      synth.playSuccess();
      onEarnStars(3); // reward +3 stars

      // Speak correct sequence
      const correctText = `Benar sekali! ${word.syllables.join(' ')}... ${word.word}!`;
      setTimeout(() => {
        speakIndonesian(correctText);
      }, 500);
    } else {
      setQuizState('fail');
      synth.playError();
      speakIndonesian("Ayo coba lagi!");
      setTimeout(() => {
        setQuizState('idle');
        setSelectedMatch(null);
      }, 1500);
    }
  };

  const nextPuzzle = () => {
    synth.playPop();
    setGameIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2">
      {/* Module Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-emerald-600 tracking-tight flex items-center justify-center gap-2">
          🧩 Bermain Suku Kata
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Belajar memotong kata agar membaca jadi lebih mudah dan menyenangkan! Pilih cara bermainmu di bawah.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 max-w-md mx-auto justify-center">
        <button
          onClick={() => {
            synth.playPop();
            setActiveTab('eksplorasi');
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 border-b-4 transition-all ${
            activeTab === 'eksplorasi'
              ? 'bg-emerald-500 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50 text-emerald-700 border-zinc-200 hover:bg-emerald-100'
          }`}
          id="tab-eksplorasi-btn"
        >
          <BookOpen className="w-4 h-4" /> 1. Eksplorasi Blok
        </button>
        <button
          onClick={() => {
            synth.playPop();
            setActiveTab('puzzle');
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 border-b-4 transition-all ${
            activeTab === 'puzzle'
              ? 'bg-emerald-500 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50 text-emerald-700 border-zinc-200 hover:bg-emerald-100'
          }`}
          id="tab-puzzle-btn"
        >
          <Sparkles className="w-4 h-4" /> 2. Tebak Kata Puzzle
        </button>
      </div>

      {/* TAB Content: Exploration */}
      <AnimatePresence mode="wait">
        {activeTab === 'eksplorasi' && (
          <motion.div
            key="eksplorasi"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
          >
            {/* Left selector bucket */}
            <div className="md:col-span-4 bg-white p-4 rounded-3xl border-2 border-emerald-100 shadow-xs max-h-[420px] overflow-y-auto space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 block">
                Pilih Kata Mengaji:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {syllableWordsData.map((wordObj) => {
                  const isCur = selectedWord.word === wordObj.word;
                  return (
                    <button
                      key={wordObj.word}
                      onClick={() => {
                        setSelectedWord(wordObj);
                        speakSyllablesWord(wordObj);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left font-bold transition-all cursor-pointer ${
                        isCur
                          ? 'bg-emerald-500 text-white shadow-md border-b-4 border-emerald-700 scale-95'
                          : 'bg-zinc-50 hover:bg-emerald-50 text-slate-700'
                      }`}
                      id={`syllable-select-btn-${wordObj.word}`}
                    >
                      <span className="text-2xl">{wordObj.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-black capitalize leading-tight">
                          {wordObj.word}
                        </p>
                        <p className={`text-[11px] ${isCur ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {wordObj.syllables.join(' - ')}
                        </p>
                      </div>
                      <Volume2 className={`w-4 h-4 ${isCur ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Display Board */}
            <div className="md:col-span-8 bg-gradient-to-br from-white to-emerald-50/10 p-6 md:p-8 rounded-3xl border-3 border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              
              {/* Category indicator */}
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs uppercase tracking-wider">
                🏷️ Kelompok: {selectedWord.category}
              </span>

              {/* Huge visual representation */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl select-none"
              >
                {selectedWord.emoji}
              </motion.div>

              {/* Syllable Blocks (Lego Assembly Style) */}
              <div className="flex flex-wrap items-center justify-center gap-3 relative px-4">
                {selectedWord.syllables.map((syllable, index) => {
                  const palette = blockColorPalettes[index % blockColorPalettes.length];
                  return (
                    <div key={index} className="flex items-center">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakSingleSyllable(syllable)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        className={`${palette.bg} ${palette.text} ${palette.border} ${palette.borderBottom} px-8 py-5 rounded-3xl text-4xl md:text-5xl border-b-[6px] border-2 font-black cursor-pointer shadow-md transition-all flex flex-col items-center gap-0.5 justify-center`}
                        id={`syllable-block-${syllable}-${index}`}
                      >
                        <span className="tracking-wide uppercase font-sans">{syllable}</span>
                        <span className="text-xs font-bold text-slate-400 lowercase italic tracking-normal font-mono">
                          klik suara
                        </span>
                      </motion.button>
                      
                      {index < selectedWord.syllables.length - 1 && (
                        <span className="text-3xl font-black text-emerald-300 px-1 select-none animate-pulse">
                          ＋
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Combined Name Button */}
              <div className="pt-4 border-t border-emerald-100 w-full flex flex-col items-center">
                <button
                  onClick={() => speakSyllablesWord(selectedWord)}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg rounded-2xl font-black text-2xl flex items-center justify-center gap-3 border-b-6 border-emerald-700 active:translate-y-1 transition-all"
                  id="speak-combined-syllables-btn"
                >
                  <Volume2 className="w-7 h-7" />
                  <span className="capitalize leading-none tracking-wide flex items-center">
                    {selectedWord.syllables.map((syllable, index) => {
                      // Alternate white and yellow/amber
                      const textColors = ['text-white', 'text-yellow-250', 'text-cyan-200', 'text-pink-200'];
                      const col = textColors[index % textColors.length];
                      return (
                        <span key={index} className={`${col} font-black`}>
                          {syllable}
                        </span>
                      );
                    })}
                  </span> 🔊
                </button>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
                  Ketuk untuk menyatukan dan mengeja kata!
                </span>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB Content: Quiz Matching Game */}
        {activeTab === 'puzzle' && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white p-6 md:p-8 rounded-3xl border-3 border-emerald-200 shadow-sm space-y-8 flex flex-col items-center"
          >
            {/* Header / Quiz Score tracker */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center bg-emerald-50/55 p-3.5 rounded-2xl border border-emerald-100 gap-2">
              <span className="text-slate-600 text-sm font-bold flex items-center gap-1.5">
                🎯 Suku Kata Terakhir Terputus! Ayo Satukan!
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-300" /> Hadiah: +3 Bintang!
                </span>
                <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold">
                  Skor Saya: {stars} ⭐
                </span>
              </div>
            </div>

            {/* Target Card with Emoji */}
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-xs font-extrabold uppercase bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                Tebak Kata Menggunakan Gambar
              </span>

              {/* Bouncing Target Emoji */}
              <motion.div
                animate={quizState === 'success' ? {
                  scale: [1, 1.2, 0.95, 1.1, 1],
                  rotate: [0, 8, -8, 5, 0]
                } : {
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                className="text-8xl select-none cursor-pointer"
                onClick={() => speakIndonesian(currentQuizWord.word)}
                id="quiz-target-emoji"
              >
                {currentQuizWord.emoji}
                <div className="absolute -bottom-1 left-2 right-2 h-2 bg-slate-100 rounded-full blur-[1px] -z-10" />
              </motion.div>

              <p className="text-slate-500 font-bold text-sm">
                Ayo lengkapilah suku kata untuk benda/hewan di atas!
              </p>
            </div>

            {/* Spliced Lego assembly connector display */}
            <div className="flex items-center gap-2 md:gap-4 bg-emerald-50/30 p-5 rounded-2xl border-2 border-dashed border-emerald-200">
              {/* Syllable Block 1: The Given Left syllable */}
              <div className="px-6 py-4 rounded-2xl text-2xl md:text-3xl bg-[#fff1f2] border-2 border-[#fecdd3] border-b-6 border-b-[#be123c] text-[#e11d48] font-black uppercase font-sans shadow-md">
                {currentQuizWord.syllables[0]}
              </div>

              <span className="text-2xl font-black text-emerald-400">
                ＋
              </span>

              {/* Syllable Block 2: The Blank missing syllable */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {selectedMatch ? (
                    <motion.div
                      key={selectedMatch}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className={`px-6 py-4 rounded-2xl text-2xl md:text-3xl font-black uppercase border-b-6 border-2 text-center font-sans shadow-md ${
                        quizState === 'success'
                          ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0] border-b-[#15803d]'
                          : 'bg-[#ecfeff] text-[#0891b2] border-[#a5f3fc] border-b-[#0e7490]'
                      }`}
                      id="selected-syllable-slot"
                    >
                      {selectedMatch}
                    </motion.div>
                  ) : (
                    <div className="px-6 py-4 rounded-2xl text-2xl md:text-3xl font-black bg-white border-2 border-dashed border-[#a5f3fc] text-[#0891b2] w-24 text-center tracking-widest animate-pulse h-[70px] flex items-center justify-center">
                      ? ?
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <span className="text-2xl font-black text-emerald-400">
                ＝
              </span>

              {/* Finished word result box */}
              <div className="px-6 py-4 rounded-2xl text-xl md:text-2xl bg-white border-2 border-emerald-200 text-emerald-800 font-black tracking-wide font-sans shadow-sm min-w-[120px] text-center">
                {quizState === 'success' ? (
                  <span className="capitalize leading-none tracking-wide flex items-center justify-center">
                    {currentQuizWord.syllables.map((syllable, index) => {
                      const textColors = ['text-[#e11d48]', 'text-[#0891b2]', 'text-[#ca8a04]', 'text-[#7c3aed]'];
                      const col = textColors[index % textColors.length];
                      return (
                        <span key={index} className={`${col} font-black`}>
                          {syllable}
                        </span>
                      );
                    })}
                  </span>
                ) : (
                  <span className="text-slate-300 font-bold">... ...</span>
                )}
              </div>
            </div>

            {/* Scrambled Bubble Choices Options */}
            <div className="space-y-3 w-full text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                👉 Ketuk pilihan suku kata pelengkap di bawah ini:
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {shuffledOptions.map((option) => {
                  const isCurSelected = selectedMatch === option;
                  let bgStyle = "bg-white border-zinc-200 text-slate-800 hover:bg-emerald-50 hover:border-emerald-300";
                  if (isCurSelected) {
                    bgStyle = quizState === 'success'
                      ? "bg-emerald-500 text-white border-emerald-600 cursor-default"
                      : "bg-red-500 text-white border-red-600 cursor-default animate-shake";
                  }

                  return (
                    <motion.button
                      whileHover={quizState !== 'success' ? { scale: 1.05 } : {}}
                      whileTap={quizState !== 'success' ? { scale: 0.95 } : {}}
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      className={`px-5 py-3.5 rounded-2xl text-xl md:text-2xl border-b-4 font-black cursor-pointer transition-all shadow-sm flex items-center gap-1 ${bgStyle}`}
                      id={`quiz-option-${option}`}
                    >
                      <span>{option}</span>
                      <Volume2 className="w-4 h-4 text-emerald-400 inline opacity-60 hover:opacity-100" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Success Reward Banner / Reset Arrow */}
            {quizState === 'success' ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-3 max-w-md"
                id="success-reward-banner"
              >
                <div className="text-4xl">🎉🥳👏</div>
                <h3 className="text-emerald-700 font-black text-lg">Hore, Hebat Sekali!</h3>
                <p className="text-emerald-600 text-xs font-bold">
                  Kamu berhasil menyatukan suku kata "{currentQuizWord.syllables[0]} – {currentQuizWord.syllables[1]}" menjadi kata <span className="underline font-black">{currentQuizWord.word}</span> {currentQuizWord.emoji}!
                </p>
                <div className="pt-2">
                  <button
                    onClick={nextPuzzle}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl border-b-4 border-emerald-700 font-extrabold flex items-center gap-2 mx-auto justify-center text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    id="next-quiz-btn"
                  >
                    Buka Teka-teki Berikutnya <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={generatePuzzleOptions}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                id="reshuffle-quiz-btn"
              >
                <Undo className="w-3.5 h-3.5" /> Acak Ulang Pilihan
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
