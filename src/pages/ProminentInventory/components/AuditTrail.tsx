// src/pages/ProminentInventory/components/AuditTrail.tsx
import React from 'react';
import { AuditLog } from '../types';

interface AuditTrailProps {
  auditLog: AuditLog[];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ auditLog, page = 1, pageSize = 20, total = 0, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Audit Trail</h2>
      <div className="space-y-4 break-words">
        {auditLog.map((log) => (
          <div key={log.id} className="text-sm">
            <p className="font-semibold truncate">{log.user}</p>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">{log.action}</p>
            <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {onPageChange && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
