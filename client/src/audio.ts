/**
 * audio.ts — SFX synthesized with the Web Audio API + character voice pack playback.
 * All SFX and ambient music are pure Web Audio synthesis; voice lines play pre-rendered
 * character audio packs when available, falling back to silence gracefully.
 */

export type SfxName =
  | 'click' | 'bid' | 'card' | 'trick' | 'win' | 'lose'
  | 'coin' | 'deal' | 'yourturn' | 'join' | 'slam' | 'blip'
  | 'shuffle' | 'fanfare';

export type Lang = 'en' | 'zh';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private currentVoice: HTMLAudioElement | null = null;
  soundOn = true;
  musicOn = true;
  voiceOn = true;

  /** Light tactile haptic pulse on mobile devices (e.g. iPhone, Android). */
  haptic(pattern: number | number[] = 10): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore if blocked by browser permissions
      }
    }
  }

  /** Must be called from a user gesture at least once. */
  unlock(): void {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private tone(
    freq: number, dur: number, type: OscillatorType = 'square',
    gain = 0.08, when = 0, slideTo?: number
  ): void {
    if (!this.ctx || !this.soundOn) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, gain = 0.12, when = 0, lowpass = 3000): void {
    if (!this.ctx || !this.soundOn) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lowpass;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t0);
  }

  sfx(name: SfxName): void {
    this.unlock();
    switch (name) {
      case 'click':
        this.haptic(8);
        this.tone(700, 0.06, 'square', 0.05);
        break;
      case 'blip':
        this.tone(1050 + Math.random() * 260, 0.035, 'sine', 0.022);
        break;
      case 'join':
        this.haptic(10);
        this.tone(520, 0.08, 'triangle', 0.07);
        this.tone(780, 0.1, 'triangle', 0.07, 0.07);
        break;
      case 'bid':
        this.haptic(14);
        this.tone(660, 0.07, 'square', 0.06);
        this.tone(880, 0.09, 'square', 0.06, 0.07);
        break;
      case 'card':
        this.haptic(12);
        this.noise(0.09, 0.16, 0, 2500);
        this.tone(180, 0.08, 'sine', 0.1);
        break;
      case 'deal':
        this.haptic(10);
        for (let i = 0; i < 4; i++) this.noise(0.05, 0.08, i * 0.05, 4000);
        break;
      case 'trick':
        this.haptic(15);
        this.tone(523, 0.09, 'triangle', 0.08);
        this.tone(659, 0.09, 'triangle', 0.08, 0.08);
        this.tone(784, 0.14, 'triangle', 0.08, 0.16);
        break;
      case 'yourturn':
        this.haptic([15, 40, 15]);
        this.tone(1046, 0.12, 'sine', 0.07);
        this.tone(1318, 0.16, 'sine', 0.06, 0.1);
        break;
      case 'coin':
        this.haptic(8);
        for (let i = 0; i < 6; i++) {
          this.tone(988, 0.07, 'square', 0.05, i * 0.07);
          this.tone(1319, 0.12, 'square', 0.05, i * 0.07 + 0.06);
        }
        break;
      case 'win':
        this.haptic([20, 30, 25, 30, 40]);
        [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.tone(f, 0.16, 'square', 0.07, i * 0.11));
        break;
      case 'slam':
        this.haptic([30, 30, 30, 30, 60]);
        [392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.18, 'sawtooth', 0.06, i * 0.09));
        break;
      case 'lose':
        this.haptic([25, 40, 25]);
        [400, 340, 280, 200].forEach((f, i) => this.tone(f, 0.2, 'sawtooth', 0.06, i * 0.13));
        break;
      case 'shuffle':
        this.haptic(10);
        for (let i = 0; i < 14; i++) {
          this.noise(0.025, 0.09, i * 0.032 + Math.random() * 0.006, 3200 + Math.random() * 600);
        }
        this.noise(0.06, 0.12, 0.48, 2000);
        break;
      case 'fanfare':
        this.haptic([15, 20, 20, 20, 35]);
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.tone(f, 0.32, 'triangle', 0.08, i * 0.08);
          this.tone(f * 1.5, 0.28, 'sine', 0.03, i * 0.08 + 0.02);
        });
        break;
    }
  }

  /**
   * Play a character voice line (MP3). Stops any previous voice playback.
   * Resolves silently if voice is off, missing, or blocked by browser policy.
   */
  async playVoice(characterId: string, lang: Lang, lineId: string): Promise<void> {
    if (!this.soundOn || !this.voiceOn) return;
    this.unlock();

    this.stopVoice();

    try {
      const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
      const cleanBase = base.endsWith('/') ? base : `${base}/`;
      const url = `${cleanBase}voices/${lang}/${characterId}/${lineId}.mp3`;
      const a = new Audio(url);
      a.volume = 0.95;
      this.currentVoice = a;

      a.onended = () => {
        if (this.currentVoice === a) this.currentVoice = null;
      };
      a.onerror = () => {
        if (this.currentVoice === a) this.currentVoice = null;
      };

      await a.play().catch(() => {});
    } catch {
      // Graceful fallback: silent failure
    }
  }

  stopVoice(): void {
    if (this.currentVoice) {
      try {
        this.currentVoice.pause();
        this.currentVoice.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentVoice = null;
    }
  }

  /** Original chiptune-ish groove: I–V–vi–IV-ish bounce at 132 BPM. */
  startMusic(): void {
    this.unlock();
    if (this.musicTimer !== null || !this.ctx) return;
    const bassLine = [110, 110, 165, 165, 130.8, 130.8, 146.8, 146.8];
    const arpNotes = [220, 261.6, 329.6, 440, 329.6, 261.6];
    const stepDur = 60 / 132 / 2; // 8th notes
    const tick = () => {
      if (!this.musicOn || !this.ctx) return;
      const s = this.musicStep++;
      if (s % 2 === 0) {
        const f = bassLine[(s / 2) % bassLine.length]!;
        this.musicTone(f, stepDur * 1.8, 'triangle', 0.05);
      }
      const a = arpNotes[s % arpNotes.length]! * (s % 16 >= 8 ? 2 : 1);
      this.musicTone(a, stepDur * 0.9, 'square', 0.018);
      if (s % 2 === 1) this.musicNoise(0.03, 0.012);
    };
    this.musicTimer = window.setInterval(tick, stepDur * 1000);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private musicTone(freq: number, dur: number, type: OscillatorType, gain: number): void {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private musicNoise(dur: number, gain: number): void {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6000;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t0);
  }
}

export const audio = new AudioEngine();
