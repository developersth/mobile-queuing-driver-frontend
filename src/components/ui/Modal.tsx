"use client";

import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 card-shadow">
        {title && (
          <h3 className="mb-4 text-center text-base font-semibold leading-relaxed text-top-blue">
            {title}
          </h3>
        )}
        {children}
        {onConfirm && (
          <div className="mt-6 flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button fullWidth onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 card-shadow">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>
        <p className="mb-6 pt-2 text-center text-base text-top-blue">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            ยกเลิก
          </Button>
          <Button fullWidth onClick={onConfirm}>
            ยืนยัน
          </Button>
        </div>
      </div>
    </div>
  );
}
