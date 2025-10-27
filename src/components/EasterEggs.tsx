import { useState } from "react";
import { toast } from "sonner";

const EasterEggs = () => {
  const [foundEggs, setFoundEggs] = useState<number[]>([]);

  const eggPositions = [
    { id: 1, top: '20%', left: '10%', message: 'You found the flame of Hades!' },
    { id: 2, top: '45%', right: '15%', message: 'The whispers of the underworld speak...' },
    { id: 3, top: '70%', left: '25%', message: 'Ancient rune discovered!' },
    { id: 4, top: '60%', right: '8%', message: 'Thunder cracks in the distance...' },
    { id: 5, top: '85%', left: '50%', message: 'You have awakened something ancient...' },
  ];

  const handleEggClick = (egg: typeof eggPositions[0]) => {
    if (foundEggs.includes(egg.id)) return;

    setFoundEggs([...foundEggs, egg.id]);
    
    // Play sound effect (using Web Audio API)
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    toast(egg.message, {
      duration: 3000,
      className: 'bg-primary/90 text-white',
    });
  };

  return (
    <>
      {eggPositions.map((egg) => (
        <div
          key={egg.id}
          onClick={() => handleEggClick(egg)}
          className={`fixed cursor-pointer transition-all duration-300 hover:scale-125 z-30 ${
            foundEggs.includes(egg.id) ? 'opacity-30' : 'animate-pulse-glow'
          }`}
          style={{
            top: egg.top,
            left: egg.left,
            right: egg.right,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center glow-border">
            🔥
          </div>
        </div>
      ))}
    </>
  );
};

export default EasterEggs;
