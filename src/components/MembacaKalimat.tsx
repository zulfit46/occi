import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Star, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { SimpleSentence } from '../types';
import { sentencesData, syllableWordsData } from '../data';
import { synth, speakIndonesian } from '../utils/speech';

// --- Indonesian Syllabifier Helper mapping and algorithm ---
const knownSyllablesMap = new Map<string, string[]>();

if (typeof syllableWordsData !== 'undefined' && Array.isArray(syllableWordsData)) {
  syllableWordsData.forEach(item => {
    if (item && item.word) {
      knownSyllablesMap.set(item.word.toLowerCase(), item.syllables);
    }
  });
}

function matchCasing(originalWord: string, syllables: string[]): string[] {
  let charIdx = 0;
  return syllables.map(syllable => {
    let matchedSyllable = '';
    for (let i = 0; i < syllable.length; i++) {
      const origChar = originalWord[charIdx];
      if (origChar) {
        matchedSyllable += origChar;
        charIdx++;
      } else {
        matchedSyllable += syllable[i];
      }
    }
    return matchedSyllable;
  });
}

function splitAlgorithmic(word: string): string[] {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
  const isVowel = (c: string) => vowels.has(c);

  const result: string[] = [];
  let currentSyllable = '';
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    currentSyllable += char;
    
    if (i < word.length - 1) {
      const nextChar = word[i + 1];
      
      if (isVowel(char) && isVowel(nextChar)) {
        result.push(currentSyllable);
        currentSyllable = '';
      }
      else if (isVowel(char) && !isVowel(nextChar) && i + 2 < word.length && isVowel(word[i + 2])) {
        const isDigraph = (
          (nextChar.toLowerCase() === 'n' && word[i + 2].toLowerCase() === 'g') ||
          (nextChar.toLowerCase() === 'n' && word[i + 2].toLowerCase() === 'y') ||
          (nextChar.toLowerCase() === 's' && word[i + 2].toLowerCase() === 'y') ||
          (nextChar.toLowerCase() === 'k' && word[i + 2].toLowerCase() === 'h')
        );
        
        if (isDigraph) {
          result.push(currentSyllable);
          currentSyllable = '';
        } else {
          result.push(currentSyllable);
          currentSyllable = '';
        }
      }
      else if (!isVowel(char) && !isVowel(nextChar) && i + 2 < word.length && isVowel(word[i + 2])) {
        result.push(currentSyllable);
        currentSyllable = '';
      }
    }
  }
  
  if (currentSyllable) {
    result.push(currentSyllable);
  }
  
  return result;
}

