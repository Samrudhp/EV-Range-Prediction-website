'use client';
import { Component } from 'react';
import Link from 'next/link';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error: error 
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Handle different types of errors
    if (error?.isAxiosError) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Network error occurred';
      
      // Handle authentication errors
      if (status === 401 || status === 403) {
        window.location.href = '/login';
        return;
      }

      this.setState({ 
        error: new Error(errorMessage) 
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md max-w-lg w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                         transition-colors duration-200"
              >
                Try again
              </button>
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded 
                         hover:bg-gray-50 transition-colors duration-200"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;