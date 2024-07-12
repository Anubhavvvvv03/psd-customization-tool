// pages/index.tsx

import React from 'react';
import PsdEditor from './components/PsdEditor';

const Home: React.FC = () => {
  return (
    <div>
      <h1>PSD Editor</h1>
      <PsdEditor />
    </div>
  );
};

export default Home;