function splitIndonesianWord(word: string): string[] {
  const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  if (!cleanWord) return [word];
  
  const lowercase = cleanWord.toLowerCase();
  
  // 1. Check known list from syllableWordsData
  if (knownSyllablesMap.has(lowercase)) {
    return matchCasing(cleanWord, knownSyllablesMap.get(lowercase)!);
  }

  // 2. Custom dictionary of other common words in sentence challenges
  const customDict: Record<string, string[]> = {
    'ini': ['i', 'ni'],
    'ibu': ['i', 'bu'],
    'budi': ['bu', 'di'],
    'main': ['ma', 'in'],
    'bola': ['bo', 'la'],
    'kucing': ['ku', 'cing'],
    'makan': ['ma', 'kan'],
    'ikan': ['i', 'kan'],
    'adik': ['a', 'dik'],
    'minum': ['mi', 'num'],
    'susu': ['su', 'su'],
    'kakak': ['ka', 'kak'],
    'menyanyi': ['me', 'nya', 'nyi'],
    'lagu': ['la', 'gu'],
    'ayah': ['a', 'yah'],
    'naik': ['na', 'ik'],
    'sepeda': ['se', 'pe', 'da'],
    'bunga': ['bu', 'nga'],
    'mawar': ['ma', 'war'],
    'merah': ['me', 'rah'],
    'burung': ['bu', 'rung'],
    'terbang': ['ter', 'bang'],
    'tinggi': ['ting', 'gi'],
    'zidan': ['zi', 'dan'],
    'suka': ['su', 'ka'],
    'saya': ['sa', 'ya'],
    'baca': ['ba', 'ca'],
    'buku': ['bu', 'ku'],
    'masak': ['ma', 'sak'],
    'nasi': ['na', 'si'],
    'beli': ['be', 'li'],
    'madu': ['ma', 'du'],
    'itu': ['i', 'tu'],
    'baru': ['ba', 'ru'],
    'tidur': ['ti', 'dur'],
    'manis': ['ma', 'nis'],
    'jeli': ['je', 'li'],
    'roti': ['ro', 'ti'],
    'rasa': ['ra', 'sa'],
    'keju': ['ke', 'ju'],
    'mekar': ['me', 'kar'],
    'pagi': ['pa', 'gi'],
    'sapi': ['sa', 'pi'],
    'rumput': ['rum', 'put'],
    'mata': ['ma', 'ta'],
    'dua': ['du', 'a'],
    'pakai': ['pa', 'kai'],
    'dasi': ['da', 'si'],
    'kuda': ['ku', 'da'],
    'lari': ['la', 'ri'],
    'cepat': ['ce', 'pat'],
    'gigi': ['gi', 'gi'],
    'putih': ['pu', 'tih'],
    'kue': ['ku', 'e'],
    'bolu': ['bo', 'lu'],
    'pena': ['pe', 'na'],
    'sapu': ['sa', 'pu'],
    'di': ['di'],
    'sudut': ['su', 'dut'],
    'bumi': ['bu', 'mi'],
    'bulat': ['bu', 'lat'],
    'bulan': ['bu', 'lan'],
    'bersinar': ['ber', 'si', 'nar'],
    'terang': ['te', 'rang'],
    'awan': ['a', 'wan'],
    'lembut': ['lem', 'but'],
    'hujan': ['hu', 'jan'],
    'turun': ['tu', 'run'],
    'deras': ['de', 'ras'],
    'pohon': ['po', 'hon'],
    'tumbuh': ['tum', 'buh'],
    'lampu': ['lam', 'pu'],
    'menyala': ['me', 'nya', 'la'],
    'batu': ['ba', 'tu'],
    'kali': ['ka', 'li'],
    'hitam': ['hi', 'tam'],
    'topi': ['to', 'pi'],
    'biru': ['bi', 'ru'],
    'sate': ['sa', 'te'],
    'lezat': ['le', 'zat'],
    'soto': ['so', 'to'],
    'panas': ['pa', 'nas'],
    'segar': ['se', 'gar'],
    'nanas': ['na', 'nas'],
    'kulit': ['ku', 'lit'],
    'duri': ['du', 'ri'],
    'leci': ['le', 'ci'],
    'buah': ['bu', 'ah'],
    'labu': ['la', 'bu'],
    'kuning': ['ku', 'ning'],
    'besar': ['be', 'sar'],
    'cabe': ['ca', 'be'],
    'pedas': ['pe', 'das'],
    'pipi': ['pi', 'pi'],
    'kaki': ['ka', 'ki'],
    'kuat': ['ku', 'at'],
    'peta': ['pe', 'ta'],
    'dunia': ['du', 'ni', 'a'],
    'indah': ['in', 'dah'],
    'tisu': ['ti', 'su'],
    'bersih': ['ber', 'sih'],
    'pita': ['pi', 'ta'],
    'muda': ['mu', 'da'],
    'bata': ['ba', 'ta'],
    'dadu': ['da', 'du'],
    'bersisi': ['ber', 'si', 'si'],
    'enam': ['e', 'nam'],
    'kopi': ['ko', 'pi'],
    'paku': ['pa', 'ku'],
    'besi': ['be', 'si'],
    'tajam': ['ta', 'jam'],
    'saku': ['sa', 'ku'],
    'baju': ['ba', 'ju'],
    'robek': ['ro', 'bek'],
    'tali': ['ta', 'li'],
    'sepatu': ['se', 'pa', 'tu'],
    'raja': ['ra', 'ja'],
    'duduk': ['du', 'duk'],
    'gagah': ['ga', 'gah'],
    'ratu': ['ra', 'tu'],
    'mahkota': ['mah', 'ko', 'ta'],
    'singa': ['si', 'nga'],
    'aum': ['a', 'um'],
    'keras': ['ke', 'ras'],
    'bakso': ['bak', 'so'],
    'enak': ['e', 'nak'],
    'sofa': ['so', 'fa'],
    'empuk': ['em', 'puk'],
    'sekali': ['se', 'ka', 'li'],
    'apel': ['a', 'pel'],
    'melon': ['me', 'lon'],
    'hijau': ['hi', 'jau'],
    'sawi': ['sa', 'wi'],
    'bayam': ['ba', 'yam'],
    'tempe': ['tem', 'pe'],
    'tahu': ['ta', 'hu']
  };

  if (customDict[lowercase]) {
    return matchCasing(cleanWord, customDict[lowercase]);
  }

  // 3. Fallback: algorithmic splitting
  return splitAlgorithmic(cleanWord);
}

interface MembacaKalimatProps {
  onEarnStars: (amount: number) => void;
  completedSentences: string[];
  onSentenceRead: (id: string) => void;
  stars: number;
}

