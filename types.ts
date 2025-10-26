
export type Note = string;

export interface RecordedNote {
  note: Note;
  time: number; // in milliseconds
}

export interface KeyMap {
  [key: string]: Note;
}
