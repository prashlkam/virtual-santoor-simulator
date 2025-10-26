
import React from 'react';
import { RecordIcon, PlayIcon, StopIcon, SaveIcon, UploadIcon, VolumeIcon, ReverbIcon, MinusIcon, PlusIcon } from './Icons';

interface ControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlay: () => void;
  onStop: () => void;
  onSave: () => void;
  onLoad: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  reverb: number;
  onReverbChange: (value: number) => void;
  octave: number;
  onOctaveChange: (value: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRecording,
  isPlaying,
  onRecord,
  onPlay,
  onStop,
  onSave,
  onLoad,
  volume,
  onVolumeChange,
  reverb,
  onReverbChange,
  octave,
  onOctaveChange,
}) => {
  const baseButtonClass = "p-3 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400";
  const disabledButtonClass = "bg-gray-600 cursor-not-allowed text-gray-400";

  return (
    <div className="space-y-4">
      <div className="flex justify-center items-center space-x-2 sm:space-x-4">
        <button onClick={onRecord} className={`${baseButtonClass} ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 hover:bg-red-500'}`} title="Record">
          <RecordIcon className="w-6 h-6" />
        </button>
        <button onClick={isPlaying ? onStop : onPlay} className={`${baseButtonClass} ${isPlaying ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-cyan-500'}`} title={isPlaying ? "Stop" : "Play"}>
          {isPlaying ? <StopIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>
        <button onClick={onSave} className={`${baseButtonClass} bg-gray-700 hover:bg-green-500`} title="Save Recording">
            <SaveIcon className="w-6 h-6" />
        </button>
        <button onClick={onLoad} className={`${baseButtonClass} bg-gray-700 hover:bg-blue-500`} title="Load Recording">
            <UploadIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <VolumeIcon className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Reverb Control */}
        <div className="flex items-center space-x-2">
          <ReverbIcon className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverb}
            onChange={(e) => onReverbChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Octave Control */}
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium text-gray-400">Octave</span>
          <button onClick={() => onOctaveChange(octave - 1)} disabled={octave <= -2} className={`${baseButtonClass} w-10 h-10 ${octave <= -2 ? disabledButtonClass : 'bg-gray-700 hover:bg-gray-600'}`}>
            <MinusIcon className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold w-8 text-center">{octave}</span>
          <button onClick={() => onOctaveChange(octave + 1)} disabled={octave >= 2} className={`${baseButtonClass} w-10 h-10 ${octave >= 2 ? disabledButtonClass : 'bg-gray-700 hover:bg-gray-600'}`}>
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
