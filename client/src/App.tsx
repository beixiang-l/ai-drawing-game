import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="app-header">
        <h1>AI 你画我猜</h1>
      </header>
      <main className="app-main">
        <DrawingCanvas />
      </main>
    </div>
  );
};

export default App;