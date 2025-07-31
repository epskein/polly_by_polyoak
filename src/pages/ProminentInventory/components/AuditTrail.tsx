// src/pages/ProminentInventory/components/AuditTrail.tsx
import React from 'react';
import { AuditLog } from '../types';

interface AuditTrailProps {
  auditLog: AuditLog[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ auditLog }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Audit Trail</h2>
      <div className="space-y-4">
        {auditLog.map((log) => (
          <div key={log.id} className="text-sm">
            <p className="font-semibold">{log.user}</p>
            <p className="text-gray-600 dark:text-gray-400">{log.action}</p>
            <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;
