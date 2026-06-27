import * as Sentry from '@sentry/react';

// Sentry DSN can be configured in production via environment variables.
const SENTRY_DSN = (import.meta as any).env?.VITE_SENTRY_DSN || '';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  console.log('[Logger] Sentry initialized successfully.');
} else {
  console.log('[Logger] Sentry DSN not found, running in standard logging mode.');
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogPayload {
  level: LogLevel;
  message: string;
  error?: unknown;
  context?: Record<string, any>;
}

class Logger {
  private isProduction = !!(import.meta as any).env?.PROD;

  /**
   * Log an informational message.
   */
  info(message: string, context?: Record<string, any>) {
    this.log({ level: 'info', message, context });
  }

  /**
   * Log a warning message.
   */
  warn(message: string, context?: Record<string, any>) {
    this.log({ level: 'warn', message, context });
  }

  /**
   * Log an error along with stack traces and relevant context.
   */
  error(message: string, error?: unknown, context?: Record<string, any>) {
    this.log({ level: 'error', message, error, context });
  }

  /**
   * Internal logging function that handles console formatting, Sentry integration,
   * and forwarding logs to the secure backend API.
   */
  private async log(payload: LogPayload) {
    const { level, message, error, context } = payload;
    const timestamp = new Date().toISOString();

    // 1. Local Developer Console Formatting
    if (!this.isProduction || level === 'error') {
      const colorMap = {
        info: 'color: #3b82f6; font-weight: bold;',
        warn: 'color: #f59e0b; font-weight: bold;',
        error: 'color: #ef4444; font-weight: bold;',
      };

      console.groupCollapsed(
        `%c[${level.toUpperCase()}] %c${message} (${new Date().toLocaleTimeString()})`,
        colorMap[level],
        'font-weight: normal; color: inherit;'
      );
      
      if (context) {
        console.log('Context:', context);
      }
      if (error) {
        console.error('Error Object:', error);
      }
      console.groupEnd();
    }

    // 2. Sentry Integration
    if (SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setExtras(context);
        }
        if (level === 'error') {
          Sentry.captureException(error || new Error(message));
        } else {
          Sentry.captureMessage(message, level === 'warn' ? 'warning' : 'info');
        }
      });
    }

    // 3. Secure Backend Persistent Logging (always send errors in production, or all logs if configured)
    if (this.isProduction || level === 'error') {
      try {
        const errorDetails = error instanceof Error 
          ? { name: error.name, message: error.message, stack: error.stack }
          : typeof error === 'object' && error !== null
            ? JSON.parse(JSON.stringify(error))
            : String(error);

        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level,
            message,
            timestamp,
            error: error ? errorDetails : undefined,
            context: {
              ...context,
              userAgent: navigator.userAgent,
              url: window.location.href,
            },
          }),
        });
      } catch (err) {
        // Fallback if backend logging fails (avoid infinite loop)
        console.warn('[Logger] Failed to dispatch log payload to backend API:', err);
      }
    }
  }
}

export const logger = new Logger();
