import { NOTE_FREQUENCIES } from '../constants';
import type { Note } from '../types';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;

  public init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    // Create reverb effect
    this.convolver = this.audioContext.createConvolver();
    this.reverbGain = this.audioContext.createGain();
    this.reverbGain.gain.value = 0; // Default reverb level

    // Generate a simple impulse response for reverb
    const impulseBuffer = this.createImpulseResponse();
    if (impulseBuffer) {
        this.convolver.buffer = impulseBuffer;
    }

    this.reverbGain.connect(this.convolver);
    this.convolver.connect(this.masterGain);
  }
  
  private createImpulseResponse(): AudioBuffer | null {
    if (!this.audioContext) return null;
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2; // 2 seconds reverb tail
    const decay = 2;
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frameCount, decay);
      }
    }
    return buffer;
  }

  public playNote(note: Note, octaveShift: number) {
    if (!this.audioContext || !this.masterGain || !this.reverbGain) return;

    let baseFrequency = NOTE_FREQUENCIES[note];
    if (!baseFrequency) return;

    const frequency = baseFrequency * Math.pow(2, octaveShift);
    const now = this.audioContext.currentTime;
    
    // --- Main Oscillator ---
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'triangle'; // A richer sound than 'sine'
    oscillator.frequency.setValueAtTime(frequency, now);

    // --- Overtone Oscillator for more realism ---
    const overtone = this.audioContext.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(frequency * 2, now);
    const overtoneGain = this.audioContext.createGain();
    overtoneGain.gain.setValueAtTime(0.3, now); // Overtone is quieter

    // --- ADSR Envelope ---
    const noteGain = this.audioContext.createGain();
    noteGain.gain.setValueAtTime(0, now);

    // Attack, Decay, Sustain, Release values for a percussive, ringing sound
    const attackTime = 0.01;
    const decayTime = 0.1;
    const sustainLevel = 0.7;
    const releaseTime = 1.5;
    const totalDuration = attackTime + decayTime + releaseTime;

    // 1. Attack: Ramp up to peak
    noteGain.gain.linearRampToValueAtTime(1.0, now + attackTime);
    // 2. Decay: Ramp down to sustain level
    noteGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    // 3. Release: Ramp down to silence
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

    // --- Connections ---
    oscillator.connect(noteGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(noteGain); // Overtone is also shaped by the main envelope
    
    noteGain.connect(this.masterGain);
    noteGain.connect(this.reverbGain);

    // --- Start and Stop ---
    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + totalDuration);
    overtone.stop(now + totalDuration);
  }

  public setVolume(level: number) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(level, this.audioContext?.currentTime ?? 0);
    }
  }

  public setReverb(level: number) {
    if (this.reverbGain) {
      this.reverbGain.gain.setValueAtTime(level, this.audioContext?.currentTime ?? 0);
    }
  }
}