
import React, { useState, useCallback, useEffect } from 'react';
import { AppStage, WordItem, QuizSettings, QuizResult, Notebook, MasteryData } from './types';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import QuizSettingsForm from './components/QuizSettingsForm';
import QuizEngine from './components/QuizEngine';
import ResultView from './components/ResultView';

const STORAGE_KEY = 'voca_master_notebooks';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.UPLOAD);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  
  const [quizList, setQuizList] = useState<WordItem[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [settings, setSettings] = useState<QuizSettings>({
    rangeStart: 1,
    rangeEnd: 100,
    questionCount: 10,
    order: 'random'
  });

  // Load all notebooks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotebooks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notebooks", e);
      }
    }
  }, []);

  const saveNotebooks = (updated: Notebook[]) => {
    setNotebooks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDataLoaded = useCallback((data: WordItem[]) => {
    const newNotebook: Notebook = {
      id: crypto.randomUUID(),
      name: `新しい単語帳 ${notebooks.length + 1}`,
      words: data,
      mastery: {},
      createdAt: Date.now()
    };
    const updated = [newNotebook, ...notebooks];
    saveNotebooks(updated);
    setActiveNotebookId(newNotebook.id);
    setStage(AppStage.SETTINGS);
  }, [notebooks]);

  const handleUpdateName = useCallback((id: string, newName: string) => {
    const updated = notebooks.map(nb => nb.id === id ? { ...nb, name: newName } : nb);
    saveNotebooks(updated);
  }, [notebooks]);

  const handleSelectNotebook = useCallback((id: string) => {
    setActiveNotebookId(id);
    setStage(AppStage.SETTINGS);
  }, []);

  const handleDeleteNotebook = useCallback((id: string) => {
    if (window.confirm("この単語帳とすべての学習記録を削除しますか？")) {
      const updated = notebooks.filter(nb => nb.id !== id);
      saveNotebooks(updated);
    }
  }, [notebooks]);

  const handleStartQuiz = useCallback((newSettings: QuizSettings) => {
    const active = notebooks.find(nb => nb.id === activeNotebookId);
    if (!active) return;

    setSettings(newSettings);
    let filtered = active.words.filter(w => w.no >= newSettings.rangeStart && w.no <= newSettings.rangeEnd);
    let selection: WordItem[] = [];
    
    if (newSettings.order === 'random') {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      selection = shuffled.slice(0, Math.min(newSettings.questionCount, shuffled.length));
    } else {
      const sorted = [...filtered].sort((a, b) => a.no - b.no);
      selection = sorted.slice(0, Math.min(newSettings.questionCount, sorted.length));
    }
    
    setQuizList(selection);
    setResults([]);
    setStage(AppStage.QUIZ);
  }, [notebooks, activeNotebookId]);

  const handleDirectRestart = useCallback(() => {
    // 同じ単語カードをもう一度練習（現在のquizListをそのまま使う）
    setResults([]);
    setStage(AppStage.QUIZ);
  }, []);

  const handleReviewMissed = useCallback(() => {
    const missed = results.filter(r => !r.isCorrect).map(r => r.word);
    if (missed.length > 0) {
      setQuizList(missed.sort(() => Math.random() - 0.5));
      setResults([]);
      setStage(AppStage.QUIZ);
    }
  }, [results]);

  const handleQuizComplete = useCallback((quizResults: QuizResult[]) => {
    setResults(quizResults);
    
    // Update Mastery Data for the active notebook
    const updatedNotebooks = notebooks.map(nb => {
      if (nb.id !== activeNotebookId) return nb;

      const newMastery = { ...nb.mastery };
      quizResults.forEach(res => {
        const wordNo = res.word.no;
        if (!newMastery[wordNo]) {
          newMastery[wordNo] = { correct: 0, total: 0 };
        }
        newMastery[wordNo].total += 1;
        if (res.isCorrect) {
          newMastery[wordNo].correct += 1;
        }
      });
      return { ...nb, mastery: newMastery };
    });
    
    saveNotebooks(updatedNotebooks);
    setStage(AppStage.RESULT);
  }, [notebooks, activeNotebookId]);

  const handleBackToStart = useCallback(() => {
    setStage(AppStage.UPLOAD);
    setActiveNotebookId(null);
  }, []);

  const activeNotebook = notebooks.find(nb => nb.id === activeNotebookId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {stage === AppStage.UPLOAD && (
          <FileUploader 
            notebooks={notebooks}
            onDataLoaded={handleDataLoaded} 
            onUpdateName={handleUpdateName}
            onSelectNotebook={handleSelectNotebook}
            onDeleteNotebook={handleDeleteNotebook}
          />
        )}
        
        {stage === AppStage.SETTINGS && activeNotebook && (
          <QuizSettingsForm 
            maxRange={activeNotebook.words.length} 
            maxNo={activeNotebook.words.length > 0 ? Math.max(...activeNotebook.words.map(w => w.no)) : 0}
            onStart={handleStartQuiz} 
            onBack={handleBackToStart}
          />
        )}

        {stage === AppStage.QUIZ && (
          <QuizEngine 
            words={quizList} 
            onComplete={handleQuizComplete} 
            onCancel={() => setStage(AppStage.SETTINGS)}
          />
        )}

        {stage === AppStage.RESULT && (
          <ResultView 
            results={results} 
            onRestart={handleDirectRestart} 
            onReviewMissed={handleReviewMissed}
            onBackToHome={handleBackToStart}
            onGoToSettings={() => setStage(AppStage.SETTINGS)}
          />
        )}
      </main>
      <footer className="py-6 text-center text-slate-500 text-sm border-t border-slate-200">
        &copy; 2024 Smart Vocab Master. Efficiency is the key to mastery.
      </footer>
    </div>
  );
};

export default App;
