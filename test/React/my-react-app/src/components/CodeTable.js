import React, { useState } from 'react';

const CodeTable = ({ javaCode }) => {
  const [expandedIndex, setExpandedIndex] = useState(null); // To track the expanded row

  const formatDate = (dateString) => {
    // Extract the parts of the custom date format: DDMMYY HHMM
    const day = dateString.slice(0, 2);
    const month = dateString.slice(2, 4);
    const year = `20${dateString.slice(4, 6)}`; // Convert YY to YYYY
    const hours = dateString.slice(6, 8);
    const minutes = dateString.slice(8, 10);

    // Return the formatted date string
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleSeeMoreClick = (fileContent) => {
    // Open the file content in a new tab
    const newWindow = window.open();
    newWindow.document.write('<pre>' + fileContent + '</pre>'); // Display the content in a readable format
    newWindow.document.close();
  };

  return (
    <div className="java-code-section">
      <h3>Java Code Files</h3>
      <table className="test-results">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Code</th>
            <th>Date Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {javaCode.map((file, index) => (
            <tr key={index} className="test-row">
              <td>{file.filename}</td>
              <td>
                {/* Show only a snippet of the code and a button to see more */}
                <pre className="code-snippet">
                  {file.content.substring(0, 100) + '...'} {/* Preview content */}
                </pre>
                {file.content.length > 100 && ( // Show "See More" button if content is long enough
                  <button
                    className="btn create-btn"
                    onClick={() => handleSeeMoreClick(file.content)}
                  >
                    See More
                  </button>
                )}
              </td>
              <td>{formatDate(file.uploadDate)}</td> {/* Format the uploadDate */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeTable;
