import React from 'react';
import logo from './logo.svg';
import './App.css';

import o9n from 'o9n';

function App() {

  function isMobileDevice() {
    return (window.orientation !== undefined && document.documentElement.requestFullscreen !== undefined);
  };

  function toggleToFullscreenAndLandscapeOnMobile() {
    if (isMobileDevice()) {
      document.documentElement.requestFullscreen().then(() => {
        o9n.orientation.lock("landscape-primary");
      });
    }
  }

  const handleClick = (event: React.MouseEvent) => toggleToFullscreenAndLandscapeOnMobile();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={handleClick}>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
