import React, { useState } from 'react';

// Assuming you have your CSS styles imported here
// import './ReportTable.css';

const ReportTable = ({ reports }) => {
  const [expandedReports, setExpandedReports] = useState([]);
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
  const toggleExpand = (reportId) => {
    setExpandedReports((prevExpandedReports) =>
      prevExpandedReports.includes(reportId)
        ? prevExpandedReports.filter((id) => id !== reportId)
        : [...prevExpandedReports, reportId]
    );
  };

    const openReportInNewTab = (reportContent) => {
      const newTab = window.open();
      newTab.document.write('<html><head><title>Report</title></head><body>');
      newTab.document.write(reportContent); // Assuming reportContent contains HTML
      newTab.document.write('</body></html>');
      newTab.document.close();
    };

  return (
    <div className="report-table">
      <table className="test-results">
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Code that was ran</th>
            <th>Date that it was ran</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <React.Fragment key={report.id}>
              <tr className="test-row">
                <td>{report._id}</td>
                <td>{report.javaFile}</td>
                <td>{formatDate(report.reportDate)}</td>
                <td>
                    <button
                      className="btn create-btn"
                      onClick={() => openReportInNewTab(report.content)} // Open full report in new tab
                    >
                      See More
                    </button>
                </td>
              </tr>

              {expandedReports.includes(report.id) && (
                <tr className="expanded-row">
                  <td colSpan="4">
                    <div className="test-details">
                      <div dangerouslySetInnerHTML={{ __html: report.content }} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
