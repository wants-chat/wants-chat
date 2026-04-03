export class WorkoutSounds {
  private static audioContext: AudioContext | null = null;
  private static soundsEnabled: boolean = true;

  static init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static setSoundsEnabled(enabled: boolean) {
    this.soundsEnabled = enabled;
    localStorage.setItem('workoutSoundsEnabled', enabled.toString());
  }

  static getSoundsEnabled(): boolean {
    const stored = localStorage.getItem('workoutSoundsEnabled');
    if (stored !== null) {
      this.soundsEnabled = stored === 'true';
    }
    return this.soundsEnabled;
  }

  static playStartSound() {
    if (!this.soundsEnabled) return;
    this.init();
    this.playWhistleSound();
  }

  static playEndSound() {
    if (!this.soundsEnabled) return;
    this.init();
    // Professional completion chime
    this.playChime([523, 659, 784], 0.15, 0.05);
  }

  static playRestStartSound() {
    if (!this.soundsEnabled) return;
    this.init();
    // Soft bell sound
    this.playBellSound(440, 0.4);
  }

  static playRestEndSound() {
    if (!this.soundsEnabled) return;
    this.init();
    // Alert chime - three ascending notes
    this.playChime([440, 554, 659], 0.12, 0.08);
  }

  static playCountdownSound() {
    if (!this.soundsEnabled) return;
    this.init();
    // Tick sound
    this.playTick();
  }

  static playWorkoutCompleteSound() {
    if (!this.soundsEnabled) return;
    this.init();
    // Victory fanfare with harmonics
    this.playVictorySound();
  }

  private static playWhistleSound() {
    if (!this.audioContext) return;

    // Marathon/race starting whistle - single long, sharp blast
    const duration = 0.8;
    
    // Main whistle tone
    const oscillator = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator(); // Second oscillator for richness
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    const compressor = this.audioContext.createDynamicsCompressor();

    // Connect audio nodes
    oscillator.connect(filter);
    oscillator2.connect(filter);
    filter.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Filter settings for piercing whistle sound
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 20;

    // Compressor for consistent loud sound
    compressor.threshold.value = -10;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.type = 'sine';
    oscillator2.type = 'sine';
    
    // Marathon whistle frequency characteristics
    // Quick rise then sustained high pitch with slight warble
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(2850, this.audioContext.currentTime + 0.08);
    oscillator.frequency.setValueAtTime(2850, this.audioContext.currentTime + 0.08);
    
    // Add slight frequency modulation for realism
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 6; // 6Hz vibrato
    lfoGain.gain.value = 30; // ±30Hz modulation
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();
    
    // Second oscillator slightly detuned for richness
    oscillator2.frequency.setValueAtTime(805, this.audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(2865, this.audioContext.currentTime + 0.08);
    oscillator2.frequency.setValueAtTime(2865, this.audioContext.currentTime + 0.08);

    // Volume envelope - sharp attack, sustained, then quick release
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + 0.02);
    gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime + 0.6);
    gainNode.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    // Add noise for air sound
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.05;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    const noiseFilter = this.audioContext.createBiquadFilter();
    const noiseGain = this.audioContext.createGain();
    
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 4000;
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);
    
    noiseGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.02);
    noiseGain.gain.setValueAtTime(0.15, this.audioContext.currentTime + 0.6);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    // Start all oscillators
    oscillator.start(this.audioContext.currentTime);
    oscillator2.start(this.audioContext.currentTime);
    noiseSource.start(this.audioContext.currentTime);
    lfo.stop(this.audioContext.currentTime + duration);
    oscillator.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);
    noiseSource.stop(this.audioContext.currentTime + duration);
  }

  private static playBellSound(frequency: number, duration: number) {
    if (!this.audioContext) return;

    // Create multiple oscillators for bell harmonics
    const fundamentalGain = 0.3;
    const overtones = [1, 2, 3.2, 4.3, 5.4];
    const gains = [1, 0.6, 0.4, 0.25, 0.15];

    overtones.forEach((multiplier, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = frequency * multiplier;
      oscillator.type = 'sine';

      const gain = fundamentalGain * gains[index];
      gainNode.gain.setValueAtTime(gain, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + duration);
    });
  }

  private static playChime(frequencies: number[], noteDuration: number, gap: number) {
    if (!this.audioContext) return;

    frequencies.forEach((freq, index) => {
      const startTime = index * (noteDuration + gap);
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext!.currentTime + startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + startTime + noteDuration);

      oscillator.start(this.audioContext!.currentTime + startTime);
      oscillator.stop(this.audioContext!.currentTime + startTime + noteDuration);
    });
  }

  private static playTick() {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    filter.type = 'highpass';
    filter.frequency.value = 1000;

    oscillator.type = 'square';
    oscillator.frequency.value = 200;

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  private static playVictorySound() {
    if (!this.audioContext) return;

    // Play a major chord progression with slight delay
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [349.23, 440.00, 523.25], // F major
      [392.00, 493.88, 587.33], // G major
      [523.25, 659.25, 783.99]  // C major (octave higher)
    ];

    chords.forEach((chord, chordIndex) => {
      chord.forEach((freq, noteIndex) => {
        const startTime = chordIndex * 0.3 + noteIndex * 0.05;
        const duration = chordIndex === chords.length - 1 ? 0.8 : 0.25;
        
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        const gain = chordIndex === chords.length - 1 ? 0.3 : 0.2;
        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(gain, this.audioContext!.currentTime + startTime + 0.02);
        gainNode.gain.setValueAtTime(gain, this.audioContext!.currentTime + startTime + duration - 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + startTime + duration);

        oscillator.start(this.audioContext!.currentTime + startTime);
        oscillator.stop(this.audioContext!.currentTime + startTime + duration);
      });
    });
  }

  private static playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}