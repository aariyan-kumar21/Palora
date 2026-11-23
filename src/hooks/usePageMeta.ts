import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string, pageId?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }
    if (pageId) {
      document.body.setAttribute('data-page', pageId);
    }
  }, [title, description, pageId]);
}
