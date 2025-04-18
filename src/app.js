// src/App.js
import React from 'react';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('upload_bpmn')}</h1>
      <button>{t('start_simulation')}</button>
    </div>
  );
}

export default App;
