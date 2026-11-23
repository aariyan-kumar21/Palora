import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./features/home/HomePage'));
const CollectionsPage = lazy(() => import('./features/collections/CollectionsPage'));
const StoryPage = lazy(() => import('./pages/Story/StoryPage'));
const HelpPage = lazy(() => import('./pages/Help/HelpPage'));
const PrivacyPage = lazy(() => import('./pages/Privacy/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/index.html" element={<HomePage />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/catalogue.html" element={<CollectionsPage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/story.html" element={<StoryPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/help.html" element={<HelpPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/privacy.html" element={<PrivacyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
