import React from 'react';
import { X } from 'lucide-react';
import { diffLines } from 'diff';

interface PlagiarismReport {
  _id: string;
  submissionA: { _id: string; user: { name: string }; code: string };
  submissionB: { _id: string; user: { name: string }; code: string };
  similarity: number;
  details: string;
  analysis: {
    structuralSimilarity: number;
    variableNameSimilarity: number;
    logicSimilarity: number;
    commentSimilarity: number;
  };
}

interface PlagiarismReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PlagiarismReport | null;
}

export default function PlagiarismReportModal({ isOpen, onClose, report }: PlagiarismReportModalProps) {
  if (!isOpen || !report) return null;

  const diffs = diffLines(report.submissionA.code, report.submissionB.code);

  const renderDiff = (diffs: any[]) => {
    const aLines: any[] = [];
    const bLines: any[] = [];

    diffs.forEach((part, index) => {
      const lines = part.value.split('\n');
      const color = part.added ? 'bg-green-100' : part.removed ? 'bg-red-100' : 'bg-white';

      if (part.added) {
        bLines.push(...lines.map((line: string, i: number) => <div key={`b-${index}-${i}`} className={`${color} p-1`}>{line}</div>));
      } else if (part.removed) {
        aLines.push(...lines.map((line: string, i: number) => <div key={`a-${index}-${i}`} className={`${color} p-1`}>{line}</div>));
      } else {
        aLines.push(...lines.map((line: string, i: number) => <div key={`a-${index}-${i}`} className={`${color} p-1`}>{line}</div>));
        bLines.push(...lines.map((line: string, i: number) => <div key={`b-${index}-${i}`} className={`${color} p-1`}>{line}</div>));
      }
    });

    return { aLines, bLines };
  };

  const { aLines, bLines } = renderDiff(diffs);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Plagiarism Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-600">{report.similarity.toFixed(2)}%</div>
            <div className="text-sm text-gray-600">Overall Similarity</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-600">{report.analysis.structuralSimilarity.toFixed(2)}%</div>
            <div className="text-sm text-gray-600">Structural</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-xl font-bold text-green-600">{report.analysis.logicSimilarity.toFixed(2)}%</div>
            <div className="text-sm text-gray-600">Logic</div>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
              <h3 className="font-bold mb-2">{report.submissionA.user.name}</h3>
              <pre className="text-sm font-mono">{aLines}</pre>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
              <h3 className="font-bold mb-2">{report.submissionB.user.name}</h3>
              <pre className="text-sm font-mono">{bLines}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
