import { useEffect } from "react";

interface MoodSyncProps {
  status: 'offline' | 'live' | 'event';
}

const MoodSync = ({ status }: MoodSyncProps) => {
  useEffect(() => {
    const root = document.documentElement;
    
    switch (status) {
      case 'offline':
        root.style.setProperty('--primary', '0 84% 60%'); // Red
        root.style.setProperty('--primary-glow', '0 84% 70%');
        break;
      case 'live':
        root.style.setProperty('--primary', '271 91% 65%'); // Purple (default)
        root.style.setProperty('--primary-glow', '271 91% 75%');
        break;
      case 'event':
        root.style.setProperty('--primary', '45 100% 51%'); // Gold
        root.style.setProperty('--primary-glow', '45 100% 61%');
        break;
    }
  }, [status]);

  return null;
};

export default MoodSync;
