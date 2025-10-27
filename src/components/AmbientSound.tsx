import { useEffect, useRef, useState } from "react";

interface AmbientSoundProps {
  enabled: boolean;
  theme?: 'underworld' | 'winter' | 'default';
}

const AmbientSound = ({ enabled, theme = 'underworld' }: AmbientSoundProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      
      // Create gain node for volume control
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = 0.03; // Very low volume
      gainNodeRef.current.connect(ctx.destination);

      // Create ambient sound based on theme
      const frequencies = theme === 'winter' 
        ? [110, 165, 220] // Cold, wind-like frequencies
        : [55, 82.5, 110]; // Deep, underworld rumble

      oscillatorsRef.current = frequencies.map((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Create subtle LFO for variation
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + (i * 0.05);
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(gainNodeRef.current!);
        osc.start();
        lfo.start();
        
        return osc;
      });
    }

    return () => {
      oscillatorsRef.current.forEach(osc => osc.stop());
      oscillatorsRef.current = [];
      audioContextRef.current?.close();
    };
  }, [enabled, theme]);

  return null;
};

export default AmbientSound;
