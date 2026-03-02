/**
 * LLM Attention Visualization
 * Copyright (C) 2026 jnl.ootsidebox@gmail.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react';

interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  type: 'fixed' | 'choice' | 'result';
  semantic?: 'positive' | 'negative';
  order?: number;
}

const AttentionVisualization = () => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finalWord, setFinalWord] = useState('');
  const [animateTrajectory, setAnimateTrajectory] = useState(false);

  const words: Word[] = [
    { id: 'il', text: 'il', x: 200, y: 240, color: '#8B5CF6', type: 'fixed', order: 1 },
    { id: 'fait', text: 'fait', x: 380, y: 320, color: '#8B5CF6', type: 'fixed', order: 2 },
    { id: 'beau', text: 'beau', x: 580, y: 150, color: '#F59E0B', type: 'choice', semantic: 'positive', order: 3 },
    { id: 'mauvais', text: 'mauvais', x: 580, y: 430, color: '#F59E0B', type: 'choice', semantic: 'negative', order: 3 },
    { id: 'le', text: 'le', x: 780, y: 280, color: '#8B5CF6', type: 'fixed', order: 4 },
    { id: 'ciel', text: 'ciel', x: 920, y: 240, color: '#EC4899', type: 'fixed', order: 5 },
    { id: 'est', text: 'est', x: 1080, y: 320, color: '#8B5CF6', type: 'fixed', order: 6 },
    { id: 'bleu', text: 'bleu', x: 1280, y: 120, color: '#10B981', type: 'result', semantic: 'positive' },
    { id: 'gris', text: 'gris', x: 1280, y: 470, color: '#10B981', type: 'result', semantic: 'negative' }
  ];

  const handleWordClick = (word: Word) => {
    if (word.type === 'choice') {
      setSelectedWord(word);
      setAnimateTrajectory(true);
      
      setTimeout(() => {
        if (word.semantic === 'positive') {
          setFinalWord('bleu');
        } else {
          setFinalWord('gris');
        }
        setShowResult(true);
      }, 1000);
    }
  };

  const getDottedPaths = () => {
    if (!selectedWord || !showResult) return [];
    
    const paths = [];
    const estWord = words.find(w => w.id === 'est');
    const finalWordData = words.find(w => w.text === finalWord);
    
    if (estWord && finalWordData) {
      const dx = finalWordData.x - estWord.x;
      const dy = finalWordData.y - estWord.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / distance;
      const unitY = dy / distance;
      
      const startX = estWord.x + unitX * 50;
      const startY = estWord.y + unitY * 50;
      const endX = finalWordData.x - unitX * 60;
      const endY = finalWordData.y - unitY * 60;
      
      const midX = (startX + endX) / 2;
      const midY = Math.min(startY, endY) - 40;
      
      paths.push({
        path: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
        color: '#60A5FA',
        strokeWidth: 4
      });
    }
    
    if (finalWordData && selectedWord.semantic === finalWordData.semantic) {
      const dx = finalWordData.x - selectedWord.x;
      const dy = finalWordData.y - selectedWord.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / distance;
      const unitY = dy / distance;
      
      const startX = selectedWord.x + unitX * 50;
      const startY = selectedWord.y + unitY * 50;
      const endX = finalWordData.x - unitX * 60;
      const endY = finalWordData.y - unitY * 60;
      
      paths.push({
        path: `M ${startX} ${startY} L ${endX} ${endY}`,
        color: '#F472B6',
        strokeWidth: 3
      });
    }
    
    return paths;
  };

  const getGeneratedText = () => {
    if (!selectedWord) return 'il fait ?, le ciel est ?';
    if (!finalWord) return `il fait ${selectedWord.text}, le ciel est ?`;
    return `il fait ${selectedWord.text}, le ciel est ${finalWord}`;
  };

  const getProbabilities = () => {
    if (!selectedWord) return '';
    
    const probBleu = selectedWord.semantic === 'positive' ? '100%' : '0%';
    const probGris = selectedWord.semantic === 'positive' ? '0%' : '100%';
    
    return `bleu: ${probBleu} | gris: ${probGris}`;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 1500 600">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
            
            <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <polygon points="0,0 0,6 6,3" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="0.5" />
            </marker>
            
            <marker id="arrowPink" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <polygon points="0,0 0,6 6,3" fill="#F472B6" stroke="#FFFFFF" strokeWidth="0.5" />
            </marker>
            
            <marker id="arrowBlueDotted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <polygon points="0,0 0,6 6,3" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="0.5" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {selectedWord && (() => {
            const mainSequence = [
              words.find(w => w.id === 'il'),
              words.find(w => w.id === 'fait'),
              selectedWord,
              words.find(w => w.id === 'le'),
              words.find(w => w.id === 'ciel'),
              words.find(w => w.id === 'est')
            ].filter(Boolean) as Word[];
            
            return mainSequence.slice(0, -1).map((word, index) => {
              const nextWord = mainSequence[index + 1];
              
              const dx = nextWord.x - word.x;
              const dy = nextWord.y - word.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const unitX = dx / distance;
              const unitY = dy / distance;
              
              const startX = word.x + unitX * 50;
              const startY = word.y + unitY * 50;
              const endX = nextWord.x - unitX * 50;
              const endY = nextWord.y - unitY * 50;
              
              const midX = (startX + endX) / 2;
              const midY = Math.min(startY, endY) - 30;
              
              return (
                <path
                  key={`segment-${index}`}
                  d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                  stroke="#60A5FA"
                  strokeWidth="5"
                  fill="none"
                  markerEnd="url(#arrowBlue)"
                  className={animateTrajectory ? 'animate-pulse' : ''}
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.7))'
                  }}
                />
              );
            });
          })()}
          
          {getDottedPaths().map((pathData, index) => (
            <path
              key={index}
              d={pathData.path}
              stroke={pathData.color}
              strokeWidth={pathData.strokeWidth}
              fill="none"
              strokeDasharray="10,8"
              markerEnd={pathData.color === '#60A5FA' ? 'url(#arrowBlueDotted)' : 'url(#arrowPink)'}
              className="animate-pulse"
              style={{
                filter: `drop-shadow(0 0 8px ${pathData.color}60)`
              }}
            />
          ))}
          
          {words.map((word, index) => {
            const isSelected = selectedWord && selectedWord.id === word.id;
            const isVisible = word.type !== 'result' || (word.type === 'result' && (!finalWord || word.text === finalWord));
            const isResult = word.type === 'result' && word.text === finalWord;
            const isOtherResult = word.type === 'result' && finalWord && word.text !== finalWord;
            
            return (
              <g 
                key={index} 
                transform={`translate(${word.x}, ${word.y})`}
                style={{ opacity: isOtherResult ? 0.3 : 1 }}
              >
                <g 
                  className={`${word.type === 'choice' ? 'cursor-pointer hover:scale-110' : ''} transition-transform duration-300`}
                  onClick={() => handleWordClick(word)}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isResult ? "60" : "50"}
                    fill={word.color}
                    stroke={isSelected || isResult ? '#FFFFFF' : 'transparent'}
                    strokeWidth="3"
                    style={{
                      filter: isSelected || isResult ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))' : 'none',
                      opacity: isVisible ? 1 : 0.3
                    }}
                  />
                  <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    className={`fill-white font-bold text-xl select-none`}
                    style={{ opacity: isVisible ? 1 : 0.3 }}
                  >
                    {word.text}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl px-8 py-4 border border-slate-600 shadow-2xl">
            <p className="text-2xl text-white font-medium">
              {getGeneratedText()}
            </p>
          </div>
        </div>
        
        {selectedWord && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-6 py-3 border border-slate-600">
              <p className="text-sm text-slate-300 text-center">
                Probabilités: {getProbabilities()}
              </p>
            </div>
          </div>
        )}
        
        {!selectedWord && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-slate-600">
              <p className="text-sm text-slate-300 text-center">
                Cliquez sur "beau" ou "mauvais" pour voir la trajectoire dans l'espace sémantique
              </p>
            </div>
          </div>
        )}
        
        {selectedWord && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-slate-600">
              <p className="text-sm text-slate-300 text-center">
                Cliquez sur l'autre mot pour changer la trajectoire
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttentionVisualization;

