
import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Database, PlayCircle, Trash2, Edit3, Check, BookOpenCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WordItem, Notebook } from '../types';

interface FileUploaderProps {
  notebooks: Notebook[];
  onDataLoaded: (data: WordItem[]) => void;
  onUpdateName: (id: string, name: string) => void;
  onSelectNotebook: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  notebooks,
  onDataLoaded, 
  onUpdateName,
  onSelectNotebook, 
  onDeleteNotebook 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          setError("ファイルにデータが見つかりませんでした。");
          return;
        }

        const mappedData: WordItem[] = jsonData.map((row, index) => {
          const no = parseInt(row['No'] || row['番号'] || (index + 1).toString());
          const word = row['単語'] || row['Word'] || row['word'] || '';
          const meaning = row['意味'] || row['Meaning'] || row['meaning'] || '';
          return { no, word, meaning };
        }).filter(item => item.word && item.meaning);

        if (mappedData.length === 0) {
          setError("「単語」と「意味」の列が見つかりませんでした。ヘッダーを確認してください。");
          return;
        }

        onDataLoaded(mappedData);
      } catch (err) {
        console.error(err);
        setError("ファイルの読み込み中にエラーが発生しました。エクセル形式 (.xlsx, .xls) か確認してください。");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startEditing = (notebook: Notebook) => {
    setEditingId(notebook.id);
    setTempName(notebook.name);
  };

  const saveName = () => {
    if (editingId) {
      onUpdateName(editingId, tempName || 'マイ単語帳');
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">学習ライブラリ</h2>
        <p className="text-slate-500 text-lg">保存済みの単語帳を選択するか、新しいデータを追加します。</p>
      </div>

      {/* Notebook List */}
      <div className="space-y-6">
        {notebooks.map((nb) => {
          const wordNos = Object.keys(nb.mastery);
          const learnedCount = wordNos.filter(no => nb.mastery[Number(no)].total > 0).length;
          const masteredCount = wordNos.filter(no => nb.mastery[Number(no)].correct > 0).length;
          const totalAttempts = wordNos.reduce((sum, no) => sum + nb.mastery[Number(no)].total, 0);
          const masteryPercent = nb.words.length > 0 ? Math.round((masteredCount / nb.words.length) * 100) : 0;

          return (
            <div key={nb.id} className="bg-white rounded-3xl shadow-xl border border-indigo-100 overflow-hidden hover:shadow-indigo-100 transition-all">
              {/* Header */}
              <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-grow mr-4">
                  <Database className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  {editingId === nb.id ? (
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        autoFocus
                        onBlur={saveName}
                        onKeyDown={(e) => e.key === 'Enter' && saveName()}
                        className="flex-grow px-2 py-1 bg-white border border-indigo-300 rounded text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button onClick={saveName} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/name cursor-pointer" onClick={() => startEditing(nb)}>
                      <span className="text-indigo-700 font-black text-lg">{nb.name}</span>
                      <Edit3 className="w-4 h-4 text-indigo-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => onDeleteNotebook(nb.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  title="データを削除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Body */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">学習済み</p>
                    <p className="text-xl font-black text-slate-800">{learnedCount}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">マスター</p>
                    <p className="text-xl font-black text-slate-800">{masteredCount}</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">総学習回数</p>
                    <p className="text-xl font-black text-slate-800">{totalAttempts}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                    <div className="flex items-center gap-1">
                      <BookOpenCheck className="w-3.5 h-3.5 text-indigo-500" />
                      単語の定着度
                    </div>
                    <span className="text-indigo-600">{masteryPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${masteryPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onSelectNotebook(nb.id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-1"
                >
                  <PlayCircle className="w-6 h-6" />
                  学習を開始する
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            新しい単語帳を追加
          </span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-200 flex flex-col items-center justify-center space-y-4 cursor-pointer
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white shadow-sm hover:shadow-md'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls,.csv" className="hidden" />
          <div className="bg-indigo-100 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">Excelファイルをインポート</p>
            <p className="text-sm text-slate-400 mt-1">クリックまたはドラッグ＆ドロップ</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700 animate-in shake duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Format Help */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          推奨フォーマット (Excel / CSV)
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-200 pb-2">
          <div>No</div>
          <div>単語 (Word)</div>
          <div>意味 (Meaning)</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-slate-600">
          <div>1</div>
          <div className="font-medium">persist</div>
          <div>〜を貫く、持続する</div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
