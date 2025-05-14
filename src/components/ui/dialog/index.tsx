import React, { Fragment, useEffect, useRef } from 'react';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ isOpen, onClose, children, className = '' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Lock body scroll when dialog is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle clicking outside the dialog
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 custom-dialog-overlay">

      <div 
        ref={dialogRef}
        className={`bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-auto ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 pt-6 pb-0 ${className}`}>{children}</div>;
}

export function DialogFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`mt-2 text-sm text-gray-500 ${className}`}>{children}</p>;
}

export function DialogClose({ onClick, className = '', children }: { onClick: () => void; className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`absolute top-4 right-4 text-gray-400 hover:text-gray-500 ${className}`}
      onClick={onClick}
      aria-label="Close"
    >
      {children || (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}