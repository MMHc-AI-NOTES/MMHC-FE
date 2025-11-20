import React from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SharedButton from './GenericButton';

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  isLoading,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <SharedButton variant="outline">Cancel</SharedButton>
          </DialogClose>
          <SharedButton isLoading={isLoading} onClick={onConfirm}>
            {confirmButtonText}
          </SharedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;

export interface ConfirmationDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
}
