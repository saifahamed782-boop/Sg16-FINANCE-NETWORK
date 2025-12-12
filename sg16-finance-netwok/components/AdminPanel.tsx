import React from 'react';
import { LoanApplication, ApplicationStatus } from '../types';

interface AdminPanelProps {
  applications: LoanApplication[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ applications, onUpdateStatus, onLogout }) => {
  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case 'APPROVED': return 'text-green-400';
      case 'MATCHING_LENDER': return 'text-gold-400';
      case 'REJECTED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold">A</div>
             Admin Command Center
          </h1>
          <button onClick={onLogout} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">Logout</button>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Region</th>
                <th className="p-4">Applicant</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Commission</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">No active applications in the queue.</td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                       <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold">{app.country}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-bold">{app.userName}</div>
                      <div className="text-xs text-gray-500 font-mono">{app.icNumber}</div>
                    </td>
                    <td className="p-4 text-gold-500 font-bold font-mono">
                      {app.country === 'MY' ? 'RM' : app.country === 'TH' ? '฿' : 'Rp'} {app.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${(app.documentResult?.fraudRiskScore || 0) > 50 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                         <span className="text-sm text-gray-300">{app.documentResult?.fraudRiskScore || 0}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-xs ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {app.status === 'APPROVED' ? (
                        <span className="text-green-500 text-xs font-bold border border-green-500/30 px-2 py-1 rounded bg-green-900/20">
                          + COLLECTED
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => onUpdateStatus(app.id, 'APPROVED')}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold shadow-lg shadow-green-900/50"
                      >
                        Match & Approve
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(app.id, 'REJECTED')}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};