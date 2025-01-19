//import React, { useState } from 'react';
//import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
//
//const parseContent = (contentString) => {
//  try {
//    if (typeof contentString === 'string') {
//      console.log('contentString',contentString);
//      const cleanedString = contentString.replace(/\\r\\n/g, '')
//                                       .replace(/\\r/g, '')
//                                       .replace(/\\n/g, '')
//                                       .replace(/\s+/g, ' ')
//                                       .trim();
//      return JSON.parse(cleanedString);
//    }
//    return contentString;
//  } catch (e) {
//    console.error('Error parsing content:', e);
//    return [];
//  }
//};
//
//const calculateStats = (testData) => ({
//  total: testData.length,
//  passed: testData.filter((test) => test.status === 'pass').length,
//  failed: testData.filter((test) => test.status === 'fail').length,
//  notExecuted: testData.filter(
//    (test) => !test.status || test.status === 'not_executed'
//  ).length,
//});
//
//const filterByDate = (testResults, period) => {
//  const now = new Date();
//  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//  const startOfWeek = new Date(startOfToday);
//  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)
//  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
//  const startOfQuarter = new Date(
//    now.getFullYear(),
//    Math.floor(now.getMonth() / 3) * 3,
//    1
//  ); // Start of quarter
//
//  let filteredResults;
//  if (period === 'Last Test') {
//    filteredResults = [...testResults].sort((a, b) => new Date(a.date) - new Date(b.date));
//  } else {
//    let startDate;
//    switch (period) {
//      case 'Today':
//        startDate = startOfToday;
//        break;
//      case 'This Week':
//        startDate = startOfWeek;
//        break;
//      case 'This Month':
//        startDate = startOfMonth;
//        break;
//      case 'This Quarter':
//        startDate = startOfQuarter;
//        break;
//      default:
//        startDate = new Date(0); // Include all dates
//    }
//
//    filteredResults = testResults.filter((result) => {
//      const resultDate = new Date(result.date);
//      return resultDate >= startDate;
//    });
//  }
//
//  return filteredResults;
//};
//
//const Dashboard = ({ testResults }) => {
//  const [selectedPeriod, setSelectedPeriod] = useState('Today');
//
//  const filteredResults = filterByDate(testResults, selectedPeriod);
//  const content = filteredResults.map((item) => parseContent(item.content || '[]'));
//  //console.log(content);
//  const stats = content.map((contentItem) => calculateStats(contentItem));
//  const totalStats = stats.reduce(
//    (acc, curr) => {
//      acc.total += curr.total;
//      acc.passed += curr.passed;
//      acc.failed += curr.failed;
//      acc.notExecuted += curr.notExecuted;
//      return acc;
//    },
//    { total: 0, passed: 0, failed: 0, notExecuted: 0 }
//  );
//
//  return (
//    <div className="dashboard">
//      <div className="section-header">
//        <h1 className="title">Latest Runs</h1>
//
//        {/* Time Period Tabs */}
//        <div className="tabs">
//          {['Last Test','Today', 'This Week', 'This Month', 'This Quarter'].map((period) => (
//            <button
//              key={period}
//              className={`tab ${selectedPeriod === period ? 'active' : ''}`}
//              onClick={() => setSelectedPeriod(period)}
//            >
//              {period}
//            </button>
//          ))}
//        </div>
//      </div>
//
//      {/* Stats Grid */}
//      <div className="stats-grid">
//        <div className="stat-card">
//          <div className="stat-content">
//            <div>
//              <div className="stat-number">{totalStats.total}</div>
//              <div className="stat-label">Total</div>
//            </div>
//            <Activity className="icon blue" />
//          </div>
//        </div>
//
//        <div className="stat-card">
//          <div className="stat-content">
//            <div>
//              <div className="stat-number">{totalStats.passed}</div>
//              <div className="stat-label">Passed</div>
//            </div>
//            <CheckCircle className="icon green" />
//          </div>
//        </div>
//
//        <div className="stat-card">
//          <div className="stat-content">
//            <div>
//              <div className="stat-number">{totalStats.failed}</div>
//              <div className="stat-label">Failed</div>
//            </div>
//            <XCircle className="icon red" />
//          </div>
//        </div>
//
//        <div className="stat-card">
//          <div className="stat-content">
//            <div>
//              <div className="stat-number">{totalStats.notExecuted}</div>
//              <div className="stat-label">Not Executed</div>
//            </div>
//            <AlertCircle className="icon gray" />
//          </div>
//        </div>
//      </div>
//        <div className="review-grid">
//                {/* Submitted for review */}
//                <div className="review-card">
//                  <h2 className="review-title">Submitted for review</h2>
//                  <div className="tabs">
//                    <button className="tab active">Test Cases</button>
//                    <button className="tab">Elements</button>
//                  </div>
//                  <div className="empty-state">
//                    You have not submitted any Test Cases for review
//                  </div>
//                </div>
//                </div>
//    </div>
//  );
//};
//
//export default Dashboard;
import React, { useState } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const parseContent = (contentString) => {
  try {
  console.log(contentString);
    if (typeof contentString === 'string') {
      const cleanedString = contentString.replace(/\\r\\n/g, '')
                                       .replace(/\\r/g, '')
                                       .replace(/\\n/g, '')
                                       .replace(/\s+/g, ' ')
                                       .trim();
      return JSON.parse(cleanedString);
    }
    return contentString;
  } catch (e) {
    console.error('Error parsing content:', e);
    return [];
  }
};

