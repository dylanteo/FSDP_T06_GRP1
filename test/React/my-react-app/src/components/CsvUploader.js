import React from 'react';
import Papa from 'papaparse';

const CsvUploader = ({ setTestCases }) => {
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
        },
      });
    }
  };

  return (
    <div className="csv-uploader">
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
};

export default CsvUploader;