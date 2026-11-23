import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToHash: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let page = 'home';
    if (path.includes('collection') || path.includes('catalogue')) page = 'catalogue';
    else if (path.includes('story')) page = 'story';
    else if (path.includes('help')) page = 'help';
    else if (path.includes('privacy')) page = 'privacy';
    document.body.setAttribute('data-page', page);

    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollToHash;
