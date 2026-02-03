import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default'
  });

  const confirm = React.useCallback(({ 
    title, 
    description, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    variant = 'default'
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        description,
        confirmText,
        cancelText,
        variant,
        onConfirm: (result) => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(result);
        }
      });
    });
  }, []);

  const ConfirmDialog = React.useCallback(() => (
    <AlertDialog open={dialogState.isOpen} onOpenChange={(open) => {
      if (!open && dialogState.onConfirm) {
        dialogState.onConfirm(false);
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
          <AlertDialogDescription>{dialogState.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => dialogState.onConfirm?.(false)}>
            {dialogState.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => dialogState.onConfirm?.(true)}
            className={dialogState.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {dialogState.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ), [dialogState]);

  return { confirm, ConfirmDialog };
}