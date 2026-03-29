import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<any, any> {
  public state = {
    hasError: false,
    error: null as Error | null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-6 text-center">
          <div className="glass-card p-12 rounded-[3rem] max-w-lg">
            <h1 className="text-4xl font-serif font-black text-red-600 mb-4 uppercase tracking-tighter">Something went wrong</h1>
            <p className="text-zinc-600 mb-8 font-serif italic">The application encountered an unexpected error. Please try refreshing the page.</p>
            <pre className="bg-zinc-100 p-4 rounded-xl text-xs text-left overflow-auto max-h-40 mb-8 text-zinc-500 font-mono">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="bg-editorial-ink text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
