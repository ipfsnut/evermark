// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '../../utils/error-logger';

// Define the props with a more specific type
interface Props {
  component: string;
  children: ReactNode;
  // Make it clear these are separate types of fallbacks
  reactNodeFallback?: ReactNode;
  functionFallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    errorLogger.log(this.props.component, error, {
      componentStack: errorInfo.componentStack,
      props: { ...this.props, children: '[React Element]' }
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // First check for function fallback
      if (this.props.functionFallback && this.state.error) {
        return this.props.functionFallback(this.state.error);
      }
      
      // Then check for React node fallback
      if (this.props.reactNodeFallback) {
        return this.props.reactNodeFallback;
      }
      
      // Default fallback
      return (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '0.25rem',
          marginBottom: '1rem'
        }}>
          <h3>Something went wrong</h3>
          <p>The component couldn't be loaded properly. Please try again later.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              backgroundColor: '#721c24',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  fallback?: ReactNode | ((error: Error) => ReactNode)
) {
  // This is where we separate the fallback types
  return function WithErrorBoundary(props: P) {
    // Determine which type of fallback we have
    const isFunctionFallback = typeof fallback === 'function';
    
    return (
      <ErrorBoundary 
        component={componentName} 
        functionFallback={isFunctionFallback ? fallback as (error: Error) => ReactNode : undefined}
        reactNodeFallback={!isFunctionFallback ? fallback as ReactNode : undefined}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