export default function MembacaKalimat({
  onEarnStars,
  completedSentences,
  onSentenceRead,
  stars,
}: MembacaKalimatProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [justEarned, setJustEarned] = useState<boolean>(false);

  const currentSentence = sentencesData[selectedIdx];

  // Play word-by-word sequence highlight or play a single clicked word
  const speakWord = (word: string, index: number) => {
    synth.playPop();
    setActiveWordIdx(index);
    speakIndonesian(word, () => {
      setActiveWordIdx(null);
    });
  };

  // Play entire sentence smoothly
  const speakFullSentence = (text: string) => {
    synth.playPop();
    speakIndonesian(text);
  };

  // Mark sentence as fully read by child
  const completeReading = () => {
    if (completedSentences.includes(currentSentence.id)) {
      speakFullSentence(`Hebat! Kamu sudah membaca: ${currentSentence.text}`);
      return;
    }

    // New completion
    synth.playLevelUp();
    setJustEarned(true);
    onSentenceRead(currentSentence.id);
    onEarnStars(4); // Reward 4 stars for reading a sentence
    
    speakIndonesian(`Luar biasa pintar! Kamu sudah selesai membaca kalimat: ${currentSentence.text}!`);

    setTimeout(() => {
      setJustEarned(false);
    }, 4000);
  };

  const handleNext = () => {
    synth.playPop();
    setSelectedIdx((prev) => (prev + 1) % sentencesData.length);
    setJustEarned(false);
  };

  const handlePrev = () => {
    synth.playPop();
    setSelectedIdx((prev) => (prev - 1 + sentencesData.length) % sentencesData.length);
    setJustEarned(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-teal-600 tracking-tight flex items-center justify-center gap-2">
          📖 Membaca Kalimat Sederhana
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Membaca kata demi kata menjadi kalimat utuh. Sentuh setiap kata untuk mendengarkan ejaan yang jernih!
        </p>
      </div>

      {/* Progress tracking banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-teal-50 border border-teal-200/60 p-4 rounded-3xl gap-3">
        <span className="text-xs font-black text-teal-800 uppercase tracking-widest bg-white outline outline-1 outline-teal-100 px-3 py-1.5 rounded-xl">
          Progress: {completedSentences.length}/{sentencesData.length} Kalimat Dibaca ✅
        </span>

        {/* Level & Stars */}
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-300" /> Hadiah: +4 Bintang!
          </span>
          <span className="text-xs font-black bg-white text-teal-700 border border-teal-200 px-3 py-1.5 rounded-xl">
            Bintang Saya: {stars} ⭐
          </span>
        </div>
      </div>

      {/* Split Interactive Space */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Sentences Side Drawer Menu (5 cols) */}
        <div className="md:col-span-4 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xs max-h-[420px] overflow-y-auto space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2 block">
            Daftar Tantangan Kalimat:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {sentencesData.map((sentence, index) => {
              const isSelected = selectedIdx === index;
              const isDone = completedSentences.includes(sentence.id);

              return (
                <button
                  key={sentence.id}
                  onClick={() => {
                    synth.playPop();
                    setSelectedIdx(index);
                    setJustEarned(false);
                  }}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left font-sans font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500 text-white shadow-md border-b-4 border-teal-700 scale-95'
                      : 'bg-zinc-50 hover:bg-teal-50 text-slate-700'
                  }`}
                  id={`sentence-card-btn-${sentence.id}`}
                >
                  <span className="text-3xl select-none">{sentence.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-black leading-snug">
                      {sentence.text}
                    </p>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-teal-600 text-teal-100' : 'bg-slate-200/60 text-slate-500'
                    }`}>
                      {sentence.words.length} kata
                    </span>
                  </div>
                  
                  {isDone && (
                    <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full font-bold text-xs shadow-xs" title="Sudah selesai dibaca!">
                      ✅
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Giant Reading board with Words highlight */}
        <div className="md:col-span-8 space-y-4">
          <div className="bg-gradient-to-br from-white to-teal-50/10 p-6 md:p-8 rounded-3xl border-3 border-teal-200 shadow-sm flex flex-col items-center justify-center text-center space-y-8 min-h-[410px] relative overflow-hidden">
            
            {/* Background vector icons */}
            <div className="absolute top-4 right-4 text-4xl select-none opacity-20">🌈</div>
            <div className="absolute bottom-4 left-4 text-4xl select-none opacity-20">🪁</div>

            {/* Huge Card Emoji representation */}
            <motion.div
              animate={{
                scale: [1, 1.07, 1],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-8xl select-none"
            >
              {currentSentence.emoji}
            </motion.div>

            {/* Word Blocks to Tap individually */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              {currentSentence.words.map((word, wordIndex) => {
                const isActive = activeWordIdx === wordIndex;
                return (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speakWord(word, wordIndex)}
                    key={`${word}-${wordIndex}`}
                    className={`px-6 py-4 rounded-2xl text-3xl md:text-4xl font-extrabold border-2 border-b-6 shadow-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-yellow-400 text-yellow-950 border-yellow-600 scale-105'
                        : 'bg-white text-slate-800 border-teal-200 hover:bg-teal-50'
                    }`}
                    id={`word-bubble-${word}-${wordIndex}`}
                  >
                    <p className="font-sans tracking-wide leading-none flex items-center justify-center">
                      {splitIndonesianWord(word).map((syllable, sIdx) => {
                        let colClass = '';
                        if (isActive) {
                          // Extra clear colors for selected yellow card
                          const activeColors = [
                            'text-indigo-950 font-black',
                            'text-red-900 font-black',
                            'text-emerald-900 font-black',
                            'text-purple-950 font-black',
                          ];
                          colClass = activeColors[sIdx % activeColors.length];
                        } else {
                          // Playful pastel-ish bright colors for default white card
                          const standardColors = [
                            'text-sky-600 font-extrabold',
                            'text-rose-500 font-extrabold',
                            'text-violet-600 font-extrabold',
                            'text-amber-500 font-extrabold',
                          ];
                          colClass = standardColors[sIdx % standardColors.length];
                        }
                        return (
                          <span key={sIdx} className={colClass}>
                            {syllable}
                          </span>
                        );
                      })}
                    </p>
                    <span className="text-[10px] block mt-1 text-slate-400 lowercase tracking-normal font-bold">
                      sentuh suara
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Complete sentence voice player & action */}
            <div className="pt-6 border-t border-slate-100 w-full flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center w-full">
                
                {/* Voice button */}
                <button
                  onClick={() => speakFullSentence(currentSentence.text)}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl border-b-4 border-teal-700 font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:translate-y-0.5 cursor-pointer"
                  id="speak-full-sentence-btn"
                >
                  <Volume2 className="w-5 h-5 animate-bounce" /> Dengar Kalimat 🔊
                </button>

                {/* Mark complete button */}
                <button
                  onClick={completeReading}
                  className={`px-6 py-3 rounded-2xl border-b-4 font-black flex items-center justify-center gap-2 shadow-sm transition-all active:translate-y-0.5 cursor-pointer ${
                    completedSentences.includes(currentSentence.id)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-600'
                  }`}
                  id="mark-sentence-complete-btn"
                >
                  <CheckCircle className="w-5 h-5" /> 
                  {completedSentences.includes(currentSentence.id)
                    ? 'Sudah Dibaca! (Bintang +4) ⭐'
                    : 'Kiki, Aku Selesai Membaca! 🎉'}
                </button>

              </div>
              
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                💡 Sentuh satu-satu kata di atas untuk mengeja pelan-pelan ya!
              </span>
            </div>

            {/* Success notification block within panel */}
            <AnimatePresence>
              {justEarned && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="absolute inset-0 bg-teal-900/95 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 rounded-3xl z-20 space-y-4"
                  id="success-reading-overlay"
                >
                  <div className="text-6xl animate-bounce">🥇🦖✨</div>
                  <h3 className="text-2xl font-black">Luar Biasa Hebat!</h3>
                  <div className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black px-4 py-1.5 rounded-full shadow-md text-sm">
                    <Star className="w-5 h-5 fill-amber-950" /> +4 Bintang Diperoleh!
                  </div>
                  <p className="text-xs md:text-sm text-teal-100 max-w-sm font-medium leading-relaxed">
                    Kamu bersungguh-sungguh dan lancar membaca kalimat: <span className="font-bold underline">"{currentSentence.text}"</span>. Lanjutkan ke kalimat lain!
                  </p>
                  <button
                    onClick={() => setJustEarned(false)}
                    className="px-5 py-2 bg-teal-500 hover:bg-teal-600 border-b-3 border-teal-700 font-extrabold rounded-xl text-xs uppercase"
                    id="close-success-overlay-btn"
                  >
                    Mantap, Tutup! 👍
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mini arrow navigator on bottom card edge */}
            <div className="w-full flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={handlePrev}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                id="prev-sentence-navigator"
              >
                <ArrowLeft className="w-4 h-4" /> Kalimat Sebelum
              </button>
              <button
                onClick={handleNext}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                id="next-sentence-navigator"
              >
                Kalimat Berikut <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
