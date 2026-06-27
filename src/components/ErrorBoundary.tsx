import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our unified Logger service
    logger.error('React Crash Exception Captured by ErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" id="error-boundary-screen">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col items-center">
            {/* Error Graphic Icon */}
            <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
              Une erreur inattendue est survenue
            </h1>
            
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              L'application a rencontré un problème d'affichage. L'erreur a été enregistrée en toute sécurité dans nos services de diagnostic et de supervision.
            </p>

            {this.state.error && (
              <div className="w-full bg-gray-50 rounded-xl p-3 text-left font-mono text-[11px] text-gray-600 border border-gray-100 overflow-x-auto max-h-32 mb-6">
                <span className="font-bold text-red-600">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row w-full gap-2.5">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-md shadow-blue-100"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Recharger la page</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-100 font-bold text-xs py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <Home className="h-4 w-4" />
                <span>Retour à l'accueil</span>
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
