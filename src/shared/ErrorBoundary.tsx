import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex h-screen items-center justify-center">
          <Card className="m-4 p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground mb-4">We're sorry, but something unexpected happened. Please try again.</p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 w-full text-left">
                  <summary className="mb-2 cursor-pointer text-sm font-semibold">Error Details (Development Only)</summary>
                  <div className="max-h-64 overflow-auto rounded bg-gray-100 p-4 text-xs">
                    <p className="mb-2 font-mono text-red-600">{this.state.error.toString()}</p>
                    {this.state.errorInfo && <pre className="whitespace-pre-wrap text-gray-700">{this.state.errorInfo.componentStack}</pre>}
                  </div>
                </details>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset}>Try Again</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
