// CsvUploader.js
import React, { useRef } from 'react';
import Papa from 'papaparse';

const CsvUploader = ({ setTestCases }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (result) {
          const testCases = result.data.map((testCase) => ({
            ...testCase,
            priority: testCase.priority || 'Medium', // Default priority if not provided
            feature: testCase.feature || 'General',  // Default feature if not provided
          }));
          setTestCases(testCases);
          localStorage.setItem('uploadedTestCases', JSON.stringify(testCases));
          console.log('CSV data saved to local storage:', testCases);
        },
      });
    }
  };

  return (
    <>
      <button className="btn import" onClick={handleButtonClick}>
        Import via CSV
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </>
  );
};

export default CsvUploader;
