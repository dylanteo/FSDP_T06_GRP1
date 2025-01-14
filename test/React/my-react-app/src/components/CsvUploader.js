import React from 'react';
import Papa from 'papaparse';

const CsvUploader = ({ setTestCases }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setTestCases(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

  return (
    <div className="csv-uploader">
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default CsvUploader;
