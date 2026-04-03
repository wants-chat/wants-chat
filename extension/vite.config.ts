import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Extension's own source - MUST come after frontend aliases to avoid conflicts
      '@tools': path.resolve(__dirname, '../frontend/src/components/tools'),
      '@hooks': path.resolve(__dirname, '../frontend/src/hooks'),
      '@services': path.resolve(__dirname, '../frontend/src/services'),
      '@lib': path.resolve(__dirname, '../frontend/src/lib'),
      '@frontend': path.resolve(__dirname, '../frontend/src'),

      // Map @/components to frontend's components (for tool dependencies)
      '@/components': path.resolve(__dirname, '../frontend/src/components'),
      '@/hooks': path.resolve(__dirname, '../frontend/src/hooks'),
      '@/lib': path.resolve(__dirname, '../frontend/src/lib'),
      '@/services': path.resolve(__dirname, '../frontend/src/services'),
      '@/utils': path.resolve(__dirname, '../frontend/src/utils'),
      '@/types': path.resolve(__dirname, '../frontend/src/types'),
      '@/config': path.resolve(__dirname, '../frontend/src/config'),
      '@/data': path.resolve(__dirname, '../frontend/src/data'),
      '@/assets': path.resolve(__dirname, '../frontend/src/assets'),

      // Override frontend's contexts with extension's contexts
      '@/contexts/ThemeContext': path.resolve(__dirname, './src/contexts/ThemeContext.tsx'),
      '../../contexts/ThemeContext': path.resolve(__dirname, './src/contexts/ThemeContext.tsx'),
      '../contexts/ThemeContext': path.resolve(__dirname, './src/contexts/ThemeContext.tsx'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@contexts': path.resolve(__dirname, './src/contexts'),

      // Extension's own source (fallback for anything not matched above)
      '@': path.resolve(__dirname, '../frontend/src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize for extension size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging initially
      },
    },
    // Increase chunk size warning limit for extension
    chunkSizeWarningLimit: 1000,
  },
  // Dev server for testing
  server: {
    port: 5174,
    open: true,
  },
  // Define globals for Chrome extension
  define: {
    'process.env': {},
  },
});
