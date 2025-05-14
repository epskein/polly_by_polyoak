import React, { useEffect, useRef } from 'react';

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Lock body scroll when dialog is open
    if (open) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  // Handle clicking outside the dialog
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 custom-dialog-overlay">
      {children}
    </div>
  );
}

export function AlertDialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={contentRef}
      className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto ${className}`}
      role="alertdialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}

export function AlertDialogFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pt-0 flex justify-end space-x-2 ${className}`}>{children}</div>;
}

export function AlertDialogTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h2>;
}

export function AlertDialogDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`mt-2 text-sm text-gray-500 ${className}`}>{children}</p>;
}

export function AlertDialogAction({ 
  children, 
  onClick, 
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({ 
  children, 
  onClick, 
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}