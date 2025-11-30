import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, TestTube } from 'lucide-react';
import ProblemFormModal, { ProblemFormData } from './ProblemFormModal';

interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
  explanation: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  testCases: TestCase[];
  statistics: {
    totalSubmissions: number;
    acceptanceRate: number;
  };
  createdAt: string;
}

export default function ProblemManagement() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/problems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Problems fetched:', data.data);
        setProblems(data.data || []);
      } else {
        setError('Failed to fetch problems');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

      const handleSubmit = async (problemData: ProblemFormData) => {
    const token = localStorage.getItem('auth_token');
    const method = problemData._id ? 'PUT' : 'POST';
    const url = problemData._id ? `/api/problems/${problemData._id}` : '/api/problems';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(problemData)
      });

      if (response.ok) {
        fetchProblems(); // Refresh the list
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save problem');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleEdit = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
  };

  const handleDelete = async (problemId: string) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await fetch(`/api/problems/${problemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchProblems(); // Refresh the list
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete problem');
        }
      } catch (err) {
        setError('Network error');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedProblem(null);
    setIsModalOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading problems...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchProblems}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Problem Management</h2>
          <p className="text-gray-600">Create and manage coding problems with test cases</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Problem
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{problems.length}</div>
          <div className="text-sm text-gray-600">Total Problems</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {problems.filter(p => p.testCases && p.testCases.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">With Test Cases</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {problems.filter(p => !p.testCases || p.testCases.length === 0).length}
          </div>
          <div className="text-sm text-gray-600">Missing Test Cases</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(problems.reduce((sum, p) => sum + (p.statistics?.acceptanceRate || 0), 0) / problems.length) || 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Acceptance Rate</div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acceptance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problems.map((problem) => (
                <tr key={problem._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {problem.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {problem.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TestTube className="w-4 h-4 text-gray-400 mr-1" />
                      <span className={`text-sm ${
                        problem.testCases && problem.testCases.length > 0 
                          ? 'text-green-600 font-medium' 
                          : 'text-red-600'
                      }`}>
                        {problem.testCases?.length || 0} cases
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {problem.statistics?.acceptanceRate?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {problem.statistics?.totalSubmissions || 0} submissions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(problem)} className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(problem._id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {problems.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Problems Found</h3>
            <p className="text-gray-600 mb-4">
              Create your first coding problem to get started.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Problem
            </button>
          </div>
        )}
      </div>

            <ProblemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        problem={selectedProblem}
      />

      {/* Critical Issues Alert */}
      {problems.filter(p => !p.testCases || p.testCases.length === 0).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TestTube className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Critical Issue Detected</h3>
          </div>
          <p className="text-red-700 mt-1">
            {problems.filter(p => !p.testCases || p.testCases.length === 0).length} problems 
            have no test cases. This causes all submissions to fail with 0% acceptance rate.
          </p>
          <p className="text-red-600 text-sm mt-2">
            Add test cases to these problems to fix the validation system.
          </p>
        </div>
      )}
    </div>
  );
}
