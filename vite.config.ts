import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 環境変数を読み込む
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // 重要：GitHub Pages 用のベースパス設定
      // 先頭と末尾にスラッシュが必要です
      base: '/Smart-Vocab-Master/', 

      plugins: [react()],
      
      define: {
        // APIキーの設定。Viteではこの形式が安定します
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      
      resolve: {
        alias: {
          // '@' をプロジェクトルートに設定
          '@': path.resolve(__dirname, './'),
        }
      },

      build: {
        // ビルド後のファイル出力先を確認
        outDir: 'dist',
      }
    };
});
