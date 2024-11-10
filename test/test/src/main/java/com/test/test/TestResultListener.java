package com.test.test;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TestResultListener implements ITestListener {

    // List to store the test results
    private static final List<TestCaseResult> testCaseResults = new ArrayList<>();

    @Override
    public void onTestStart(ITestResult result) {
        // No need to track the start time here
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        // Capture the success result with start time and end time
        testCaseResults.add(createTestCaseResult(result, true, null));
    }

    @Override
    public void onTestFailure(ITestResult result) {
        // Capture the failure result with the error message
        testCaseResults.add(createTestCaseResult(result, false, result.getThrowable().getMessage()));
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        // Optionally, handle skipped tests if needed
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
        // Optionally, handle tests that failed but are still within success percentage
    }

    @Override
    public void onStart(ITestContext context) {
        // Optionally, handle the start of the test suite
    }

    @Override
    public void onFinish(ITestContext context) {
        // Optionally, handle the finish of the test suite
    }

    // Helper method to create a TestCaseResult object
    private TestCaseResult createTestCaseResult(ITestResult result, boolean success, String errorMessage) {
        String startTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(result.getStartMillis()), java.time.ZoneId.systemDefault()).toString();
        String endTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(result.getEndMillis()), java.time.ZoneId.systemDefault()).toString();
        return new TestCaseResult(startTime, endTime, success, errorMessage);
    }

    // Get the captured test case results
    public static List<TestCaseResult> getTestCaseResults() {
        return testCaseResults;
    }
}
