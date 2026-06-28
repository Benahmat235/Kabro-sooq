import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';
import { AlertTriangle, RefreshCcw, Home, WifiOff, FileQuestion } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isOffline: !navigator.onLine,
  };

  private handleOnline = () => this.setState({ isOffline: false });
  private handleOffline = () => this.setState({ isOffline: true });

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, isOffline: !navigator.onLine };
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

      const isNetworkError = this.state.isOffline || this.state.error?.message.toLowerCase().includes('network') || this.state.error?.message.toLowerCase().includes('fetch');
      const isNotFoundError = this.state.error?.message.toLowerCase().includes('not found') || this.state.error?.message.toLowerCase().includes('introuvable');

      let title = "Une erreur inattendue est survenue";
      let message = "L'application a rencontré un problème. L'erreur a été enregistrée en toute sécurité.";
      let Icon = AlertTriangle;
      let iconColor = "text-red-600";
      let iconBg = "bg-red-50 border-red-100";

      if (isNetworkError) {
        title = "Pas de connexion internet";
        message = "Il semble que vous soyez hors ligne. Veuillez vérifier votre connexion internet et réessayer.";
        Icon = WifiOff;
        iconColor = "text-orange-600";
        iconBg = "bg-orange-50 border-orange-100";
      } else if (isNotFoundError) {
        title = "Contenu introuvable";
        message = "L'élément ou l'annonce que vous recherchez n'existe pas ou a été supprimé.";
        Icon = FileQuestion;
        iconColor = "text-primary-600";
        iconBg = "bg-primary-50 border-primary-100";
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" id="error-boundary-screen">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col items-center">
            {/* Error Graphic Icon */}
            <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center mb-6 ${iconBg} ${iconColor}`}>
              <Icon className="h-8 w-8" />
            </div>

            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
              {title}
            </h1>
            
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {message}
            </p>

            {this.state.error && !isNetworkError && !isNotFoundError && (
              <div className="w-full bg-gray-50 rounded-xl p-3 text-left font-mono text-[11px] text-gray-600 border border-gray-100 overflow-x-auto max-h-32 mb-6">
                <span className="font-bold text-red-600">Erreur:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row w-full gap-2.5">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-md shadow-primary-100"
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
