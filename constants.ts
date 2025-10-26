
import type { KeyMap } from './types';

// Using a C-Major scale for simplicity across several octaves
export const NOTE_FREQUENCIES: { [note: string]: number } = {
  // Octave 3
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  // Octave 4 (Middle C)
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  // Octave 5
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
};

export const SANTOOR_NOTES: string[] = [
    'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
    'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'
];

export const KEY_MAP: KeyMap = {
  'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3',
  'q': 'C4', 'w': 'D4', 'e': 'E4', 'r': 'F4', 't': 'G4', 'y': 'A4', 'u': 'B4',
  'z': 'C5', 'x': 'D5', 'c': 'E5', 'v': 'F5', 'b': 'G5', 'n': 'A5', 'm': 'B5',
};