const calculateStats = (tests) => {
  if (!Array.isArray(tests)) {
    tests = [tests]; // Convert single test to array
  }

  return {
    total: tests.length,
    passed: tests.filter((test) => test.status === 'pass').length,
    failed: tests.filter((test) => test.status === 'fail').length,
    notExecuted: tests.filter(
      (test) => !test.status || test.status === 'not_executed'
    ).length,
  };
};

const filterByDate = (testResults, period) => {
  if (!testResults || !testResults.length) return [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );

  let filteredResults;
  if (period === 'Last Test') {
    // Sort by startTime in descending order and take the first result
    filteredResults = [...testResults].sort((a, b) => {
      const aContent = parseContent(a.content);
      const bContent = parseContent(b.content);
      return new Date(bContent[0]?.startTime) - new Date(aContent[0]?.startTime);
    }).slice(0, 1);
  } else {
    let startDate;
    switch (period) {
      case 'Today':
        startDate = startOfToday;
        break;
      case 'This Week':
        startDate = startOfWeek;
        break;
      case 'This Month':
        startDate = startOfMonth;
        break;
      case 'This Quarter':
        startDate = startOfQuarter;
        break;
      default:
        return testResults;
    }

    filteredResults = testResults.filter((result) => {
      const content = parseContent(result.content);
      const testDate = new Date(content[0]?.date);
      return testDate >= startDate;
    });
  }

  return filteredResults;
};

const Dashboard = ({ testResults }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');

  // Filter and process results
  const filteredResults = filterByDate(testResults, selectedPeriod);
  const content = filteredResults.map((item) => parseContent(item.content));

  // Calculate total stats from all filtered results
  const totalStats = content.reduce(
    (acc, curr) => {
      const stats = calculateStats(curr);
      return {
        total: acc.total + stats.total,
        passed: acc.passed + stats.passed,
        failed: acc.failed + stats.failed,
        notExecuted: acc.notExecuted + stats.notExecuted
      };
    },
    { total: 0, passed: 0, failed: 0, notExecuted: 0 }
  );

  return (
    <div className="dashboard">
      <div className="section-header">
        <h1 className="title">Latest Runs</h1>

        <div className="tabs">
          {['Last Test', 'Today', 'This Week', 'This Month', 'This Quarter'].map((period) => (
            <button
              key={period}
              className={`tab ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

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

      <div className="review-grid">
        <div className="review-card">
          <h2 className="review-title">Submitted for review</h2>
          <div className="tabs">
            <button className="tab active">Test Cases</button>
            <button className="tab">Elements</button>
          </div>
          <div className="empty-state">
            You have not submitted any Test Cases for review
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;