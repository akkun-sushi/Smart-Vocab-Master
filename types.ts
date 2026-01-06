
export interface WordItem {
  no: number;
  word: string;
  meaning: string;
}

export interface QuizSettings {
  rangeStart: number;
  rangeEnd: number;
  questionCount: number;
  order: 'sequential' | 'random';
}

export enum AppStage {
  UPLOAD = 'UPLOAD',
  SETTINGS = 'SETTINGS',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT'
}

export interface QuizResult {
  word: WordItem;
  userAnswer?: string;
  isCorrect: boolean;
}

// 単語ごとの学習履歴
export interface WordMastery {
  correct: number;
  total: number;
}

// 保存される全実績データ
export interface MasteryData {
  [wordNo: number]: WordMastery;
}

// 単語帳単位のデータ構造
export interface Notebook {
  id: string;
  name: string;
  words: WordItem[];
  mastery: MasteryData;
  createdAt: number;
}
