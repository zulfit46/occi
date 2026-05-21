import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Trophy, Star, Undo2, Award, ArrowRight, HelpCircle } from 'lucide-react';
import { GameWord } from '../types';
import { gameWordsData } from '../data';
import { synth, speakIndonesian } from '../utils/speech';

interface PermainanSusunHurufProps {
  onEarnStars: (amount: number) => void;
  stars: number;
}

interface LetterItem {
  id: string; // unique ID to distinguish duplicates like 'a' in 'ayah'
  char: string;
  isUsed: boolean;
}

export default function PermainanSusunHuruf({ onEarnStars, stars }: PermainanSusunHurufProps) {
  const [level, setLevel] = useState<number>(0);
  const [pool, setPool] = useState<LetterItem[]>([]);
  const [placed, setPlaced] = useState<(LetterItem | null)[]>([]); // slots
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showShadowLetters, setShowShadowLetters] = useState<boolean>(true); // Shadow assistance for younger kids

  const currentLevelWord = gameWordsData[level % gameWordsData.length];

  // Initialize level
  useEffect(() => {
    initLevel();
  }, [level]);

  const initLevel = () => {
    const wordObj = gameWordsData[level % gameWordsData.length];
    const wordStr = wordObj.word.toUpperCase();
    
    // Create pool with unique keys
    const letterItems: LetterItem[] = wordStr.split('').map((char, index) => ({
      id: `${char}-${index}`,
      char,
      isUsed: false,
    }));

    // Shuffle pool but ensure it's not already correct!
    let shuffled = [...letterItems];
    let attempts = 0;
    while (attempts < 10) {
      shuffled = [...letterItems].sort(() => 0.5 - Math.random());
      const joinedString = shuffled.map(x => x.char).join('');
      if (joinedString !== wordStr) {
        break; // scrambled successfully
      }
      attempts++;
    }

    setPool(shuffled);
    setPlaced(new Array(wordStr.length).fill(null));
    setIsSuccess(false);
    setShowConfetti(false);
  };

  // Click on available letter bubble in the bottom pool
  const selectLetter = (item: LetterItem) => {
    if (isSuccess) return;

    // Find first empty slot
    const emptyIndex = placed.findIndex(slot => slot === null);
    if (emptyIndex === -1) return; // already full

    placeLetterInSlot(item, emptyIndex);
  };

  const placeLetterInSlot = (item: LetterItem, slotIndex: number) => {
    if (isSuccess) return;
    synth.playPop();

    // Place letter in slot
    const newPlaced = [...placed];
    newPlaced[slotIndex] = item;
    setPlaced(newPlaced);

    // Disable in bottom pool
    setPool(pool.map(p => p.id === item.id ? { ...p, isUsed: true } : p));
    
    // Auto-check spelling if all slots are filled
    const isNowFull = newPlaced.every(slot => slot !== null);
    if (isNowFull) {
      checkSpelling(newPlaced as LetterItem[]);
    }
  };

  const handleDragEnd = (event: any, info: any, item: LetterItem) => {
    if (isSuccess) return;

    // Calculate drag offset to see if it was a simple tap/click
    const maxOffset = Math.max(Math.abs(info.offset.x), Math.abs(info.offset.y));
    if (maxOffset < 8) {
      selectLetter(item);
      return;
    }

    // Drag-and-drop coordinate resolution
    const x = info.point.x;
    const y = info.point.y;

    let droppedIndex = -1;
    const slotsCount = currentLevelWord.word.length;

    for (let i = 0; i < slotsCount; i++) {
      if (placed[i] === null) {
        const el = document.getElementById(`target-slot-container-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Provide 30px hot-spot padding around target slot box to make touch drops feel lenient and satisfying!
          if (
            x >= rect.left - 30 &&
            x <= rect.right + 30 &&
            y >= rect.top - 30 &&
            y <= rect.bottom + 30
          ) {
            droppedIndex = i;
            break;
          }
        }
      }
    }

    if (droppedIndex !== -1) {
      placeLetterInSlot(item, droppedIndex);
    } else {
      // Returned to origin
      synth.playPop();
    }
  };

  // Check spelling accuracy
  const checkSpelling = (placedCollection: LetterItem[]) => {
    const spelled = placedCollection.map(slot => slot.char).join('');
    const target = currentLevelWord.word.toUpperCase();

    if (spelled === target) {
      // CORRECT SPELLING!
      setIsSuccess(true);
      setShowConfetti(true);
      synth.playLevelUp();
      onEarnStars(5); // Reward 5 stars!
      
      // Cheerful voice output
      speakIndonesian(`Hebat! Kamu mengeja ${currentLevelWord.word.toUpperCase()} dengan benar sekali!`);
    } else {
      // WRONG SPELLING
      synth.playError();
      setShakeTrigger(true);
      speakIndonesian("Ejaan kurang tepat, mari coba lagi!");
      
      setTimeout(() => {
        setShakeTrigger(false);
        // Reset only because of error, return all slot items to pool
        resetWorkingSlots();
      }, 1400);
    }
  };

  // Return a letter from slots back to the available pool
  const removeLetter = (item: LetterItem, slotIndex: number) => {
    if (isSuccess) return;
    synth.playPop();

    // Remove from slot
    const newPlaced = [...placed];
    newPlaced[slotIndex] = null;
    setPlaced(newPlaced);

    // Re-enable in supply pool
    setPool(pool.map(p => p.id === item.id ? { ...p, isUsed: false } : p));
  };

  // Reset all letters in slots back to pool
  const resetWorkingSlots = () => {
    synth.playPop();
    setPlaced(new Array(currentLevelWord.word.length).fill(null));
    setPool(pool.map(p => ({ ...p, isUsed: false })));
  };

  const handleNextLevel = () => {
    synth.playPop();
    setLevel((prev) => prev + 1);
  };

  // Custom React SVG Confetti Particle Generator
  const renderConfetti = () => {
    if (!showConfetti) return null;
    const pieces = Array.from({ length: 45 });
    return (
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {pieces.map((_, i) => {
          const rotation = Math.random() * 360;
          const leftPercent = Math.random() * 100;
          const animationDelay = Math.random() * 1.5;
          const scale = 0.5 + Math.random() * 1.1;
          const emoji = ['⭐', '✨', '🎈', '🎉', '🌟'][Math.floor(Math.random() * 5)];

          return (
            <motion.div
              key={i}
              initial={{ y: '110%', x: `${leftPercent}%`, rotate: 0, opacity: 1 }}
              animate={{
                y: '-20%',
                x: `${leftPercent + (Math.random() * 30 - 15)}%`,
                rotate: rotation + 720,
                opacity: 0,
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: animationDelay,
                ease: 'easeOut',
              }}
              className="absolute text-xl select-none"
              style={{ scale }}
            >
              {emoji}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2 relative">
      {renderConfetti()}

      {/* Game Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-indigo-600 tracking-tight flex items-center justify-center gap-2">
          🎈 Permainan Susun Huruf
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Tarik balon huruf melayang dan susun sesuai ejaan katanya! Kumpulkan bintang pelangi melimpah!
        </p>
      </div>

      {/* Progress Board */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50/50 p-4 rounded-3xl border border-indigo-200 gap-3">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <span className="bg-indigo-500 text-white px-3 py-1 rounded-xl text-xs uppercase font-extrabold shadow-sm">
            Level {level + 1}
          </span>
          <span className="text-sm capitalize font-sans">
            Tebak Kata : <span className="underline decoration-indigo-300 font-black">{currentLevelWord.category}</span>
          </span>
        </div>
        
        {/* Score & help indicator */}
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-300" /> +5 Bintang
          </span>
          <span className="text-xs font-bold bg-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl shadow-xs">
            Bintang Saya: {stars} ⭐
          </span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="bg-gradient-to-b from-white to-indigo-50/10 p-6 md:p-8 rounded-3xl border-3 border-indigo-200 shadow-sm space-y-8 flex flex-col items-center relative overflow-hidden">
        
        {/* Playful Floating Sky Design elements */}
        <div className="absolute top-2 left-4 text-sky-200/50 text-6xl select-none font-black opacity-30">☁️</div>
        <div className="absolute top-12 right-6 text-sky-200/50 text-5xl select-none font-black opacity-30">☁️</div>

        {/* Target Image & Explanation Card */}
        <div className="flex flex-col items-center text-center space-y-3 z-10">
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 4, -4, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            onClick={() => {
              synth.playPop();
              speakIndonesian(currentLevelWord.word);
            }}
            className="text-8xl select-none cursor-pointer transform group relative"
            id="spelling-game-target-emoji"
          >
            {currentLevelWord.emoji}
            <div className="absolute -bottom-1 left-2 right-2 h-2.5 bg-indigo-900/10 rounded-full blur-[2px] -z-10" />
            
            <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-white px-2 py-1 border border-indigo-100 font-bold shadow-md rounded-lg text-xs">
              Bunyikan 🔊
            </div>
          </motion.div>

          {/* Spell Hint */}
          <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl flex items-start gap-2 max-w-md shadow-xs">
            <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-stone-600 font-bold text-xs md:text-sm text-left leading-relaxed">
              <span className="text-amber-800 font-black">Petunjuk: </span>
              {currentLevelWord.hint}
            </p>
          </div>
        </div>

        {/* TARGET SLOTS FOR SPELLING */}
        <div className="space-y-3 z-10 w-full flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-sm px-1.5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">
              Papan Susun :
            </p>
            
            {/* Playful Pill Toggle Button for Shadow Hint */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                synth.playPop();
                setShowShadowLetters(!showShadowLetters);
              }}
              className={`flex items-center gap-1 py-1 px-3 rounded-full text-[10px] font-black border transition-all cursor-pointer select-none ${
                showShadowLetters 
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
              }`}
              title="Aktifkan bantuan bayangan huruf di bawah slot kosong"
            >
              <span>{showShadowLetters ? '✨ Huruf Bayangan: Aktif' : '👻 Huruf Bayangan: Nonaktif'}</span>
            </motion.button>
          </div>

          <div
            className={`flex flex-wrap items-center justify-center gap-3.5 p-4 rounded-3xl bg-indigo-50/40 border-2 border-dashed border-indigo-100 min-h-[96px] ${
              shakeTrigger ? 'animate-shake' : ''
            }`}
            id="game-target-slots"
          >
            {placed.map((slot, index) => (
              <div key={index} className="relative" id={`target-slot-container-${index}`}>
                <AnimatePresence mode="wait">
                  {slot ? (
                    <motion.button
                      key={slot.id}
                      initial={{ scale: 0.7, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.7, y: -15 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => removeLetter(slot, index)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-b-6 flex items-center justify-center text-2xl md:text-3xl font-black cursor-pointer shadow-md select-none ${
                        isSuccess
                          ? 'bg-emerald-500 text-white border-emerald-700'
                          : 'bg-white text-indigo-700 border-indigo-300 hover:bg-slate-50'
                      }`}
                      id={`placed-letter-slot-${index}`}
                    >
                      {slot.char}
                    </motion.button>
                  ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-3 border-dashed border-indigo-200 bg-white/40 flex items-center justify-center text-indigo-300 font-black text-xl select-none relative">
                      {showShadowLetters ? (
                        <span className="opacity-30 text-indigo-900/40 font-black text-2xl animate-pulse pointer-events-none select-none">
                          {currentLevelWord.word.toUpperCase()[index]}
                        </span>
                      ) : (
                        '_'
                      )}
                    </div>
                  )}
                </AnimatePresence>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-indigo-100 h-1.5 w-5 rounded-full" />
              </div>
            ))}
          </div>

          {!isSuccess && placed.some(slot => slot !== null) && (
            <button
              onClick={resetWorkingSlots}
              className="px-3 py-1.5 mt-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              id="clear-slots-button"
            >
              <Undo2 className="w-3.5 h-3.5" /> Bersihkan ejaan
            </button>
          )}
        </div>

        {/* SCRAMBLED BALLOONS SUPPLY POOL */}
        <div className="space-y-4 w-full z-10 flex flex-col items-center border-t border-slate-100 pt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
            🎈 Tarik atau ketuk gelembung balon melayang di bawah:
          </p>

          <div className="flex flex-wrap justify-center gap-4 py-2 min-h-[90px]" id="letter-source-pool">
            {pool.map((item) => (
              <AnimatePresence key={item.id}>
                {!item.isUsed && (
                  <motion.div
                    initial={{ y: 0, scale: 0 }}
                    animate={{
                      scale: 1,
                      y: [0, -8, 0],
                    }}
                    exit={{ scale: 0 }}
                    transition={{
                      scale: { type: 'spring', stiffness: 300, damping: 15 },
                      y: {
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                    className="relative"
                  >
                    <motion.button
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.9}
                      dragSnapToOrigin={true}
                      onDragEnd={(event, info) => handleDragEnd(event, info, item)}
                      whileHover={{ scale: 1.15 }}
                      whileDrag={{ scale: 1.25, zIndex: 100, cursor: 'grabbing' }}
                      whileTap={{ scale: 0.9 }}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-b-[6px] flex items-center justify-center text-xl md:text-2xl font-black cursor-grab active:cursor-grabbing shadow-lg select-none bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200 touch-none"
                      id={`game-source-bubble-${item.id}`}
                    >
                      {item.char}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>

        {/* MODAL SUCCESS BANNER */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-emerald-50 border-3 border-emerald-300 p-6 rounded-3xl text-center space-y-4 max-w-md shadow-lg z-20 mt-4"
              id="success-game-modal"
            >
              <div className="text-4xl animate-bounce">🎊🥳🏆🎉</div>
              
              <div className="space-y-1">
                <span className="flex items-center justify-center gap-1.5 text-amber-500 fill-amber-300 font-extrabold text-xl">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" /> +5 Bintang Diperoleh!
                </span>
                <h3 className="text-emerald-800 font-black text-2xl capitalize">
                  Berhasil Mengeja "{currentLevelWord.word}"!
                </h3>
              </div>
              
              <p className="text-emerald-700 text-sm leading-relaxed">
                Hebat sekali, bintang pintar! Kiki si Dino bangga sekali padamu sudah berhasil menyusun kata dengan tepat. Ayo main level berikutnya!
              </p>

              <div className="pt-2">
                <button
                  onClick={handleNextLevel}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl border-b-6 border-emerald-700 font-black text-lg flex items-center gap-2 mx-auto justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                  id="game-next-level-btn"
                >
                  Lanjut Main Level Berikut <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
