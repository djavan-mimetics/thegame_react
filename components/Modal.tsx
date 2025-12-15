import { useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

let scrollLockCount = 0;
let scrollLockY = 0;
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyLeft = '';
let previousBodyRight = '';
let previousBodyWidth = '';
let previousBodyOverflow = '';

function lockScroll() {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    scrollLockY = window.scrollY;

    previousBodyPosition = document.body.style.position;
    previousBodyTop = document.body.style.top;
    previousBodyLeft = document.body.style.left;
    previousBodyRight = document.body.style.right;
    previousBodyWidth = document.body.style.width;
    previousBodyOverflow = document.body.style.overflow;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

function unlockScroll() {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.position = previousBodyPosition;
    document.body.style.top = previousBodyTop;
    document.body.style.left = previousBodyLeft;
    document.body.style.right = previousBodyRight;
    document.body.style.width = previousBodyWidth;
    document.body.style.overflow = previousBodyOverflow;

    window.scrollTo(0, scrollLockY);
  }
}

export function Modal({
  open,
  children,
  overlayClassName,
  lockScroll: shouldLockScroll = true
}: {
  open: boolean;
  children: ReactNode;
  overlayClassName?: string;
  lockScroll?: boolean;
}) {
  const container = useMemo(() => {
    if (!open) return null;
    if (typeof document === 'undefined') return null;
    return document.createElement('div');
  }, [open]);

  useEffect(() => {
    if (!container) return;
    document.body.appendChild(container);
    return () => {
      container.remove();
    };
  }, [container]);

  useEffect(() => {
    if (!open) return;
    if (!shouldLockScroll) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [open, shouldLockScroll]);

  if (!open) return null;
  if (!container) return null;

  return createPortal(
    <div
      className={
        overlayClassName ??
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'
      }
    >
      {children}
    </div>,
    container
  );
}
