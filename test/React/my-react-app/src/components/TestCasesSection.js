import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// Helper to strip extra text from testName, e.g. "Add Account Test - Clark Kent"
const extractTestName = (testName) => {
  return testName?.split(" - ")[0] || "Unknown Test Name";
};

// Colors in order: Pass, Fail, Not Executed
const COLORS = ["#4caf50", "#f44336", "#ffc107"];

/**
 * Renders the donut's slice labels so they appear outside the ring,
 * skipping labels if the slice's value is 0.
 */
const renderCustomLabel = (props) => {
  const { cx, cy, midAngle, outerRadius, name, value } = props;

  // If slice is zero, skip showing the label entirely
  if (value === 0) return null;

  const RADIAN = Math.PI / 180;
  // Increase labelRadius to push text farther outside the donut
  const labelRadius = outerRadius + 30;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#000"
      fontSize={12}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name}: ${value}`}
    </text>
  );
};

const TestCaseSection = ({ testResults }) => {
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [expandedTestCases, setExpandedTestCases] = useState({});

  // If we have no test results, just say so
  if (!testResults || testResults.length === 0) {
    return <p>No test cases found.</p>;
  }

  // Map each "document" in testResults to a processed object for rendering
  const processedResults = testResults.map((document, index) => {
    if (!document?.testResults || document.testResults.length === 0) {
      return {
        documentIndex: index,
        rootTestName: document?.testName || "No Root Test Name Found",
        tests: [],
        pieChartData: [],
        barChartData: [],
        avgTimeBarData: [],
        totalTestDurationSec: 0,
        docStartTime: null,
        docEndTime: null,
      };
    }

    const rootTestName = document.testName || "Unnamed Root Test";
    const tests = document.testResults;

    // Count pass/fail/notExecuted
    const statusCounts = tests.reduce(
      (acc, test) => {
        acc[test.status] = (acc[test.status] || 0) + 1;
        return acc;
      },
      { pass: 0, fail: 0, "not executed": 0 }
    );

    // Pie chart data for pass/fail/not executed
    const pieChartData = [
      { name: "Pass", value: statusCounts.pass },
      { name: "Fail", value: statusCounts.fail },
      { name: "Not Executed", value: statusCounts["not executed"] },
    ];

    // Browser usage data
    const browserCounts = tests.reduce((acc, test) => {
      acc[test.browser] = (acc[test.browser] || 0) + 1;
      return acc;
    }, {});
    const barChartData = Object.keys(browserCounts).map((browser) => ({
      browser,
      count: browserCounts[browser],
    }));

    // Average test time by browser (based on steps)
    const timeByBrowser = {};
    tests.forEach((test) => {
      const { browser, steps } = test;
      if (steps && steps.length > 1) {
        const startTime = new Date(steps[0].timestamp);
        const endTime = new Date(steps[steps.length - 1].timestamp);
        const durationMs = endTime - startTime;

        if (!timeByBrowser[browser]) {
          timeByBrowser[browser] = { totalMs: 0, count: 0 };
        }
        timeByBrowser[browser].totalMs += durationMs;
        timeByBrowser[browser].count += 1;
      }
    });
    const avgTimeBarData = Object.keys(timeByBrowser).map((browser) => {
      const { totalMs, count } = timeByBrowser[browser];
      const avgMs = count > 0 ? totalMs / count : 0;
      return { browser, avgMs };
    });

    // Compute total test duration for entire doc (seconds) from all steps
    const totalTestDurationMs = tests.reduce((acc, test) => {
      if (test.steps && test.steps.length > 1) {
        const sTime = new Date(test.steps[0].timestamp);
        const eTime = new Date(test.steps[test.steps.length - 1].timestamp);
        acc += eTime - sTime;
      }
      return acc;
    }, 0);
    const totalTestDurationSec = Math.round(totalTestDurationMs / 1000);

    // Also find earliest doc-level startTime and latest doc-level endTime
    let docStart = null;
    let docEnd = null;
    tests.forEach((test) => {
      if (test.startTime) {
        const st = new Date(test.startTime);
        if (!docStart || st < docStart) {
          docStart = st;
        }
      }
      if (test.endTime) {
        const et = new Date(test.endTime);
        if (!docEnd || et > docEnd) {
          docEnd = et;
        }
      }
    });
    const docStartTime = docStart ? docStart.toLocaleString() : "N/A";
    const docEndTime = docEnd ? docEnd.toLocaleString() : "N/A";

    return {
      documentIndex: index,
      rootTestName,
      tests,
      pieChartData,
      barChartData,
      avgTimeBarData,
      totalTestDurationSec,
      docStartTime,
      docEndTime,
    };
  });

  // Expand/collapse the entire document
  const toggleDocumentExpansion = (index) => {
    setExpandedDocument(expandedDocument === index ? null : index);
    setExpandedTestCases({});
  };

  // Expand/collapse individual test
  const toggleTestCaseExpansion = (documentIndex, testCaseIndex) => {
    setExpandedTestCases((prev) => ({
      ...prev,
      [documentIndex]: {
        ...prev[documentIndex],
        [testCaseIndex]: !prev[documentIndex]?.[testCaseIndex],
      },
    }));
  };

  return (
    <div className="test-case-section">
      <h2 className="section-title">Test Cases by Document</h2>
      {processedResults.map((result) => (
        <div
          key={result.documentIndex}
          className="test-case-card"
          onClick={() => toggleDocumentExpansion(result.documentIndex)}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "20px",
            cursor: "pointer",
            backgroundColor:
              expandedDocument === result.documentIndex ? "#f9f9f9" : "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          {/*  Document Title and top-level times */}
          <h4 style={{ marginBottom: "5px" }}>{result.rootTestName}</h4>
          <p>Total Test Duration (seconds): {result.totalTestDurationSec}</p>
          <p>Start Time: {result.docStartTime}</p>
          <p>End Time: {result.docEndTime}</p>

          {expandedDocument === result.documentIndex && (
            <div>
              {/* CHARTS: Donut + 2 bar charts */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  gap: "40px",
                  marginBottom: "50px",
                }}
              >
                {/* Donut Chart for test status */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h5 style={{ textAlign: "center" }}>Test Status Breakdown</h5>
                  <PieChart width={320} height={320}>
                    <Pie
                      data={result.pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      labelLine={false}
                      // Leaves space between slices to reduce collisions
                      paddingAngle={4}
                      // Custom label that pushes text outside
                      label={renderCustomLabel}
                    >
                      {result.pieChartData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>

                {/* Bar Chart: Browser Usage */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h5 style={{ textAlign: "center" }}>Browser Usage</h5>
                  <BarChart width={300} height={300} data={result.barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </div>

                {/* Bar Chart: Average Test Time (ms) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h5 style={{ textAlign: "center" }}>
                    Average Test Time (ms)
                  </h5>
                  <BarChart
                    width={300}
                    height={300}
                    data={result.avgTimeBarData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgMs" fill="#82ca9d" />
                  </BarChart>
                </div>
              </div>

              {/* TABLE: All tests in this document */}
              <h5 style={{ marginBottom: "10px" }}>
                All Test Cases in Document:
              </h5>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f0f0f0",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    <th style={{ padding: "10px" }}>Test Name</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Browser</th>
                    <th style={{ padding: "10px" }}>Start Time</th>
                    <th style={{ padding: "10px" }}>End Time</th>
                    <th style={{ padding: "10px" }}>Test Duration (sec)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tests.map((test, i) => {
                    const startTime = test.startTime
                      ? new Date(test.startTime)
                      : null;
                    const endTime = test.endTime ? new Date(test.endTime) : null;

                    let durationSec = "N/A";
                    if (startTime && endTime) {
                      durationSec = Math.round((endTime - startTime) / 1000);
                    }

                    return (
                      <React.Fragment key={i}>
                        <tr
                          style={{
                            backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9",
                            borderBottom: "1px solid #ddd",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTestCaseExpansion(result.documentIndex, i);
                          }}
                        >
                          <td style={{ padding: "8px" }}>
                            {extractTestName(test.testName)}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              textAlign: "center",
                              borderRadius: "4px",
                              backgroundColor:
                                test.status === "pass"
                                  ? "#e6f7e6"
                                  : test.status === "fail"
                                  ? "#fbeaea"
                                  : "#f0f0f0",
                              color:
                                test.status === "pass"
                                  ? "#4caf50"
                                  : test.status === "fail"
                                  ? "#f44336"
                                  : "#333",
                              border: `1px solid ${
                                test.status === "pass"
                                  ? "#4caf50"
                                  : test.status === "fail"
                                  ? "#f44336"
                                  : "#ddd"
                              }`,
                            }}
                          >
                            {test.status || "Unknown"}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {test.browser || "N/A"}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {startTime ? startTime.toLocaleString() : "N/A"}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {endTime ? endTime.toLocaleString() : "N/A"}
                          </td>
                          <td style={{ padding: "8px" }}>{durationSec}</td>
                        </tr>

                        {/* Expanded row for steps */}
                        {expandedTestCases[result.documentIndex]?.[i] && (
                          <tr style={{ backgroundColor: "#f9f9f9" }}>
                            <td colSpan="6" style={{ padding: "10px" }}>
                              <h5 style={{ marginBottom: "5px" }}>
                                Test Steps:
                              </h5>
                              <ul
                                style={{
                                  paddingLeft: "20px",
                                  listStyleType: "none",
                                }}
                              >
                                {test.steps?.map((step, j) => (
                                  <li key={j} style={{ marginBottom: "5px" }}>
                                    <strong>Step {j + 1}:</strong>{" "}
                                    {step.name}: {step.message} (
                                    <span
                                      style={{
                                        color:
                                          step.status === "pass"
                                            ? "#4caf50"
                                            : step.status === "fail"
                                            ? "#f44336"
                                            : "#333",
                                      }}
                                    >
                                      {step.status}
                                    </span>
                                    )
                                    <br />
                                    <small style={{ color: "#888" }}>
                                      Timestamp:{" "}
                                      {new Date(step.timestamp).toLocaleString()}
                                    </small>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestCaseSection;
