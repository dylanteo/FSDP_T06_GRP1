import React, { useState, useEffect } from 'react';

const BrowserSelector = ({ setSelectedBrowsers }) => {
  const [browsers, setBrowsers] = useState({
    chrome: false,
    firefox: false,
    edge: false,
  });

  const handleBrowserChange = (e) => {
    const { name, checked } = e.target;
    setBrowsers((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // Using useEffect to update the selected browsers after the browsers state changes
  useEffect(() => {
    const selected = Object.keys(browsers).filter((key) => browsers[key]);
    setSelectedBrowsers(selected);
  }, [browsers, setSelectedBrowsers]);

  return (
    <div className="browser-selector">
      <label>
        <input
          type="checkbox"
          name="chrome"
          checked={browsers.chrome}
          onChange={handleBrowserChange}
        />
        Chrome
      </label>
      <label>
        <input
          type="checkbox"
          name="firefox"
          checked={browsers.firefox}
          onChange={handleBrowserChange}
        />
        Firefox
      </label>
      <label>
        <input
          type="checkbox"
          name="edge"
          checked={browsers.edge}
          onChange={handleBrowserChange}
        />
        Edge
      </label>
    </div>
  );
};

export default BrowserSelector;