import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error in React component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Application View Recovered</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              A temporary interface issue occurred. The trading session and wallet state remain completely secure.
            </p>
            {this.state.error && (
              <div className="bg-[#0A0E1A] p-3 rounded-xl border border-[#1E293B] text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-bold bg-[#131D31] hover:bg-[#1E293B] text-gray-300 rounded-xl transition-all"
              >
                Try View Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all shadow-glow-emerald flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
