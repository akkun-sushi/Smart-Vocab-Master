
import React, { useState } from 'react';
import { Play, ChevronLeft, Settings2, Maximize2, LayoutGrid, Shuffle, ListOrdered } from 'lucide-react';
import { QuizSettings } from '../types';

interface QuizSettingsFormProps {
  maxRange: number;
  maxNo: number;
  onStart: (settings: QuizSettings) => void;
  onBack: () => void;
}

const QuizSettingsForm: React.FC<QuizSettingsFormProps> = ({ maxRange, maxNo, onStart, onBack }) => {
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('');
  const [order, setOrder] = useState<'sequential' | 'random'>('random');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(rangeStart) || 1;
    const end = parseInt(rangeEnd) || maxNo;
    const count = parseInt(questionCount) || 10;

    onStart({
      rangeStart: start,
      rangeEnd: end,
      questionCount: count,
      order: order
    });
  };

  const quickCounts = [10, 30, 50, 100];

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings2 className="w-6 h-6" />
            <h2 className="text-xl font-bold">学習プランを設定</h2>
          </div>
          <button 
            onClick={onBack}
            className="text-indigo-100 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg"
          >
            <LayoutGrid className="w-4 h-4" />
            データ管理に戻る
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Range Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="block text-sm font-bold text-slate-700">出題範囲 (No.)</label>
              <button 
                type="button"
                onClick={() => { setRangeStart('1'); setRangeEnd(maxNo.toString()); }}
                className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                全範囲を選択
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-xs text-slate-400">開始 No.</span>
                <input
                  type="number"
                  placeholder="1"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                />
              </div>
              <div className="pt-6 text-slate-400 font-bold text-xl">〜</div>
              <div className="flex-1 space-y-1">
                <span className="text-xs text-slate-400">終了 No.</span>
                <input
                  type="number"
                  placeholder={maxNo.toString()}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-right font-medium">※ 最大番号: {maxNo} / 登録数: {maxRange}</p>
          </div>

          {/* Question Order */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">出題順序</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrder('sequential')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2 ${
                  order === 'sequential'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <ListOrdered className="w-5 h-5" />
                番号順
              </button>
              <button
                type="button"
                onClick={() => setOrder('random')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2 ${
                  order === 'random'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Shuffle className="w-5 h-5" />
                ランダム
              </button>
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">出題数</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickCounts.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count.toString())}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    questionCount === count.toString()
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1"
          >
            <Play className="w-6 h-6 fill-current" />
            <span className="text-lg">クイズを開始する</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizSettingsForm;
