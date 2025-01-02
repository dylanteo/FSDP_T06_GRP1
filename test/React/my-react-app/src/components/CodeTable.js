import React, { useState } from 'react';

const CodeTable = ({ javaCode }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [runningStatus, setRunningStatus] = useState({});

  const formatDate = (dateString) => {
    const day = dateString.slice(0, 2);
    const month = dateString.slice(2, 4);
    const year = `20${dateString.slice(4, 6)}`;
    const hours = dateString.slice(6, 8);
    const minutes = dateString.slice(8, 10);
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleSeeMoreClick = (fileContent) => {
    const newWindow = window.open();
    newWindow.document.write('<pre>' + fileContent + '</pre>');
    newWindow.document.close();
  };

  const handleRunCode = async (filename) => {
    setRunningStatus(prev => ({ ...prev, [filename]: 'running' }));

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      const blob = new Blob([javaCode.find(file => file.filename === filename).content],
        { type: 'text/x-java' });
      formData.append('file', blob, filename);

      // Send the request to the server
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to run code');
      }

      const result = await response.json();
      setRunningStatus(prev => ({ ...prev, [filename]: 'completed' }));

      // Show success message
      alert('Code executed successfully!');

    } catch (error) {
      console.error('Error running code:', error);
      setRunningStatus(prev => ({ ...prev, [filename]: 'error' }));
      alert('Error running code: ' + error.message);
    }
  };

  const getStatusButton = (filename) => {
      const status = runningStatus[filename];

      const baseButtonClass = "btn create-btn mt-2 text-blue-600 hover:text-blue-800";

      switch (status) {
        case 'running':
          return (
            <button className={`${baseButtonClass} bg-yellow-500 hover:bg-yellow-600 animate-pulse`} disabled>
              Running...
            </button>
          );
        case 'completed':
          return (
            <button className={`${baseButtonClass} bg-green-500 hover:bg-green-600`}
                    onClick={() => handleRunCode(filename)}>
              Run Again
            </button>
          );
        case 'error':
          return (
            <button className={`${baseButtonClass} bg-red-500 hover:bg-red-600`}
                    onClick={() => handleRunCode(filename)}>
              Retry
            </button>
          );
        default:
          return (
            <button className={`${baseButtonClass} bg-blue-500 hover:bg-blue-600`}
                    onClick={() => handleRunCode(filename)}>
              Run
            </button>
          );
      }
    };

  return (
    <div className="java-code-section">
      <h3 className="text-xl font-bold mb-4">Java Code Files</h3>
      <table className="test-results w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">File Name</th>
            <th className="p-2">Code</th>
            <th className="p-2">Date Uploaded</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {javaCode.map((file, index) => (
            <tr key={index} className="test-row border-b">
              <td className="p-2">{file.filename}</td>
              <td className="p-2">
                <pre className="code-snippet bg-gray-50 p-2 rounded">
                  {file.content.substring(0, 100) + '...'}
                </pre>
                {file.content.length > 100 && (
                  <button
                    className="btn create-btn mt-2 text-blue-600 hover:text-blue-800"
                    onClick={() => handleSeeMoreClick(file.content)}
                  >
                    See More
                  </button>
                )}
              </td>
              <td className="p-2">{formatDate(file.uploadDate)}</td>
              <td className="p-2">
                {getStatusButton(file.filename)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeTable;