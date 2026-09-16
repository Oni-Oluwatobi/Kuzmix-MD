// Bulletproof Web Audio API, HTML5 Audio, and Speech Synthesis engine for Kuzmix-MD

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: { stop: () => void }[] = [];
  private currentHtmlAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private playbackInterval: number | null = null;
  private onProgressCallback: ((currentTime: number, isFinished: boolean) => void) | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private async getContext(): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Handled on subsequent user gesture
      }
    }
    return this.ctx;
  }

  // Generate reusable white noise buffer for realistic percussion (hi-hats, snares, shakers)
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of white noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // Play realistic WhatsApp incoming message chime
  public async playIncomingChime() {
    try {
      const ctx = await this.getContext();
      const now = ctx.currentTime;

      // Gentle WhatsApp tone: 830Hz then 1660Hz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(830, now);
      osc1.frequency.exponentialRampToValueAtTime(1240, now + 0.08);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1660, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.3);
    } catch {
      // Ignore if autoplay policy pending
    }
  }

  // Text-To-Speech with SpeechSynthesis
  public speakText(text: string, onEnd?: () => void) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_~`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.playIncomingChime();
      if (onEnd) onEnd();
    }
  }

  public stopAudio() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (this.currentHtmlAudio) {
      try {
        this.currentHtmlAudio.pause();
        this.currentHtmlAudio.currentTime = 0;
      } catch {
        // Ignored
      }
      this.currentHtmlAudio = null;
    }

    this.currentSourceNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Node already stopped
      }
    });
    this.currentSourceNodes = [];
    this.isPlaying = false;
    this.currentTrackId = null;

    if (this.playbackInterval) {
      window.clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    if (this.onProgressCallback) {
      this.onProgressCallback(0, true);
    }
  }

  // Play audio track (supports real stream URL or rich synthesized Afrobeats/Pop audio)
  public async playTrack(
    trackId: string,
    songTitle: string,
    audioUrl: string | undefined,
    durationSeconds: number,
    onProgress: (currentTime: number, isFinished: boolean) => void
  ) {
    this.stopAudio();
    this.currentTrackId = trackId;
    this.isPlaying = true;
    this.onProgressCallback = onProgress;

    // If audioUrl provided and valid, try HTML5 Audio first
    if (audioUrl && audioUrl.startsWith('http')) {
      try {
        const audio = new Audio(audioUrl);
        this.currentHtmlAudio = audio;

        audio.ontimeupdate = () => {
          if (this.isPlaying && this.currentTrackId === trackId) {
            onProgress(audio.currentTime, false);
          }
        };

        audio.onended = () => {
          this.stopAudio();
          onProgress(audio.duration || durationSeconds, true);
        };

        audio.onerror = () => {
          // Fall back to synthesis
          this.currentHtmlAudio = null;
          this.playSynthesizedTrack(trackId, songTitle, onProgress);
        };

        await audio.play();
        return;
      } catch {
        // Fall back to synthesis
        this.currentHtmlAudio = null;
      }
    }

    // Default to rich Web Audio Synthesizer
    await this.playSynthesizedTrack(trackId, songTitle, onProgress);
  }

  // Rich multi-layer Web Audio Synthesizer (Chords, 808 Bass, Drums, Marimba Melody)
  public async playSynthesizedTrack(
    trackId: string,
    songTitle: string,
    onProgress: (currentTime: number, isFinished: boolean) => void
  ) {
    this.currentTrackId = trackId;
    this.isPlaying = true;
    this.onProgressCallback = onProgress;

    try {
      const ctx = await this.getContext();
      const now = ctx.currentTime + 0.05;
      const lower = songTitle.toLowerCase();

      // Master Compressor & Master Gain
      const masterCompressor = ctx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-18, now);
      masterCompressor.knee.setValueAtTime(12, now);
      masterCompressor.ratio.setValueAtTime(6, now);
      masterCompressor.attack.setValueAtTime(0.003, now);
      masterCompressor.release.setValueAtTime(0.25, now);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.45, now);

      masterCompressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      const noiseBuf = this.getNoiseBuffer(ctx);

      // Track presets
      let chords: number[][] = [];
      let melodyNotes: { note: number; dur: number; time: number }[] = [];
      let bpm = 104;

      if (lower.includes('essence') || lower.includes('wizkid') || lower.includes('tems')) {
        // Essence warm breezy chords: Em7 -> Cmaj7 -> G -> D
        bpm = 102;
        chords = [
          [164.8, 196.0, 246.9, 329.6], // Em
          [130.8, 164.8, 196.0, 261.6], // C
          [196.0, 246.9, 293.7, 392.0], // G
          [146.8, 220.0, 293.7, 369.9], // D
        ];
        melodyNotes = [
          { note: 329.6, dur: 0.4, time: 0.0 }, // E4
          { note: 392.0, dur: 0.6, time: 0.4 }, // G4
          { note: 440.0, dur: 0.5, time: 1.0 }, // A4
          { note: 493.9, dur: 0.7, time: 1.6 }, // B4
          { note: 440.0, dur: 0.4, time: 2.4 }, // A4
          { note: 392.0, dur: 0.8, time: 2.8 }, // G4
          { note: 329.6, dur: 0.5, time: 3.8 }, // E4
          { note: 293.7, dur: 0.5, time: 4.4 }, // D4
          { note: 261.6, dur: 0.9, time: 5.0 }, // C4
          { note: 329.6, dur: 0.6, time: 6.0 }, // E4
          { note: 392.0, dur: 1.2, time: 6.8 }, // G4
        ];
      } else if (lower.includes('calm down') || lower.includes('rema')) {
        // Calm Down bouncy Afro-fusion: F#m -> D -> A -> E
        bpm = 108;
        chords = [
          [185.0, 220.0, 277.2, 370.0],
          [146.8, 185.0, 220.0, 293.7],
          [220.0, 277.2, 330.0, 440.0],
          [164.8, 207.7, 246.9, 329.6],
        ];
        melodyNotes = [
          { note: 440.0, dur: 0.3, time: 0.0 },
          { note: 440.0, dur: 0.3, time: 0.4 },
          { note: 440.0, dur: 0.3, time: 0.8 },
          { note: 370.0, dur: 0.6, time: 1.2 },
          { note: 329.6, dur: 0.5, time: 2.0 },
          { note: 277.2, dur: 0.5, time: 2.6 },
          { note: 293.7, dur: 0.7, time: 3.2 },
          { note: 370.0, dur: 0.5, time: 4.0 },
          { note: 440.0, dur: 0.9, time: 4.8 },
        ];
      } else if (lower.includes('lonely') || lower.includes('asake')) {
        // Lonely at the top Amapiano vibe
        bpm = 112;
        chords = [
          [110.0, 164.8, 220.0, 261.6],
          [130.8, 196.0, 261.6, 329.6],
          [146.8, 220.0, 293.7, 349.2],
          [164.8, 246.9, 329.6, 392.0],
        ];
        melodyNotes = [
          { note: 329.6, dur: 0.4, time: 0.0 },
          { note: 329.6, dur: 0.4, time: 0.5 },
          { note: 293.7, dur: 0.4, time: 1.0 },
          { note: 261.6, dur: 0.6, time: 1.5 },
          { note: 220.0, dur: 0.8, time: 2.2 },
          { note: 261.6, dur: 0.5, time: 3.2 },
          { note: 293.7, dur: 0.5, time: 3.8 },
          { note: 329.6, dur: 1.0, time: 4.5 },
        ];
      } else {
        // Universal uplifting Afro-Pop groove
        bpm = 105;
        chords = [
          [130.8, 164.8, 196.0, 261.6], // C
          [146.8, 174.6, 220.0, 293.7], // Dm
          [164.8, 196.0, 246.9, 329.6], // Em
          [196.0, 246.9, 293.7, 392.0], // G
        ];
        melodyNotes = [
          { note: 392.0, dur: 0.5, time: 0.0 },
          { note: 440.0, dur: 0.5, time: 0.6 },
          { note: 523.3, dur: 0.7, time: 1.2 },
          { note: 440.0, dur: 0.4, time: 2.0 },
          { note: 392.0, dur: 0.6, time: 2.6 },
          { note: 329.6, dur: 0.8, time: 3.4 },
          { note: 293.7, dur: 0.5, time: 4.4 },
          { note: 261.6, dur: 1.2, time: 5.2 },
        ];
      }

      const totalLoopSeconds = (60 / bpm) * 16; // 4 bars per loop
      const repeats = 4; // 4 loops (~32 to 36 seconds)
      const totalDuration = totalLoopSeconds * repeats;

      for (let r = 0; r < repeats; r++) {
        const offset = now + r * totalLoopSeconds;

        // 1. Chords & Lush Pad (Triangle waves with lowpass filtering)
        const chordFilter = ctx.createBiquadFilter();
        chordFilter.type = 'lowpass';
        chordFilter.frequency.setValueAtTime(1600, offset);
        chordFilter.connect(masterCompressor);

        chords.forEach((chord, cIdx) => {
          const chordTime = offset + cIdx * (totalLoopSeconds / chords.length);
          const chordDur = totalLoopSeconds / chords.length;

          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, chordTime);

            gain.gain.setValueAtTime(0.001, chordTime);
            gain.gain.linearRampToValueAtTime(0.07, chordTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, chordTime + chordDur - 0.04);

            osc.connect(gain);
            gain.connect(chordFilter);

            osc.start(chordTime);
            osc.stop(chordTime + chordDur);
            this.currentSourceNodes.push(osc);
          });
        });

        // 2. Afrobeat Drums & Percussion (Kick, Snare, Shaker, Hi-Hat)
        const beatStep = (60 / bpm) / 4; // 16th note steps

        for (let s = 0; s < 64; s++) {
          const sTime = offset + s * beatStep;
          const stepInBar = s % 16;

          // A) Kick Drum on standard Afrobeat pulse (steps 0, 6, 10)
          if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
            const kickOsc = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(140, sTime);
            kickOsc.frequency.exponentialRampToValueAtTime(42, sTime + 0.12);

            kickGain.gain.setValueAtTime(0.35, sTime);
            kickGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.22);

            kickOsc.connect(kickGain);
            kickGain.connect(masterCompressor);

            kickOsc.start(sTime);
            kickOsc.stop(sTime + 0.25);
            this.currentSourceNodes.push(kickOsc);
          }

          // B) Snare / Rimshot on steps 4, 12
          if (stepInBar === 4 || stepInBar === 12) {
            const snareTone = ctx.createOscillator();
            const snareGain = ctx.createGain();
            snareTone.type = 'triangle';
            snareTone.frequency.setValueAtTime(220, sTime);

            snareGain.gain.setValueAtTime(0.15, sTime);
            snareGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.1);

            snareTone.connect(snareGain);
            snareGain.connect(masterCompressor);

            snareTone.start(sTime);
            snareTone.stop(sTime + 0.12);
            this.currentSourceNodes.push(snareTone);

            // Snare noise snap
            const noiseNode = ctx.createBufferSource();
            noiseNode.buffer = noiseBuf;
            const noiseGain = ctx.createGain();
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(2400, sTime);

            noiseGain.gain.setValueAtTime(0.12, sTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.12);

            noiseNode.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(masterCompressor);

            noiseNode.start(sTime);
            noiseNode.stop(sTime + 0.13);
            this.currentSourceNodes.push(noiseNode);
          }

          // C) Shaker / Hi-Hat continuous 16th groove with accentuation
          const hatNode = ctx.createBufferSource();
          hatNode.buffer = noiseBuf;
          const hatFilter = ctx.createBiquadFilter();
          hatFilter.type = 'highpass';
          hatFilter.frequency.setValueAtTime(6500, sTime);

          const hatGain = ctx.createGain();
          const isAccent = stepInBar % 2 === 0;
          hatGain.gain.setValueAtTime(isAccent ? 0.04 : 0.02, sTime);
          hatGain.gain.exponentialRampToValueAtTime(0.0001, sTime + 0.045);

          hatNode.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(masterCompressor);

          hatNode.start(sTime);
          hatNode.stop(sTime + 0.05);
          this.currentSourceNodes.push(hatNode);
        }

        // 3. Deep 808 Sub-Bassline (Sine with warm drive)
        for (let b = 0; b < 16; b++) {
          const bTime = offset + b * ((60 / bpm) / 2);
          const chordIndex = Math.floor(b / 4) % chords.length;
          const rootFreq = chords[chordIndex][0] / 2; // Low octave

          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(rootFreq * 1.05, bTime);
          bassOsc.frequency.exponentialRampToValueAtTime(rootFreq, bTime + 0.05);

          bassGain.gain.setValueAtTime(0.24, bTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.35);

          bassOsc.connect(bassGain);
          bassGain.connect(masterCompressor);

          bassOsc.start(bTime);
          bassOsc.stop(bTime + 0.38);
          this.currentSourceNodes.push(bassOsc);
        }

        // 4. Melodic Lead (Marimba / Kalimba bell harmonics)
        melodyNotes.forEach(({ note, dur, time }) => {
          const noteTime = offset + time;

          // Fundamental Sine
          const melOsc1 = ctx.createOscillator();
          const melGain1 = ctx.createGain();
          melOsc1.type = 'sine';
          melOsc1.frequency.setValueAtTime(note, noteTime);

          melGain1.gain.setValueAtTime(0.18, noteTime);
          melGain1.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

          melOsc1.connect(melGain1);
          melGain1.connect(masterCompressor);

          melOsc1.start(noteTime);
          melOsc1.stop(noteTime + dur);
          this.currentSourceNodes.push(melOsc1);

          // Octave overtone sparkle
          const melOsc2 = ctx.createOscillator();
          const melGain2 = ctx.createGain();
          melOsc2.type = 'triangle';
          melOsc2.frequency.setValueAtTime(note * 2, noteTime);

          melGain2.gain.setValueAtTime(0.06, noteTime);
          melGain2.gain.exponentialRampToValueAtTime(0.0001, noteTime + Math.min(dur, 0.25));

          melOsc2.connect(melGain2);
          melGain2.connect(masterCompressor);

          melOsc2.start(noteTime);
          melOsc2.stop(noteTime + Math.min(dur, 0.28));
          this.currentSourceNodes.push(melOsc2);
        });
      }

      // Track playback progress
      let elapsed = 0;
      this.playbackInterval = window.setInterval(() => {
        elapsed += 0.5;
        if (elapsed >= totalDuration) {
          this.stopAudio();
          onProgress(totalDuration, true);
        } else {
          onProgress(elapsed, false);
        }
      }, 500);
    } catch (err) {
      console.warn('Audio playback not initialized or blocked by browser gesture:', err);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }
}

export const soundEngine = new SoundEngine();
