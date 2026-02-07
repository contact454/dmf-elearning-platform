import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseAutoSaveProps {
  content: string;
  essayId: string | null;
  onSave: (content: string) => Promise<void>;
  delay?: number;
}

export function useAutoSave({ 
  content, 
  essayId, 
  onSave, 
  delay = 10000 
}: UseAutoSaveProps) {
  const debouncedSave = useDebouncedCallback(
    async (text: string) => {
      if (essayId && text.length > 0) {
        try {
          await onSave(text);
          console.log('✅ Auto-saved');
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }
    },
    delay
  );

  useEffect(() => {
    debouncedSave(content);
  }, [content, debouncedSave]);

  return { isDebouncing: debouncedSave.isPending() };
}
