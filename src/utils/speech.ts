/**
 * Speech & Sound Synthesizer Utility for the Children Learning App.
 * Uses Web Audio API for interactive SFX and Web Speech Synthesis for spoken words.
 */

// Simple synthesizer for audio sound effects (No external asset files needed!)
class AudioSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Cute upward sliding chime for a correct action
  playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
      
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  }

  // Soft "boing/bloop" sweep down for incorrect layout or error
  playError() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  }

  // Quick light bubble click sound
  playPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  }

  // Sparkly level-up sound
  playLevelUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // C5 to C7 arpeggio
      
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);
        
        gain.gain.setValueAtTime(0, now + index * 0.05);
        gain.gain.linearRampToValueAtTime(0.1, now + index * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.45);
      });
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  }
}

export const synth = new AudioSynth();

// Speech Synthesis Helper
export function speakIndonesian(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel current speaking
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.85; // Slightly slower for kids
  utterance.pitch = 1.25; // Slightly childish and cheerful pitch

  // Try to find an Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const indonesianVoice = voices.find(voice => 
    voice.lang.includes('id-ID') || voice.lang.includes('id_ID') || voice.lang.toLowerCase().includes('id')
  );

  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd; // avoid blocking state on failure
  }

  window.speechSynthesis.speak(utterance);
}

// In some browsers, voices are loaded asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}
