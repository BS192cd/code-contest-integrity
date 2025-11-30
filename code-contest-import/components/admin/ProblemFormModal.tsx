import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TestCaseManager, { VisibleTestCase, HiddenTestCase } from './TestCaseManager';

export interface ProblemFormData {
  _id?: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  constraints: any;
  solutionStub?: string;
  visibleTestCases: VisibleTestCase[];
  hiddenTestCases: HiddenTestCase[];
}

interface ProblemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problem: ProblemFormData) => void;
  problem: Partial<ProblemFormData> | null;
}

const ProblemFormModal: React.FC<ProblemFormModalProps> = ({ isOpen, onClose, onSubmit, problem }) => {
  const [formData, setFormData] = useState<Omit<ProblemFormData, 'visibleTestCases' | 'hiddenTestCases'>>({
    title: '',
    description: '',
    difficulty: 'Easy',
    category: '',
    constraints: {},
    solutionStub: ''
  });
  const [visibleTestCases, setVisibleTestCases] = useState<VisibleTestCase[]>([]);
  const [hiddenTestCases, setHiddenTestCases] = useState<HiddenTestCase[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (problem) {
        setFormData({
          title: problem.title || '',
          description: problem.description || '',
          difficulty: problem.difficulty || 'Easy',
          category: problem.category || '',
          constraints: problem.constraints || {},
          solutionStub: problem.solutionStub || '',
          _id: problem._id
        });
        setVisibleTestCases(problem.visibleTestCases || []);
        setHiddenTestCases(problem.hiddenTestCases || []);
      } else {
        setFormData({
          title: '',
          description: '',
          difficulty: 'Easy',
          category: '',
          constraints: {},
          solutionStub: ''
        });
        setVisibleTestCases([]);
        setHiddenTestCases([]);
      }
    }
  }, [problem, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, visibleTestCases, hiddenTestCases });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{problem ? 'Edit Problem' : 'Create Problem'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={10}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="constraints" className="block text-sm font-medium text-gray-700">Constraints (JSON)</label>
              <textarea
                id="constraints"
                name="constraints"
                value={typeof formData.constraints === 'object' ? JSON.stringify(formData.constraints, null, 2) : formData.constraints}
                onChange={handleChange}
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="solutionStub" className="block text-sm font-medium text-gray-700">Solution Stub</label>
              <textarea
                id="solutionStub"
                name="solutionStub"
                value={formData.solutionStub}
                onChange={handleChange}
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              ></textarea>
            </div>
          </div>

          <TestCaseManager
            visibleTestCases={visibleTestCases}
            hiddenTestCases={hiddenTestCases}
            onVisibleTestCasesChange={setVisibleTestCases}
            onHiddenTestCasesChange={setHiddenTestCases}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {problem ? 'Save Changes' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemFormModal;
