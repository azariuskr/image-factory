import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/layout/Layout';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Analytics />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="upload" element={<Upload />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;