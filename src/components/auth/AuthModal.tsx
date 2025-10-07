"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnifiedAuth } from "./UnifiedAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to Franchiseen</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to create a franchise or register your brand
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <UnifiedAuth onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
