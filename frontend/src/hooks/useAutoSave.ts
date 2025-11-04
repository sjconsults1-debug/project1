import { useEffect, useRef } from 'react';
import { useResume } from '../contexts/ResumeContext';
import { useAuth } from '../contexts/AuthContext';

interface AutoSaveOptions {
  enabled?: boolean;
  delay?: number;
  onSave?: (data: any) => Promise<void>;
}

export const useAutoSave = (options: AutoSaveOptions = {}) => {
  const { enabled = true, delay = 30000, onSave } = options;
  const { currentContent, currentResume } = useResume();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>(JSON.stringify(currentContent));
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !user || !currentResume) {
      return;
    }

    // Check if content has actually changed
    const currentContentString = JSON.stringify(currentContent);
    if (currentContentString === lastSavedRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) {
        return; // Don't save if already saving
      }

      try {
        isSavingRef.current = true;

        if (onSave) {
          await onSave(currentContent);
        } else {
          // Default save logic - you can customize this
          console.log('Auto-saving resume content:', currentContent);
        }

        lastSavedRef.current = currentContentString;

        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('resumeAutoSaved', {
          detail: { timestamp: new Date() }
        }));
      } catch (error) {
        console.error('Auto-save failed:', error);

        // Dispatch error event
        window.dispatchEvent(new CustomEvent('resumeAutoSaveError', {
          detail: { error, timestamp: new Date() }
        }));
      } finally {
        isSavingRef.current = false;
      }
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentContent, enabled, delay, onSave, user, currentResume]);

  // Manual save function
  const saveNow = async () => {
    if (!user || !currentResume) {
      throw new Error('User or resume not available');
    }

    if (isSavingRef.current) {
      throw new Error('Save already in progress');
    }

    try {
      isSavingRef.current = true;

      if (onSave) {
        await onSave(currentContent);
      } else {
        console.log('Manual save resume content:', currentContent);
      }

      lastSavedRef.current = JSON.stringify(currentContent);

      // Dispatch success event
      window.dispatchEvent(new CustomEvent('resumeSaved', {
        detail: { timestamp: new Date() }
      }));

      return true;
    } catch (error) {
      console.error('Manual save failed:', error);

      // Dispatch error event
      window.dispatchEvent(new CustomEvent('resumeSaveError', {
        detail: { error, timestamp: new Date() }
      }));

      throw error;
    } finally {
      isSavingRef.current = false;
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    const currentContentString = JSON.stringify(currentContent);
    return currentContentString !== lastSavedRef.current;
  };

  // Force save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentContent]);

  return {
    saveNow,
    hasUnsavedChanges,
    isSaving: isSavingRef.current,
  };
};