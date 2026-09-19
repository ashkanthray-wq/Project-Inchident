// Audio utility for Pager emergency chimes and ElevenLabs voice briefing simulation

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a clean, low-frequency UI chime for SEV-1 emergency paging
 */
export function playPagerChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // First tone (320Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(340, now);
    osc1.frequency.exponentialRampToValueAtTime(280, now + 0.28);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second alert chime tone (220Hz deeper resonance)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(240, now + 0.16);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.55);
    gain2.gain.setValueAtTime(0.2, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.warn('Audio chime playback omitted:', err);
  }
}

/**
 * Synthesizes an ElevenLabs AI Sitrep tactical audio briefing
 * Uses Web SpeechSynthesis with natural tuning and returns a controller for playback and waveform updates
 */
export interface AudioBriefingController {
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function playAudioBriefing(
  text: string,
  onWaveformData: (frequencies: number[]) => void,
  onEnded: () => void
): AudioBriefingController {
  let isCancelled = false;
  let intervalId: NodeJS.Timeout | null = null;

  // Animate dynamic waveform bars
  const startWaveformSimulation = () => {
    intervalId = setInterval(() => {
      if (isCancelled) return;
      const bars = Array.from({ length: 24 }, () => {
        return Math.floor(Math.random() * 75 + 15);
      });
      onWaveformData(bars);
    }, 100);
  };

  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Try selecting a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.lang.startsWith('en')) &&
      !v.name.includes('Bad')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (!isCancelled) startWaveformSimulation();
    };

    utterance.onend = () => {
      cleanup();
      onEnded();
    };

    utterance.onerror = () => {
      cleanup();
      onEnded();
    };

    window.speechSynthesis.speak(utterance);

    return {
      stop: () => {
        isCancelled = true;
        cleanup();
        window.speechSynthesis.cancel();
        onEnded();
      },
      pause: () => {
        window.speechSynthesis.pause();
      },
      resume: () => {
        window.speechSynthesis.resume();
      }
    };
  }

  // Fallback if SpeechSynthesis is unavailable
  startWaveformSimulation();
  const fallbackTimer = setTimeout(() => {
    cleanup();
    onEnded();
  }, 10000);

  return {
    stop: () => {
      isCancelled = true;
      cleanup();
      clearTimeout(fallbackTimer);
      onEnded();
    },
    pause: () => {},
    resume: () => {}
  };
}
