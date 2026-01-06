
import React from 'react';
import { Trophy, ArrowLeft, RefreshCw, CheckCircle2, XCircle, List, Brain, Settings } from 'lucide-react';
import { QuizResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultViewProps {
  results: QuizResult[];
  onRestart: () => void;
  onReviewMissed: () => void;
  onBackToHome: () => void;
  onGoToSettings: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ 
  results, 
  onRestart, 
  onReviewMissed, 
  onBackToHome, 
  onGoToSettings
}) => {
  const correctCount = results.filter(r => r.isCorrect).length;
  const totalCount = results.length;
  const missedCount = totalCount - correctCount;
  const accuracy = Math.round((correctCount / totalCount) * 100);

  const chartData = [
    { name: '正解', value: correctCount, color: '#10b981' },
    { name: '不正解', value: missedCount, color: '#ef4444' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6 border border-slate-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-2">
          <Trophy className="w-10 h-10 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">結果発表</h2>
          <p className="text-slate-500">お疲れ様でした！今回のスコアを確認しましょう。</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center py-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-sm text-slate-500 block">今回の正解率</span>
              <span className="text-4xl font-black text-indigo-600">{accuracy}%</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 p-4 rounded-2xl border border-green-100">
                <span className="text-xs text-green-600 font-bold block uppercase tracking-wider">正解</span>
                <span className="text-2xl font-bold text-green-700">{correctCount}</span>
              </div>
              <div className="flex-1 bg-red-50 p-4 rounded-2xl border border-red-100">
                <span className="text-xs text-red-600 font-bold block uppercase tracking-wider">不正解</span>
                <span className="text-2xl font-bold text-red-700">{missedCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
          {missedCount > 0 && (
            <button
              onClick={onReviewMissed}
              className="sm:col-span-2 bg-red-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 transform hover:-translate-y-1"
            >
              <Brain className="w-6 h-6" />
              <span className="text-lg">間違えた {missedCount} 問を復習する</span>
            </button>
          )}
          
          <button
            onClick={onRestart}
            className="bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md transform hover:-translate-y-1"
          >
            <RefreshCw className="w-5 h-5" />
            このまま再挑戦
          </button>

          <button
            onClick={onGoToSettings}
            className="bg-white text-indigo-600 border border-indigo-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <Settings className="w-5 h-5" />
            プランを変更
          </button>

          <button
            onClick={onBackToHome}
            className="sm:col-span-2 bg-slate-50 text-slate-600 border border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            ライブラリに戻る
          </button>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-2">
          <List className="w-5 h-5" />
          今回の解答履歴
        </h3>
        <div className="grid gap-3">
          {results.map((res, idx) => (
            <div 
              key={idx}
              className={`bg-white p-5 rounded-2xl border flex items-center justify-between shadow-sm hover:shadow-md transition-all ${res.isCorrect ? 'border-slate-100' : 'border-red-200 bg-red-50/30'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${res.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  {res.isCorrect ? (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-black text-xl text-slate-800 flex items-center gap-3">
                    {res.word.word}
                  </div>
                  <div className="text-slate-600 font-medium">{res.word.meaning}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-bold bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                No. {res.word.no}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultView;
