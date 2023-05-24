import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from "react-router-dom";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import ChartPage from './Page/ChartPage';
import IndexLayout from './Layout/IndexLayout';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter  >
      <Routes>
        <Route path='/' element={<IndexLayout />}>
          <Route path=":stockID" element={<ChartPage />} />
        </Route>
      </Routes>
    </HashRouter >
  </React.StrictMode>
);

serviceWorkerRegistration.register()
