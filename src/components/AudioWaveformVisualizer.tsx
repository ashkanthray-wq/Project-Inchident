import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Sparkles } from 'lucide-react';
import { playAudioBriefing, AudioBriefingController } from '../utils/audio';

interface AudioWaveformVisualizerProps {
  incidentId: string;
  incidentTitle: string;
  rootCause: string;
  severity: string;
  team: string;
  onAudioPlayed?: () => void;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  incidentId,
  incidentTitle,
  rootCause,
  severity,
  team,
  onAudioPlayed
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [frequencies, setFrequencies] = useState<number[]>(Array(24).fill(15));
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const controllerRef = useRef<AudioBriefingController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sitrepScript = `Tactical Sitrep for incident ${incidentId.toUpperCase()}. Priority ${severity}. Assigned to ${team} team. Incident summary: ${incidentTitle}. Isolated root cause: ${rootCause}. Automated runbooks are staged for execution.`;

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStartPlayback = () => {
    setIsPlaying(true);
    setElapsedSeconds(0);
    if (onAudioPlayed) {
      onAudioPlayed();
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    controllerRef.current = playAudioBriefing(
      sitrepScript,
      (freqs) => {
        setFrequencies(freqs);
      },
      () => {
        setIsPlaying(false);
        setFrequencies(Array(24).fill(15));
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    );
  };

  const handleStopPlayback = () => {
    if (controllerRef.current) {
      controllerRef.current.stop();
      controllerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setFrequencies(Array(24).fill(15));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isPlaying) {
    return (
      <button
        type="button"
        id="btn-play-ai-briefing"
        onClick={handleStartPlayback}
        className="ai-gradient-btn ai-cta-btn !rounded-full text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 border border-indigo-400/30 transition-all duration-200 active:scale-95 cursor-pointer"
        title="Play synthesized ElevenLabs tactical voice briefing"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Play className="w-3 h-3 fill-current text-white translate-x-0.5" />
        </span>
        <span className="tracking-tight font-bold">Play AI Audio Briefing</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/25 text-amber-200 border border-amber-300/30 shrink-0">
          ElevenLabs
        </span>
      </button>
    );
  }

  return (
    <div 
      id="ai-audio-waveform-container"
      className="h-10 inline-flex items-center gap-3 px-4 rounded-full bg-neutral-900 text-white border border-neutral-800 shadow-md transition-all duration-300 animate-in fade-in"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="btn-stop-ai-briefing"
          onClick={handleStopPlayback}
          className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white transition-colors active:scale-90"
          title="Stop briefing"
        >
          <Square className="w-2.5 h-2.5 fill-current" />
        </button>
        <span className="text-[11px] font-mono text-neutral-300 font-medium w-8 text-right">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Minimalist Waveform Visualizer */}
      <div 
        aria-label="Live audio frequency spectrum"
        className="flex items-center gap-0.5 h-6 px-1"
      >
        {frequencies.map((height, idx) => (
          <span
            key={idx}
            className="w-1 rounded-full bg-linear-to-t from-purple-500 to-sky-400 transition-all duration-100"
            style={{ height: `${Math.max(4, Math.min(22, (height / 100) * 22))}px` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-800 text-[11px] text-neutral-400 font-mono">
        <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span className="text-purple-300 font-semibold">ElevenLabs Sitrep</span>
      </div>
    </div>
  );
};
