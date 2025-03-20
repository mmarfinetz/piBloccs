import { useEffect, useRef } from 'react';
import { useSimulation } from '../contexts/SimulationContext';

const useCollisionSound = () => {
  const { state } = useSimulation();
  const { collisionEvents, soundEnabled } = state;
  
  // References to AudioContext and oscillators
  const audioContextRef = useRef(null);
  const lastCollisionTimeRef = useRef(0);
  
  useEffect(() => {
    // Only proceed if sound is enabled and there are collision events
    if (!soundEnabled || collisionEvents.length === 0) return;
    
    // Get the most recent collision
    const latestCollision = collisionEvents[collisionEvents.length - 1];
    
    // Skip if this collision has already been played (could happen on re-renders)
    if (latestCollision.time === lastCollisionTimeRef.current) return;
    lastCollisionTimeRef.current = latestCollision.time;
    
    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create sound based on collision type
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    // Configure oscillator based on collision type
    if (latestCollision.type === 'blocks') {
      oscillator.type = 'sine';
      oscillator.frequency.value = 440; // A4 for block collisions
    } else { // wall collision
      oscillator.type = 'triangle';
      oscillator.frequency.value = 330; // E4 for wall collisions
    }
    
    // Short decay
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, audioContextRef.current.currentTime + 0.2
    );
    
    // Connect nodes and play sound
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.2);
    
    // Clean up the oscillator when done
    return () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }, [collisionEvents, soundEnabled]);
  
  // Clean up AudioContext when component unmounts
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
};

export default useCollisionSound;