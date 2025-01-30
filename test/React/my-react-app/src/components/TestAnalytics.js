import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import DonutChart from "./DonutChart";
import TestCaseSection from "./TestCasesSection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// 1. Safely parse JSON content
const parseContent = (contentString) => {
  try {
    if (typeof contentString === "string") {
      const cleanedString = contentString
        .replace(/\\r\\n/g, " ")
        .replace(/\\r/g, "")
        .replace(/\\n/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return JSON.parse(cleanedString);
    }
    return contentString;
  } catch (e) {
    console.error("Error parsing content:", e);
    return [];
  }
};

// 2. Calculate pass/fail/not-executed stats
const calculateStats = (tests) => {
  if (!Array.isArray(tests)) {
    tests = [tests];
  }
  return {
    total: tests.length,
    passed: tests.filter((t) => t.status === "pass").length,
    failed: tests.filter((t) => t.status === "fail").length,
    notExecuted: tests.filter(
      (t) => !t.status || t.status === "not_executed"
    ).length,
  };
};

// 3. Filter test results by date/period
const filterByDate = (testResults, period) => {
  if (!testResults || !testResults.length) return [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // We'll define Monday as the start of the week:
  const startOfWeek = new Date(startOfToday);
  const dayOfWeek = startOfWeek.getDay(); // 0=Sun, 1=Mon, ...
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - offset);

  if (period === "Last Test") {
    return [...testResults]
      .sort((a, b) => {
        const aDate = new Date(
          parseContent(a.content)?.testResults?.[0]?.startTime
        );
        const bDate = new Date(
          parseContent(b.content)?.testResults?.[0]?.startTime
        );
        return bDate - aDate;
      })
      .slice(0, 1);
  }

  let startDate;
  switch (period) {
    case "Today":
      startDate = startOfToday;
      break;
    case "This Week":
      startDate = startOfWeek;
      break;
    case "This Month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "This Quarter":
      startDate = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3,
        1
      );
      break;
    default:
      return testResults;
  }

  return testResults.filter((r) => {
    const content = parseContent(r.content);
    const testDate = new Date(content?.testResults?.[0]?.startTime);
    return testDate >= startDate;
  });
};

// Helper to truncate long labels
const truncateLabel = (label, maxLength = 15) =>
  label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;

const TestAnalytics = ({ testResults }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [filteredTestResults, setFilteredTestResults] = useState([]);
  const [cleanjson, setCleanjson] = useState([]);

  useEffect(() => {
    const filtered = filterByDate(testResults, selectedPeriod);
    setFilteredTestResults(filtered);
    setCleanjson(filtered.map((item) => parseContent(item.content)));
  }, [testResults, selectedPeriod]);

  // Overall pass/fail/etc.
  const totalStats = useMemo(() => {
    return cleanjson.reduce(
      (acc, doc) => {
        const stats = calculateStats(doc.testResults || []);
        return {
          total: acc.total + stats.total,
          passed: acc.passed + stats.passed,
          failed: acc.failed + stats.failed,
          notExecuted: acc.notExecuted + stats.notExecuted,
        };
      },
      { total: 0, passed: 0, failed: 0, notExecuted: 0 }
    );
  }, [cleanjson]);

  // Highest Failure-Rate Test Cases (Bar Chart)
  const highestFailureRateData = useMemo(() => {
    const allTests = [];
    cleanjson.forEach((doc) => {
      if (doc?.testResults?.length) {
        allTests.push(...doc.testResults);
      }
    });

    // Group by testCaseName, count fails vs total
    const countsByName = {};
    allTests.forEach((test) => {
      const name = test.testName || "Unknown Test";
      if (!countsByName[name]) {
        countsByName[name] = {
          testCaseName: name,
          totalCount: 0,
          failCount: 0,
        };
      }
      countsByName[name].totalCount += 1;
      if (test.status === "fail") {
        countsByName[name].failCount += 1;
      }
    });

    // Calculate failRate, sort, pick top 5
    const dataArray = Object.values(countsByName).map((item) => {
      const failRate = item.totalCount
        ? (item.failCount / item.totalCount) * 100
        : 0;
      return {
        testCaseName: truncateLabel(item.testCaseName, 15),
        failRate: parseFloat(failRate.toFixed(2)),
      };
    });
    dataArray.sort((a, b) => b.failRate - a.failRate);
    return dataArray.slice(0, 5);
  }, [cleanjson]);

  return (
    <div className="dashboard">
      {/* Heading & Period Tabs */}
      <div className="section-header">
        <h1 className="title">Latest Runs</h1>
        <div className="tabs">
          {["Last Test", "Today", "This Week", "This Month", "This Quarter"].map(
            (period) => (
              <button
                key={period}
                className={`tab ${selectedPeriod === period ? "active" : ""}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            )
          )}
        </div>
      </div>

      {/* High-level Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div>
              <div className="stat-number">{totalStats.total}</div>
              <div className="stat-label">Total</div>
            </div>
            <Activity className="icon blue" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div>
              <div className="stat-number">{totalStats.passed}</div>
              <div className="stat-label">Passed</div>
            </div>
            <CheckCircle className="icon green" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div>
              <div className="stat-number">{totalStats.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
            <XCircle className="icon red" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div>
              <div className="stat-number">{totalStats.notExecuted}</div>
              <div className="stat-label">Not Executed</div>
            </div>
            <AlertCircle className="icon gray" />
          </div>
        </div>
      </div>

      {/* Donut Chart for Pass/Fail/Not Exec */}
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Test Status Breakdown</h3>
          <DonutChart
            passed={totalStats.passed}
            failed={totalStats.failed}
            notExecuted={totalStats.notExecuted}
          />
        </div>

        {/* Highest Failure-Rate Test Cases */}
        <div className="chart-wrapper">
          <h3>Highest Failure-Rate Test Cases</h3>
          <BarChart
            width={500}
            height={300}
            data={highestFailureRateData}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="testCaseName"
              interval={0}
              tick={{ fontSize: 12 }}
              angle={-30} // Rotate labels
              textAnchor="end"
            />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="failRate"
              fill="#f44336"
              name="Fail Rate (%)"
              barSize={30}
              radius={[8, 8, 0, 0]} // Rounded corners
            />
          </BarChart>
        </div>
      </div>

      {/* Detailed test cases by document */}
      <TestCaseSection testResults={cleanjson} />
    </div>
  );
};

export default TestAnalytics;
