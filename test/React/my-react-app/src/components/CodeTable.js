//CodeTable.js
import React, { useState } from 'react';

const CodeTable = ({ javaCode }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [runningStatus, setRunningStatus] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isExecuting, setIsExecuting] = useState(false);

    const formatDate = (dateString) => {
      const date = new Date(dateString); // Parse the ISO string (including timezone info)
      const options = {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formattedDate = new Intl.DateTimeFormat('en-SG', options).format(date);
      return formattedDate.replace(',', ''); // Removes the comma between date and time
    };

  const handleSeeMoreClick = (fileContent) => {
    const newWindow = window.open();
    newWindow.document.write('<pre>' + fileContent + '</pre>');
    newWindow.document.close();
  };

  const handleRunCode = async (filename) => {
    setRunningStatus(prev => ({ ...prev, [filename]: 'running' }));

    try {
      const formData = new FormData();
      const blob = new Blob([javaCode.find(file => file.filename === filename).content],
        { type: 'text/x-java' });
      formData.append('file', blob, filename);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to run code');
      }

      const result = await response.json();
      setRunningStatus(prev => ({ ...prev, [filename]: 'completed' }));

    } catch (error) {
      console.error('Error running code:', error);
      setRunningStatus(prev => ({ ...prev, [filename]: 'error' }));
      throw error;
    }
  };

  const handleRunSelected = async () => {
    setIsExecuting(true);
    const selectedFilesArray = Array.from(selectedFiles);

    for (const filename of selectedFilesArray) {
      try {
        await handleRunCode(filename);
      } catch (error) {
        alert(`Error running ${filename}: ${error.message}`);
        break;
      }
    }

    setIsExecuting(false);
    alert('Finished executing selected files');
  };

  const toggleFileSelection = (filename) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  const getStatusButton = (filename) => {
    const status = runningStatus[filename];
    const baseButtonClass = "px-3 py-1 rounded text-white";

    switch (status) {
      case 'running':
        return (
          <span className={`${baseButtonClass} bg-yellow-500`}>
            Running...
          </span>
        );
      case 'completed':
        return (
          <span className={`${baseButtonClass} bg-green-500`}>
            Completed
          </span>
        );
      case 'error':
        return (
          <span className={`${baseButtonClass} bg-red-500`}>
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (

    <div className="test-results">
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Java Code Files</h3>
            <button
              onClick={handleRunSelected}
              disabled={selectedFiles.size === 0 || isExecuting}
              className={`run-selected-btn ${
                selectedFiles.size === 0 || isExecuting ? 'cursor-not-allowed' : ''
              }`}
            >
              {isExecuting ? 'Executing...' : `Run Selected (${selectedFiles.size})`}
            </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Select</th>
            <th className="p-2 text-left">File Name</th>
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Date Uploaded</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {javaCode.map((file, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.filename)}
                  onChange={() => toggleFileSelection(file.filename)}
                  disabled={isExecuting}
                  className="w-4 h-4"
                />
              </td>
              <td className="p-2">{file.filename}</td>
              <td className="p-2">
                <pre className="bg-gray-50 p-2 rounded">
                  {file.content.substring(0, 100) + '...'}
                </pre>
                {file.content.length > 100 && (
                  <button
                    className="text-blue-600 hover:text-blue-800 mt-2"
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
    </div>
  );
};

export default CodeTable;