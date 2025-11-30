import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface VisibleTestCase {
  input: string;
  output: string;
  explanation: string;
}

export interface HiddenTestCase {
  input: string;
  output: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
  explanation: string;
}

interface TestCaseManagerProps {
  visibleTestCases: VisibleTestCase[];
  hiddenTestCases: HiddenTestCase[];
  onVisibleTestCasesChange: (testCases: VisibleTestCase[]) => void;
  onHiddenTestCasesChange: (testCases: HiddenTestCase[]) => void;
  className?: string;
}

export default function TestCaseManager({
  visibleTestCases,
  hiddenTestCases,
  onVisibleTestCasesChange,
  onHiddenTestCasesChange,
  className = ''
}: TestCaseManagerProps) {
  const [activeTab, setActiveTab] = useState<'visible' | 'hidden'>('visible');

  // Handlers for Visible Test Cases
  const addVisibleTestCase = () => {
    onVisibleTestCasesChange([...visibleTestCases, { input: '', output: '', explanation: '' }]);
  };

  const updateVisibleTestCase = (index: number, field: keyof VisibleTestCase, value: string) => {
    const updated = visibleTestCases.map((tc, i) => i === index ? { ...tc, [field]: value } : tc);
    onVisibleTestCasesChange(updated);
  };

  const removeVisibleTestCase = (index: number) => {
    onVisibleTestCasesChange(visibleTestCases.filter((_, i) => i !== index));
  };

  // Handlers for Hidden Test Cases
  const addHiddenTestCase = () => {
    onHiddenTestCasesChange([...hiddenTestCases, { input: '', output: '' }]);
  };

  const updateHiddenTestCase = (index: number, field: keyof HiddenTestCase, value: string) => {
    const updated = hiddenTestCases.map((tc, i) => i === index ? { ...tc, [field]: value } : tc);
    onHiddenTestCasesChange(updated);
  };

  const removeHiddenTestCase = (index: number) => {
    onHiddenTestCasesChange(hiddenTestCases.filter((_, i) => i !== index));
  };

  const renderVisibleTestCases = () => (
    <div className="space-y-4">
      {visibleTestCases.map((tc, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Visible Case #{index + 1}</h4>
            <button onClick={() => removeVisibleTestCase(index)} className="text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <textarea value={tc.input} onChange={(e) => updateVisibleTestCase(index, 'input', e.target.value)} placeholder="Input" className="w-full p-2 border rounded font-mono text-sm" rows={3} />
            <textarea value={tc.output} onChange={(e) => updateVisibleTestCase(index, 'output', e.target.value)} placeholder="Output" className="w-full p-2 border rounded font-mono text-sm" rows={3} />
          </div>
          <textarea value={tc.explanation} onChange={(e) => updateVisibleTestCase(index, 'explanation', e.target.value)} placeholder="Explanation" className="w-full p-2 border rounded text-sm" rows={2} />
        </div>
      ))}
      <button onClick={addVisibleTestCase} className="flex items-center gap-2 text-blue-600">
        <Plus size={16} /> Add Visible Case
      </button>
    </div>
  );

  const renderHiddenTestCases = () => (
    <div className="space-y-4">
      {hiddenTestCases.map((tc, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Hidden Case #{index + 1}</h4>
            <button onClick={() => removeHiddenTestCase(index)} className="text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <textarea value={tc.input} onChange={(e) => updateHiddenTestCase(index, 'input', e.target.value)} placeholder="Input" className="w-full p-2 border rounded font-mono text-sm" rows={3} />
            <textarea value={tc.output} onChange={(e) => updateHiddenTestCase(index, 'output', e.target.value)} placeholder="Output" className="w-full p-2 border rounded font-mono text-sm" rows={3} />
          </div>
        </div>
      ))}
      <button onClick={addHiddenTestCase} className="flex items-center gap-2 text-blue-600">
        <Plus size={16} /> Add Hidden Case
      </button>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold">Test Cases</h3>
        <p className="text-sm text-gray-500">Provide visible examples for users and hidden cases for validation.</p>
      </div>
      <div className="flex border-b">
        <button onClick={() => setActiveTab('visible')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'visible' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          Visible Cases ({visibleTestCases.length})
        </button>
        <button onClick={() => setActiveTab('hidden')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'hidden' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          Hidden Cases ({hiddenTestCases.length})
        </button>
      </div>
      <div>
        {activeTab === 'visible' ? renderVisibleTestCases() : renderHiddenTestCases()}
      </div>
    </div>
  );
}
