import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  when: boolean;
  message?: string;
}

export function useUnsavedChanges({ when, message = 'You have unsaved changes. Are you sure you want to leave?' }: UseUnsavedChangesOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const unblockRef = useRef<(() => void) | null>(null);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (when) {
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
  }, [when, message]);

  useEffect(() => {
    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [when, handleBeforeUnload]);

  const confirmNavigation = useCallback(() => {
    setShowPrompt(false);
    setConfirmedNavigation(true);
    if (nextLocation) {
      navigate(nextLocation, { replace: true });
    }
  }, [nextLocation, navigate]);

  const cancelNavigation = useCallback(() => {
    setShowPrompt(false);
    setNextLocation(null);
  }, []);

  const promptNavigation = useCallback((path: string) => {
    if (when && !confirmedNavigation) {
      setNextLocation(path);
      setShowPrompt(true);
      return false;
    }
    return true;
  }, [when, confirmedNavigation]);

  return {
    showPrompt,
    confirmNavigation,
    cancelNavigation,
    promptNavigation,
    message
  };
}