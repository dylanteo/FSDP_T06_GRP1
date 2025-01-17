import React from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ testResults }) => {
  const lastItem = testResults[testResults.length - 1];
  const totalTests = lastItem.tests.length; // Initialize totalTests first
  const passedTests = lastItem.tests.filter(test => test.status === "pass");
  const failedTests = lastItem.tests.filter(test => test.status === "fail");
  const notExecuted = lastItem.tests.filter(test => test.status === "not");
  const stats = {
    total: totalTests, // Now totalTests is available
    passed: passedTests.length,
    failed: failedTests.length,
    notExecuted: notExecuted.length
  };

  console.log(JSON.stringify(lastItem, null, 2));



return (
    <div className="dashboard">


      {/* Main Content */}

        <div className="section-header">
          <h1 className="title">Latest Runs</h1>

          {/* Time Period Tabs */}
          <div className="tabs">
            <button className="tab active">Today</button>
            <button className="tab">This week</button>
            <button className="tab">This month</button>
            <button className="tab">This quarter</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <Activity className="icon blue" />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-number">{stats.passed}</div>
                <div className="stat-label">Passed</div>
              </div>
              <CheckCircle className="icon green" />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-number">{stats.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
              <XCircle className="icon red" />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-number">{stats.notExecuted}</div>
                <div className="stat-label">Not Executed</div>
              </div>
              <AlertCircle className="icon gray" />
            </div>
          </div>
        </div>

        {/* Review Sections */}
        <div className="review-grid">
          {/* Submitted for review */}
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

          {/* Assigned for review*/}
          {/*<div className="review-card">
            <h2 className="review-title">Assigned for your review</h2>
            <div className="tabs">
              <button className="tab active">Test Cases</button>
              <button className="tab">Elements</button>
            </div>
            <div className="empty-state">
              Relax, no Test Cases for review right now
            </div>
          </div>*/}
        </div>

    </div>
  );
};

export default Dashboard;