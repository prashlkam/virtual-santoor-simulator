
import React from 'react';
import { KEY_MAP } from '../constants';
import { XIcon } from './Icons';

interface KeybindingsModalProps {
  onClose: () => void;
}

export const KeybindingsModal: React.FC<KeybindingsModalProps> = ({ onClose }) => {
  const keyEntries = Object.entries(KEY_MAP);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Keyboard Controls</h2>
        <p className="text-gray-400 mb-6">Use your keyboard to play the santoor notes. The keys are mapped across three octaves.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {keyEntries.map(([key, note]) => (
            <div key={key} className="flex items-center space-x-2 bg-gray-700 p-2 rounded">
              <kbd className="font-mono text-lg font-semibold bg-gray-900 text-cyan-400 px-2 py-1 rounded w-8 text-center">
                {key.toUpperCase()}
              </kbd>
              <span className="text-gray-300">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
