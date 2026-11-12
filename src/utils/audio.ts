/**
 * Web Audio API synthesizer for sound effects and gentle romantic background music box.
 * Self-contained, zero external asset dependencies, zero 404s, works reliably in any browser.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicTimer: number | null = null;
  private melodyIndex: number = 0;

  // Romantic music box melody (frequencies in Hz: notes C5, D5, E5, G5, A5, C6 etc.)
  private readonly melodyNotes = [
    { freq: 523.25, dur: 0.5 }, // C5
    { freq: 659.25, dur: 0.5 }, // E5
    { freq: 783.99, dur: 0.5 }, // G5
    { freq: 880.00, dur: 0.75 }, // A5
    { freq: 783.99, dur: 0.5 }, // G5
    { freq: 659.25, dur: 0.5 }, // E5
    { freq: 587.33, dur: 0.75 }, // D5
    { freq: 523.25, dur: 0.5 }, // C5

    { freq: 587.33, dur: 0.5 }, // D5
    { freq: 659.25, dur: 0.5 }, // E5
    { freq: 783.99, dur: 0.75 }, // G5
    { freq: 880.00, dur: 0.5 }, // A5
    { freq: 987.77, dur: 0.5 }, // B5
    { freq: 1046.50, dur: 1.0 }, // C6
    { freq: 880.00, dur: 0.5 }, // A5
    { freq: 783.99, dur: 0.75 }, // G5
  ];

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public toggleMusic(): boolean {
    this.initCtx();
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  private startMusic() {
    this.stopMusic();
    this.melodyIndex = 0;
    this.playNextMusicNote();
  }

  private stopMusic() {
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playNextMusicNote() {
    if (!this.musicEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const note = this.melodyNotes[this.melodyIndex];
    this.playTone(note.freq, 'sine', note.dur * 0.7, 0.08);

    // Occasional gentle bass accompaniment (octave lower)
    if (this.melodyIndex % 4 === 0) {
      this.playTone(note.freq / 2, 'triangle', note.dur * 1.2, 0.05);
    }

    this.melodyIndex = (this.melodyIndex + 1) % this.melodyNotes.length;
    const intervalMs = note.dur * 700;
    this.musicTimer = window.setTimeout(() => {
      this.playNextMusicNote();
    }, intervalMs);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }

  public playPop() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  public playHeartCollect() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const startTime = this.ctx!.currentTime + idx * 0.06;
        const dur = 0.35;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch {}
  }

  public playEnvelopeOpen() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      // Magical paper & harp shimmer
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + i * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch {}
  }

  public playSurpriseWiggle() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(640, this.ctx.currentTime + 0.12);
      osc.frequency.linearRampToValueAtTime(480, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  public playCelebrationFanfare() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      // Joyful celebratory romantic arpeggio + fanfare
      const notes = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.50, d: 0.4 }, // C6
        { f: 987.77, d: 0.15 }, // B5
        { f: 1046.50, d: 0.8 }, // C6 grand finish
      ];

      let delay = 0;
      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + delay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + n.d);

        delay += n.d * 0.7;
      });
    } catch {}
  }
}

export const audio = new SoundEngine();
