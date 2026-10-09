/**
 * audio.ts — all sound is synthesized with the Web Audio API.
 * Zero external files: SFX + an original background groove.
 */

export type SfxName =
  | 'click' | 'bid' | 'card' | 'trick' | 'win' | 'lose'
  | 'coin' | 'deal' | 'yourturn' | 'join' | 'slam';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  soundOn = true;
  musicOn = true;

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
      case 'click': this.tone(700, 0.06, 'square', 0.05); break;
      case 'join': this.tone(520, 0.08, 'triangle', 0.07); this.tone(780, 0.1, 'triangle', 0.07, 0.07); break;
      case 'bid': this.tone(660, 0.07, 'square', 0.06); this.tone(880, 0.09, 'square', 0.06, 0.07); break;
      case 'card': this.noise(0.09, 0.16, 0, 2500); this.tone(180, 0.08, 'sine', 0.1); break;
      case 'deal': for (let i = 0; i < 4; i++) this.noise(0.05, 0.08, i * 0.05, 4000); break;
      case 'trick':
        this.tone(523, 0.09, 'triangle', 0.08);
        this.tone(659, 0.09, 'triangle', 0.08, 0.08);
        this.tone(784, 0.14, 'triangle', 0.08, 0.16);
        break;
      case 'yourturn': this.tone(1046, 0.12, 'sine', 0.07); this.tone(1318, 0.16, 'sine', 0.06, 0.1); break;
      case 'coin':
        for (let i = 0; i < 6; i++) {
          this.tone(988, 0.07, 'square', 0.05, i * 0.07);
          this.tone(1319, 0.12, 'square', 0.05, i * 0.07 + 0.06);
        }
        break;
      case 'win':
        [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.tone(f, 0.16, 'square', 0.07, i * 0.11));
        break;
      case 'slam':
        [392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.18, 'sawtooth', 0.06, i * 0.09));
        break;
      case 'lose':
        [400, 340, 280, 200].forEach((f, i) => this.tone(f, 0.2, 'sawtooth', 0.06, i * 0.13));
        break;
    }
  }

  /** Original chiptune-ish groove: I–V–vi–IV-ish bounce at 132 BPM. */
  startMusic(): void {
    this.unlock();
    if (this.musicTimer !== null || !this.ctx) return;
    const bassLine = [110, 110, 165, 165, 130.8, 130.8, 146.8, 146.8]; // A F D? original pattern
    const arpNotes = [220, 261.6, 329.6, 440, 329.6, 261.6];
    const stepDur = 60 / 132 / 2; // 8th notes
    const tick = () => {
      if (!this.musicOn || !this.ctx) return;
      const s = this.musicStep++;
      // bass on beats
      if (s % 2 === 0) {
        const f = bassLine[(s / 2) % bassLine.length]!;
        this.musicTone(f, stepDur * 1.8, 'triangle', 0.05);
      }
      // sparkle arp
      const a = arpNotes[s % arpNotes.length]! * (s % 16 >= 8 ? 2 : 1);
      this.musicTone(a, stepDur * 0.9, 'square', 0.018);
      // hat tick
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
