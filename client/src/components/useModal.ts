import { useEffect, useEffectEvent, useRef } from 'react';

const openDialogs: HTMLElement[] = [];
const focusableSelector = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Keep focus and keyboard actions in the topmost modal, then restore its opener. */
export function useModal(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
      .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert]'));
    const focusFirst = () => (focusable()[0] ?? dialog).focus();
    // Hide every background branch from pointer and assistive-technology navigation.
    const background: Array<{ element: HTMLElement; inert: boolean }> = [];
    let branch: HTMLElement = dialog;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          background.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    openDialogs.push(dialog);
    const isTop = () => openDialogs.at(-1) === dialog;
    focusFirst();

    const onKey = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      } else if (event.key === 'Tab') {
        const controls = focusable();
        const index = controls.indexOf(document.activeElement as HTMLElement);
        if (!controls.length || index < 0 || (event.shiftKey ? index === 0 : index === controls.length - 1)) {
          event.preventDefault();
          (event.shiftKey ? controls.at(-1) ?? dialog : controls[0] ?? dialog).focus();
        }
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (isTop() && !dialog.contains(event.target as Node)) focusFirst();
    };
    // Let controls receive their keys, but keep window-level game shortcuts suspended.
    const stopGameKeys = (event: KeyboardEvent) => {
      if (isTop()) event.stopPropagation();
    };
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('keydown', stopGameKeys);
    document.addEventListener('focusin', onFocus);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('keydown', stopGameKeys);
      document.removeEventListener('focusin', onFocus);
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      for (const { element, inert } of background) element.inert = inert;
      if (opener?.isConnected) opener.focus();
    };
  }, [isOpen]);

  return dialogRef;
}
