"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AlertDialogOptions = {
  title?: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
};

const DEFAULT_TITLE = "Notice";
const DEFAULT_CONFIRM_TEXT = "OK";

export const useAlertDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions | null>(null);

  const showAlert = useCallback((opts: AlertDialogOptions) => {
    setOptions({
      title: opts.title ?? DEFAULT_TITLE,
      description: opts.description,
      confirmText: opts.confirmText ?? DEFAULT_CONFIRM_TEXT,
      onConfirm: opts.onConfirm,
    });
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (options?.onConfirm) {
      options.onConfirm();
    }
  }, [options]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  const alertDialog = useMemo(() => {
    if (!options) {
      return null;
    }

    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirm}>
              {options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [handleConfirm, handleOpenChange, isOpen, options]);

  return { showAlert, alertDialog };
};

export type UseAlertDialog = ReturnType<typeof useAlertDialog>;
