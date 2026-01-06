
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, Sparkles, BrainCircuit, Lightbulb, ChevronRight, RotateCcw, Quote } from 'lucide-react';
import { WordItem, QuizResult } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface AiHint {
  exampleSentence: string;
  translation: string;
  tips: string;
}

interface QuizEngineProps {
  words: WordItem[];
  onComplete: (results: QuizResult[]) => void;
  onCancel: () => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ words, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [aiHint, setAiHint] = useState<AiHint | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const currentWord = words[currentIndex];

  const handleAnswer = (isCorrect: boolean) => {
    const newResult: QuizResult = {
      word: currentWord,
      isCorrect
    };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
      setAiHint(null);
    } else {
      onComplete(updatedResults);
    }
  };

  const getAiHint = async () => {
    if (isAiLoading || !currentWord) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `英単語「${currentWord.word}」（意味：${currentWord.meaning}）について、実用的な英語例文、その日本語訳、そして覚え方のコツを教えてください。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              exampleSentence: { type: Type.STRING, description: "A practical English sentence using the word." },
              translation: { type: Type.STRING, description: "Japanese translation of the example sentence." },
              tips: { type: Type.STRING, description: "Tips or mnemonic to remember the word." }
            },
            required: ["exampleSentence", "translation", "tips"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}') as AiHint;
      setAiHint(result);
    } catch (err) {
      console.error(err);
      setAiHint({
        exampleSentence: "AIへの接続に失敗しました。",
        translation: "通信環境を確認してください。",
        tips: "時間を置いて再度お試しください。"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-slate-500">
          <span>進行状況</span>
          <span>{currentIndex + 1} / {words.length}</span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="relative min-h-[400px]">
        <div className={`w-full h-full min-h-[400px] bg-white rounded-3xl shadow-xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center transition-all duration-500 relative ${showMeaning ? 'border-indigo-200' : ''}`}>
          {/* Badge Left */}
          <div className="absolute top-6 left-8 flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <BrainCircuit className="w-3 h-3" />
            No. {currentWord.no}
          </div>

          <div className="flex flex-col items-center gap-4 mb-10 mt-4">
            <h3 className="text-6xl font-black text-slate-900 tracking-tight">
              {currentWord.word}
            </h3>
          </div>

          {!showMeaning ? (
            <button
              onClick={() => setShowMeaning(true)}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
            >
              意味を表示
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-300 w-full">
              <div className="py-6 border-y border-slate-100">
                <p className="text-4xl font-black text-indigo-600 tracking-tight">{currentWord.meaning}</p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-red-50 text-red-600 border border-red-100 px-6 py-5 rounded-2xl font-bold hover:bg-red-100 transition-all flex flex-col items-center gap-1 group"
                >
                  <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>間違えた</span>
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-50 text-green-600 border border-green-100 px-6 py-5 rounded-2xl font-bold hover:bg-green-100 transition-all flex flex-col items-center gap-1 group"
                >
                  <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>分かった！</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Tool & Footer Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <button
            onClick={getAiHint}
            disabled={isAiLoading}
            className={`w-full h-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
              aiHint ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-transparent'
            } disabled:opacity-50`}
          >
            {isAiLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Lightbulb className="w-5 h-5" />
            )}
            AI学習アドバイス
          </button>
        </div>
        <div className="col-span-1">
          <button
            onClick={onCancel}
            className="w-full h-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border-2 border-slate-200"
          >
            <RotateCcw className="w-5 h-5" />
            中断する
          </button>
        </div>

        {aiHint && (
          <div className="col-span-2 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-3xl p-8 shadow-md animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
            <Quote className="absolute -top-4 -right-4 w-24 h-24 text-amber-100 -rotate-12 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-6">
              <div className="flex items-center gap-2 text-amber-700 font-black text-sm uppercase tracking-widest">
                <Sparkles className="w-5 h-5" />
                AI Learning Advice
              </div>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="text-xs font-black text-amber-600 uppercase tracking-tighter">Practical Example</div>
                <p className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-tight italic">
                  "{aiHint.exampleSentence}"
                </p>
                <p className="text-lg md:text-xl font-bold text-slate-600 border-l-4 border-amber-300 pl-4 py-1">
                  {aiHint.translation}
                </p>
              </div>

              <div className="bg-white/60 rounded-2xl p-5 border border-amber-100 shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm">覚え方のコツ</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {aiHint.tips}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizEngine;
