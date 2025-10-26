import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Santoor } from './components/Santoor';
import { Controls } from './components/Controls';
import { KeybindingsModal } from './components/KeybindingsModal';
import { AudioEngine } from './services/audioService';
import { KEY_MAP } from './constants';
import type { RecordedNote, Note } from './types';
import { LoginPage } from './components/LoginPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [octave, setOctave] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [reverb, setReverb] = useState(0.3);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const playbackTimeoutsRef = useRef<number[]>([]);
  
  const [activeNotes, setActiveNotes] = useState<Set<Note>>(new Set());
  const [showKeybindings, setShowKeybindings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initializeAudio = useCallback(() => {
    if (!isInitialized) {
      const engine = new AudioEngine();
      engine.init();
      setAudioEngine(engine);
      setIsInitialized(true);
      engine.setVolume(volume);
      engine.setReverb(reverb);
    }
  }, [isInitialized, volume, reverb]);

  const handlePlayNote = useCallback((note: Note) => {
    if (!isInitialized) initializeAudio();
    if (audioEngine) {
      audioEngine.playNote(note, octave);
      if (isRecording) {
        const time = performance.now() - recordingStartTimeRef.current;
        setRecordedNotes(prev => [...prev, { note, time }]);
      }
    }
  }, [audioEngine, isRecording, octave, isInitialized, initializeAudio]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const note = KEY_MAP[event.key.toLowerCase()];
      if (note) {
        handlePlayNote(note);
        setActiveNotes(prev => new Set(prev).add(note));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = KEY_MAP[event.key.toLowerCase()];
      if (note) {
        setActiveNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePlayNote]);

  const toggleRecording = () => {
    if (isPlaying) handleStop();
    if (!isRecording) {
      setRecordedNotes([]);
      recordingStartTimeRef.current = performance.now();
    }
    setIsRecording(!isRecording);
  };
  
  const handlePlayback = () => {
    if (isRecording) toggleRecording();
    if (recordedNotes.length === 0) return;

    setIsPlaying(true);
    const timeouts = recordedNotes.map(noteEvent => {
      return window.setTimeout(() => {
        if(audioEngine) {
            audioEngine.playNote(noteEvent.note, octave);
        }
      }, noteEvent.time);
    });

    const totalDuration = recordedNotes[recordedNotes.length - 1]?.time || 0;
    const endTimeout = window.setTimeout(() => setIsPlaying(false), totalDuration + 500);
    
    playbackTimeoutsRef.current = [...timeouts, endTimeout];
  };

  const handleStop = () => {
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
  };

  const handleSave = () => {
    if (recordedNotes.length === 0) return;
    const data = JSON.stringify(recordedNotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'santoor-melody.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsedNotes: RecordedNote[] = JSON.parse(content);
          if (Array.isArray(parsedNotes) && parsedNotes.every(n => 'note' in n && 'time' in n)) {
            setRecordedNotes(parsedNotes);
            if (isRecording) setIsRecording(false);
            if (isPlaying) handleStop();
          } else {
            alert('Invalid file format.');
          }
        }
      } catch (error) {
        alert('Failed to parse the file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const onVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioEngine?.setVolume(newVolume);
  };

  const onReverbChange = (newReverb: number) => {
    setReverb(newReverb);
    audioEngine?.setReverb(newReverb);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 font-sans" onClick={initializeAudio}>
      {!isInitialized && (
         <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Welcome to the Virtual Santoor</h2>
            <p className="text-lg">Click anywhere to begin your musical journey.</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-7xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Virtual Santoor</h1>
          <button onClick={() => setShowKeybindings(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Show keybindings">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
        </header>
        
        <main className="flex flex-col items-center">
          <Santoor onPlayNote={handlePlayNote} activeNotes={activeNotes} />
          
          <div className="w-full max-w-3xl mt-6 p-4 bg-gray-900/50 rounded-lg">
            <Controls
              isRecording={isRecording}
              isPlaying={isPlaying}
              onRecord={toggleRecording}
              onPlay={handlePlayback}
              onStop={handleStop}
              onSave={handleSave}
              onLoad={handleLoadClick}
              volume={volume}
              onVolumeChange={onVolumeChange}
              reverb={reverb}
              onReverbChange={onReverbChange}
              octave={octave}
              onOctaveChange={setOctave}
            />
          </div>
        </main>
      </div>

      <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {showKeybindings && <KeybindingsModal onClose={() => setShowKeybindings(false)} />}
    </div>
  );
};

export default App;
