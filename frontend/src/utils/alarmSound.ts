/**
 * Alarm Sound Utility
 * Uses Web Audio API to generate alarm sounds
 */

type SoundType = 'gentle' | 'nature' | 'classic' | 'vibrant';

class AlarmSoundManager {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Play a gentle alarm sound - soft, gradual tones
   */
  private playGentle(duration: number = 3000): void {
    const ctx = this.getAudioContext();
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5 + index * 0.2);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + duration / 1000 - 0.5);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime + index * 0.1);
      oscillator.stop(ctx.currentTime + duration / 1000);

      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
    });
  }

  /**
   * Play nature-like sounds - bird chirp simulation
   */
  private playNature(duration: number = 3000): void {
    const ctx = this.getAudioContext();
    const chirpCount = 5;

    for (let i = 0; i < chirpCount; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';

      const startTime = ctx.currentTime + i * 0.4;
      const baseFreq = 1800 + Math.random() * 400;

      oscillator.frequency.setValueAtTime(baseFreq, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, startTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, startTime + 0.2);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.25);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);

      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
    }
  }

  /**
   * Play classic alarm sound - traditional beeping
   */
  private playClassic(duration: number = 3000): void {
    const ctx = this.getAudioContext();
    const beepDuration = 0.2;
    const beepCount = Math.floor(duration / 400);

    for (let i = 0; i < beepCount; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + i * 0.4); // A5

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.4);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.4 + 0.01);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.4 + beepDuration - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.4 + beepDuration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime + i * 0.4);
      oscillator.stop(ctx.currentTime + i * 0.4 + beepDuration);

      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
    }
  }

  /**
   * Play vibrant alarm sound - energetic wake-up
   */
  private playVibrant(duration: number = 3000): void {
    const ctx = this.getAudioContext();
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      const startDelay = index * 0.15;
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + startDelay + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime + duration / 1000 - 0.2);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

      // Add filter for less harsh sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime + startDelay);
      oscillator.stop(ctx.currentTime + duration / 1000);

      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
    });
  }

  /**
   * Play alarm sound once
   */
  playOnce(soundType: SoundType = 'gentle', duration: number = 3000): void {
    this.stop();

    switch (soundType) {
      case 'gentle':
        this.playGentle(duration);
        break;
      case 'nature':
        this.playNature(duration);
        break;
      case 'classic':
        this.playClassic(duration);
        break;
      case 'vibrant':
        this.playVibrant(duration);
        break;
      default:
        this.playGentle(duration);
    }
  }

  /**
   * Play alarm sound in a loop (for actual alarm)
   */
  playLoop(soundType: SoundType = 'gentle', gradualVolume: boolean = true): void {
    this.isPlaying = true;

    const playSound = () => {
      if (!this.isPlaying) return;
      this.playOnce(soundType, 2500);
    };

    playSound();
    this.intervalId = setInterval(playSound, 3000);
  }

  /**
   * Stop all sounds
   */
  stop(): void {
    this.isPlaying = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });

    this.gainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    });

    this.oscillators = [];
    this.gainNodes = [];
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
export const alarmSound = new AlarmSoundManager();

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * Show notification with optional sound
 */
export const showAlarmNotification = (
  title: string,
  body: string,
  soundType: SoundType = 'gentle'
): void => {
  // Play sound
  alarmSound.playLoop(soundType);

  // Show notification
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'sleep-alarm',
      requireInteraction: true,
    });

    notification.onclick = () => {
      alarmSound.stop();
      notification.close();
      window.focus();
    };
  }
};

export default alarmSound;
