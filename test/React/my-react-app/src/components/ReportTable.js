import React, { useState } from 'react';

// Assuming you have your CSS styles imported here
// import './ReportTable.css';

const ReportTable = ({ reports }) => {
  const [expandedReports, setExpandedReports] = useState([]);

  const toggleExpand = (reportId) => {
    setExpandedReports((prevExpandedReports) =>
      prevExpandedReports.includes(reportId)
        ? prevExpandedReports.filter((id) => id !== reportId)
        : [...prevExpandedReports, reportId]
    );
  };

  const openReportInNewWindow = (reportContent) => {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    newWindow.document.write('<html><head><title>Report</title></head><body>');
    newWindow.document.write(reportContent); // Assuming reportContent contains HTML
    newWindow.document.write('</body></html>');
    newWindow.document.close();
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
                <td>{report.reportDate}</td>
                <td>
                  <button
                    className="btn create-btn"
                    onClick={() => openReportInNewWindow(report.content)} // Open full report in new window
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
