import React, { useState } from 'react';
import ScheduleManager from './ScheduleManager';

const CodeTable = ({ javaCode }) => {
  // ---------------------------
  // States
  // ---------------------------
  const [runningStatus, setRunningStatus] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [scheduledTimes, setScheduledTimes] = useState({});
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  // Filter input state
  const [filterText, setFilterText] = useState('');

  // Run mode -> "immediate" or "scheduled"
  const [runMode, setRunMode] = useState('immediate');

  // Code snippet modal
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [modalCodeContent, setModalCodeContent] = useState('');

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalFiles, setConfirmModalFiles] = useState([]);
  const [confirmModalAction, setConfirmModalAction] = useState('run');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---------------------------
  // Utility Functions
  // ---------------------------
  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
    return new Intl.DateTimeFormat('en-SG', options).format(date).replace(',', '');
  };

  const handleSeeMoreClick = (fileContent) => {
    setModalCodeContent(fileContent);
    setShowCodeModal(true);
  };

  // ---------------------------
  // Running Code Logic
  // ---------------------------
  const handleRunCode = async (filename, scheduledTime = null) => {
    if (scheduledTime) {
      setScheduledTimes((prev) => ({ ...prev, [filename]: scheduledTime }));
      setRunningStatus((prev) => ({ ...prev, [filename]: 'scheduled' }));

      const delay = new Date(scheduledTime) - new Date();
      if (delay > 0) {
        setTimeout(() => {
          executeCode(filename);
        }, delay);
      }
    } else {
      // Run immediately
      await executeCode(filename);
    }
  };

  const executeCode = async (filename) => {
    setRunningStatus((prev) => ({ ...prev, [filename]: 'running' }));

    try {
      const fileObj = javaCode.find((f) => f.filename === filename);
      const blob = new Blob([fileObj.content], { type: 'text/x-java' });

      const formData = new FormData();
      formData.append('file', blob, filename);

      // Prompt for email if not in localStorage
      const userEmail =
        localStorage.getItem('userEmail') ||
        prompt('Please enter your email address:');
      if (!userEmail) {
        throw new Error('Email is required');
      }
      localStorage.setItem('userEmail', userEmail);
      formData.append('email', userEmail);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to run code');
      }

      await response.json();
      setRunningStatus((prev) => ({ ...prev, [filename]: 'completed' }));

      // Clear scheduled time
      setScheduledTimes((prev) => {
        const newTimes = { ...prev };
        delete newTimes[filename];
        return newTimes;
      });
    } catch (error) {
      console.error('Error running code:', error);
      setRunningStatus((prev) => ({ ...prev, [filename]: 'error' }));
      throw error;
    }
  };

  // ---------------------------
  // Confirmation Modal Flow
  // ---------------------------
  const handleAttemptRunSelected = () => {
    if (runMode === 'scheduled' && !selectedDateTime) {
      alert('Please select a date/time to schedule');
      return;
    }

    const filesArray = Array.from(selectedFiles);
    if (filesArray.length === 0) return;

    setConfirmModalFiles(filesArray);
    setConfirmModalAction(runMode === 'scheduled' ? 'schedule' : 'run');
    setShowConfirmModal(true);
  };

  const confirmRunSelected = async () => {
    setShowConfirmModal(false);
    setIsExecuting(true);

    try {
      for (const filename of confirmModalFiles) {
        await handleRunCode(
          filename,
          confirmModalAction === 'schedule' ? selectedDateTime : null
        );
      }

      setIsExecuting(false);
      if (confirmModalAction === 'run') {
        alert('Finished executing selected files');
      } else {
        alert(`Files scheduled for execution at ${formatDate(selectedDateTime)}`);
      }
    } catch (err) {
      alert(`Error running files: ${err.message}`);
      setIsExecuting(false);
    }
  };

  // ---------------------------
  // Selection & Status
  // ---------------------------
  const toggleFileSelection = (filename) => {
    const newSet = new Set(selectedFiles);
    if (newSet.has(filename)) {
      newSet.delete(filename);
    } else {
      newSet.add(filename);
    }
    setSelectedFiles(newSet);
  };

  const getStatusBadge = (filename) => {
    const status = runningStatus[filename];
    switch (status) {
      case 'scheduled':
        return (
          <span className="status-badge scheduled">
            Scheduled for {formatDate(scheduledTimes[filename])}
          </span>
        );
      case 'running':
        return <span className="status-badge running">Running...</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      case 'error':
        return <span className="status-badge error">Error</span>;
      default:
        return null;
    }
  };

  // ---------------------------
  // Sort, Filter & Pagination
  // ---------------------------

  // 1) Sort by date (descending) so latest is on top
  const sortedByDate = [...javaCode].sort(
    (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
  );

  // 2) Filtered list
  const filteredCode = sortedByDate.filter((file) => {
    if (!filterText) return true;
    return file.filename.toLowerCase().includes(filterText.toLowerCase());
  });

  // 3) Pagination
  const totalPages = Math.ceil(filteredCode.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = filteredCode.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="enhanced-code-table-container">
      {/* Top row: Title & Filter */}
      <div className="top-row">
        <h3 className="table-title">Java Code Files</h3>

        <div className="filter-container">
          <label>Filter by Test Case Type:</label>
          <input
            type="text"
            placeholder="e.g. 'login', 'register'..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1); // reset to first page on new filter
            }}
          />
        </div>
      </div>

      {/* Run Mode + DateTime */}
      <div className="run-mode-row">
        <div className="run-mode-options">
          <label>
            <input
              type="radio"
              name="runMode"
              value="immediate"
              checked={runMode === 'immediate'}
              onChange={() => setRunMode('immediate')}
            />
            Run Now
          </label>
          <label>
            <input
              type="radio"
              name="runMode"
              value="scheduled"
              checked={runMode === 'scheduled'}
              onChange={() => setRunMode('scheduled')}
            />
            Schedule
          </label>
          {runMode === 'scheduled' && (
            <input
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="datetime-input"
              style={{ marginLeft: '8px' }}
            />
          )}
        </div>

        <button
          className="run-selected-btn"
          disabled={selectedFiles.size === 0 || isExecuting}
          onClick={handleAttemptRunSelected}
        >
          {isExecuting
            ? 'Executing...'
            : runMode === 'scheduled'
            ? `Schedule Selected (${selectedFiles.size})`
            : `Run Selected (${selectedFiles.size})`}
        </button>
        <button
          className="button button-secondary"
          disabled={selectedFiles.size === 0}
          onClick={() => setShowScheduleManager(true)}
        >
          Schedule Selected
        </button>
      </div>

      {/* Table Container */}
      <div className="table-scroll-container tall-container" style={{ minHeight: '800px' }}>
        <table className="enhanced-code-table">
          <thead className="sticky-header">
            <tr>
              <th>Select</th>
              <th>File Name</th>
              <th>Code</th>
              <th>Date Uploaded</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentPageItems.map((file, index) => {
              const isSelected = selectedFiles.has(file.filename);
              return (
                <tr
                  key={index}
                  className={isSelected ? 'selected-row table-row' : 'table-row'}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFileSelection(file.filename)}
                      disabled={isExecuting}
                    />
                  </td>
                  <td className="file-name-cell">{file.filename}</td>
                  <td>
                    <pre className="code-snippet">
                      {file.content.substring(0, 100)}...
                    </pre>
                    {file.content.length > 100 && (
                      <button
                        className="see-more-btn"
                        onClick={() => handleSeeMoreClick(file.content)}
                      >
                        See More
                      </button>
                    )}
                  </td>
                  <td>{formatDate(file.uploadDate)}</td>
                  <td>{getStatusBadge(file.filename)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}

      {/* Modal for Full Code */}
      {showCodeModal && (
        <div className="code-modal-overlay">
          <div className="code-modal-content">
            <h2>Full Code</h2>
            <pre>{modalCodeContent}</pre>
            <button
              className="close-modal-btn"
              onClick={() => setShowCodeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="run-confirm-modal-overlay">
          <div className="run-confirm-modal-content">
            <h2>{confirmModalAction === 'run' ? 'Confirm Run' : 'Confirm Schedule'}</h2>
            <p>You are about to {confirmModalAction} the following files:</p>
            <ul>
              {confirmModalFiles.map((fname, i) => (
                <li key={i}>{fname}</li>
              ))}
            </ul>
            {confirmModalAction === 'schedule' && (
              <p>
                <strong>Scheduled Time: </strong>
                {selectedDateTime}
              </p>
            )}
            <div className="confirm-modal-buttons">
              <button onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button onClick={confirmRunSelected}>OK</button>
            </div>
          </div>
        </div>
      )}
      {showScheduleManager && (
        <ScheduleManager
          selectedFiles={Array.from(selectedFiles)}
          onClose={() => setShowScheduleManager(false)}
        />
      )}
    </div>
  );
};

export default CodeTable;
