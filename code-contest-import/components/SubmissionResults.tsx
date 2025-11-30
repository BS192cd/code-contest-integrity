import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

interface TestResult {
  testCaseIndex: number;
  status: 'passed' | 'failed' | 'tle' | 'mle' | 'runtime_error' | 'compile_error';
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  memoryUsage: number;
  points: number;
  errorMessage?: string;
}

interface SubmissionData {
  id: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compile_error' | 'system_error';
  score: number;
  executionTime: number;
  memoryUsage: number;
  passedTestCases: number;
  totalTestCases: number;
  testResults: TestResult[];
  createdAt: string;
  processingTime: number;
}

interface SubmissionResultsProps {
  submission: SubmissionData;
  showAllTestCases?: boolean;
  className?: string;
}

export default function SubmissionResults({ submission, showAllTestCases = false, className = '' }: SubmissionResultsProps) {
  const [expandedCases, setExpandedCases] = useState<Set<number>>(new Set());
  const [showHiddenCases, setShowHiddenCases] = useState(showAllTestCases);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'accepted':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'failed':
      case 'wrong_answer':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'tle':
      case 'time_limit_exceeded':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'mle':
      case 'memory_limit_exceeded':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'runtime_error':
      case 'compile_error':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'system_error':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'wrong_answer':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'tle':
      case 'time_limit_exceeded':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'mle':
      case 'memory_limit_exceeded':
      case 'runtime_error':
      case 'compile_error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'wrong_answer': return 'Wrong Answer';
      case 'time_limit_exceeded': return 'Time Limit Exceeded';
      case 'memory_limit_exceeded': return 'Memory Limit Exceeded';
      case 'runtime_error': return 'Runtime Error';
      case 'compile_error': return 'Compilation Error';
      case 'system_error': return 'System Error';
      case 'passed': return 'Passed';
      case 'failed': return 'Failed';
      case 'tle': return 'Time Limit Exceeded';
      case 'mle': return 'Memory Limit Exceeded';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const toggleTestCase = (index: number) => {
    setExpandedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (kb: number) => {
    if (kb < 1024) return `${kb}KB`;
    return `${(kb / 1024).toFixed(2)}MB`;
  };

  // Filter test cases based on visibility settings
  const visibleTestResults = showHiddenCases 
    ? submission.testResults 
    : submission.testResults.filter((_, index) => index < 2); // Show first 2 test cases by default

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Result */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Submission Results</h3>
            <div className="text-sm text-gray-500">
              Processed in {formatTime(submission.processingTime)}
            </div>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg border">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(submission.status)}
              </div>
              <div className={`text-lg font-bold ${getStatusColor(submission.status).split(' ')[0]}`}>
                {getStatusText(submission.status)}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{submission.score}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {submission.passedTestCases}/{submission.totalTestCases}
              </div>
              <div className="text-sm text-gray-600">Test Cases</div>
            </div>
            
            <div className="text-center p-4 rounded-lg border">
              <div className="text-lg font-bold text-gray-700">
                {formatTime(submission.executionTime)}
              </div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Test Cases Passed</span>
              <span>{submission.passedTestCases} of {submission.totalTestCases}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  submission.status === 'accepted' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(submission.passedTestCases / submission.totalTestCases) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Case Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Test Case Results</h4>
            
            {!showAllTestCases && submission.testResults.length > 2 && (
              <button
                onClick={() => setShowHiddenCases(!showHiddenCases)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                {showHiddenCases ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showHiddenCases ? 'Hide' : 'Show'} Hidden Cases ({submission.testResults.length - 2})
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {visibleTestResults.map((result, index) => {
              const isExpanded = expandedCases.has(index);
              const actualIndex = showHiddenCases ? index : result.testCaseIndex;
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Test Case Header */}
                  <div 
                    className={`p-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleTestCase(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <span className="font-medium text-gray-900">
                            Test Case {actualIndex + 1}
                          </span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {formatTime(result.executionTime)}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {result.points} pts
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result.status === 'passed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Test Case Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white">
                      <div className="p-4 space-y-4">
                        {/* Input/Output Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Input
                            </label>
                            <pre className="bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto border">
                              {result.input || '(no input)'}
                            </pre>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expected Output
                            </label>
                            <pre className="bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto border">
                              {result.expectedOutput}
                            </pre>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Output
                            </label>
                            <pre className={`p-3 rounded-lg text-sm font-mono overflow-x-auto border ${
                              result.status === 'passed' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              {result.actualOutput || '(no output)'}
                            </pre>
                          </div>
                        </div>
                        
                        {/* Error Message */}
                        {result.errorMessage && (
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-2">
                              Error Message
                            </label>
                            <pre className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm font-mono overflow-x-auto text-red-800">
                              {result.errorMessage}
                            </pre>
                          </div>
                        )}
                        
                        {/* Execution Stats */}
                        <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
                          <span>Execution Time: {formatTime(result.executionTime)}</span>
                          <span>Memory: {formatMemory(result.memoryUsage)}</span>
                          <span>Points: {result.points}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Show more button for hidden cases */}
          {!showAllTestCases && !showHiddenCases && submission.testResults.length > 2 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowHiddenCases(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Show {submission.testResults.length - 2} more test cases
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submission Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Submission ID: {submission.id}</span>
            <span>Submitted: {new Date(submission.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
