import React, { useRef } from 'react';
import { SANTOOR_NOTES } from '../constants';
import type { Note } from '../types';

interface SantoorProps {
  onPlayNote: (note: Note) => void;
  activeNotes: Set<Note>;
}

export const Santoor: React.FC<SantoorProps> = ({ onPlayNote, activeNotes }) => {
  const width = 800;
  const height = 400;

  const isMouseDownRef = useRef(false);
  const repeatIntervalRef = useRef<number | null>(null);

  const stopNoteRepeat = () => {
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  };

  const startNoteRepeat = (note: Note) => {
    stopNoteRepeat();
    onPlayNote(note); // Play immediately
    repeatIntervalRef.current = window.setInterval(() => {
      onPlayNote(note);
    }, 50);
  };

  const handleMouseDown = (note: Note) => {
    isMouseDownRef.current = true;
    startNoteRepeat(note);
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    stopNoteRepeat();
  };

  const handleMouseEnter = (note: Note) => {
    if (isMouseDownRef.current) {
      startNoteRepeat(note);
    }
  };


  // Reverse notes so high notes are at the top (shorter strings) and low notes are at the bottom (longer strings)
  const displayedNotes = [...SANTOOR_NOTES].reverse();

  const stringCount = displayedNotes.length;
  const stringHeight = height / (stringCount + 1);

  // Define the trapezoid shape to match the image
  const indentX = width * 0.22; // Horizontal indent for the top corners
  const bodyPoints = `${indentX},0 ${width - indentX},0 ${width},${height} 0,${height}`;
  
  const padding = 12;
  // A simple approximation for the inner border that looks visually correct
  const innerBodyPoints = `${indentX + padding * 0.7},${padding} ${width - indentX - padding * 0.7},${padding} ${width - padding},${height - padding} ${padding},${height - padding}`;
  
  const bridgeX1 = width * 0.35;
  const bridgeX2 = width * 0.65;
  
  const renderDecoration = (points: string) => (
    <polygon points={points} className="fill-current text-gray-400/70" />
  );

  return (
    <div className="w-full max-w-4xl aspect-[2/1] bg-gray-900 rounded-lg p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {/* Santoor Body */}
        <polygon
          points={bodyPoints}
          className="fill-current text-amber-900/50"
        />
        <polygon
          points={innerBodyPoints}
          className="fill-current text-yellow-900 stroke-amber-600 stroke-2"
        />

        {/* Decorative elements */}
        <g>
          {/* Top-left corner */}
          {renderDecoration(`${indentX},0 ${indentX + 60},0 ${indentX + 20},40`)}
          {/* Top-right corner */}
          {renderDecoration(`${width - indentX},0 ${width - indentX - 60},0 ${width - indentX - 20},40`)}
          {/* Bottom-left corner */}
          {renderDecoration(`0,${height} 60,${height} 20,${height - 40}`)}
          {/* Bottom-right corner */}
          {renderDecoration(`${width},${height} ${width - 60},${height} ${width - 20},${height - 40}`)}
          {/* Center diamond */}
          <polygon 
            points={`${width/2},${height/2 - 30} ${width/2 + 30},${height/2} ${width/2},${height/2 + 30} ${width/2 - 30},${height/2}`}
            className="fill-current text-gray-400/70"
          />
        </g>
        
        {/* Bridges */}
        <g>
          {displayedNotes.map((_, index) => {
            const y = (index + 1) * stringHeight;
            const bridgeKey = `bridge-${index}`;
            return (
              <g key={bridgeKey}>
                <circle cx={bridgeX1} cy={y} r="9" className="fill-current text-amber-800/90" />
                <circle cx={bridgeX2} cy={y} r="9" className="fill-current text-amber-800/90" />
                 {/* Bridge tops */}
                <rect x={bridgeX1 - 5} y={y - 1.5} width="10" height="3" className="fill-current text-gray-300" />
                <rect x={bridgeX2 - 5} y={y - 1.5} width="10" height="3" className="fill-current text-gray-300" />
              </g>
            )
          })}
        </g>
        
        {/* Strings */}
        {displayedNotes.map((note, index) => {
          const y = (index + 1) * stringHeight;
          const isActive = activeNotes.has(note);

          const progress = y / height;
          // Interpolate the x-coordinates based on the y position to fit the trapezoid
          const startX = indentX * (1 - progress);
          const endX = width - (indentX * (1 - progress));

          const stringPadding = padding + 10;
          const stringStartX = startX + stringPadding;
          const stringEndX = endX - stringPadding;
          
          return (
            <g
              key={note}
              onMouseDown={() => handleMouseDown(note)}
              onMouseEnter={() => handleMouseEnter(note)}
              className="cursor-pointer group"
              role="button"
              aria-label={`Play note ${note}`}
            >
              <rect
                x={startX}
                y={y - stringHeight / 2}
                width={endX - startX}
                height={stringHeight}
                className="fill-transparent"
              />
              <line
                x1={stringStartX}
                y1={y}
                x2={stringEndX}
                y2={y}
                className={`transition-all duration-75 ease-in-out ${
                  isActive
                    ? 'stroke-cyan-300 stroke-[3]'
                    : 'stroke-gray-400 group-hover:stroke-white stroke-2'
                }`}
              />
               <text x={endX - 15} y={y + 4} className="fill-gray-400 text-xs font-mono" textAnchor="end" aria-hidden="true">{note}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
