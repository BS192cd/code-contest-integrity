import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, Users, Percent } from 'lucide-react';
import PlagiarismReportModal from './PlagiarismReportModal';

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

export default function PlagiarismMonitor() {
  const [reports, setReports] = useState<PlagiarismReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<PlagiarismReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/plagiarism/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data.reports);
        } else {
          setError('Failed to fetch plagiarism reports');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading reports...</div>;
  }

  const handleViewReport = (report: PlagiarismReport) => {
    setSelectedReport(report);
  };

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plagiarism Monitor</h2>
      {reports.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Plagiarism Detected</h3>
          <p className="text-gray-500">No submissions have been flagged for plagiarism yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Similarity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map(report => (
                <tr key={report._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.submissionA.user.name}</div>
                        <div className="text-sm text-gray-500">vs. {report.submissionB.user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Percent className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-lg font-semibold text-red-600">{report.similarity.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{report.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleViewReport(report)} className="text-blue-600 hover:text-blue-900 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PlagiarismReportModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
}
