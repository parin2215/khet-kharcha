import React from 'react';
import { Sprout, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Khet Kharcha ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] p-6 text-stone-800">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-stone-200 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-stone-900">
                કંઈક ખોટું થયું છે (Something went wrong)
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                The application encountered an unexpected issue. Your farm data is safe. Please refresh to continue.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page (ફરી લોડ કરો)
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard (હોમ પેજ)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

