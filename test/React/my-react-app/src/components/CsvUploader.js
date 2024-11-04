import React from 'react';
import Papa from 'papaparse';

const CsvUploader = ({ setTestCases }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log(results.data); // Log the parsed data
          setTestCases(results.data); // Update the test cases state
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default CsvUploader;
