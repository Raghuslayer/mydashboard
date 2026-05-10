import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRotateRight } from '@fortawesome/free-solid-svg-icons';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#111827] to-[#1e293b] flex items-center justify-center p-4">
                    <div className="glass-panel p-8 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-600/20 flex items-center justify-center mx-auto mb-6 rounded-full">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500" />
                        </div>
                        
                        <h1 className="header-font text-3xl text-red-500 mb-2">
                            Something Went Wrong
                        </h1>
                        
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6 text-left max-h-40 overflow-y-auto">
                                <p className="text-xs text-red-400 font-mono break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
                        >
                            <FontAwesomeIcon icon={faRotateRight} />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
