package com.test.test;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
        // Convert the start and end milliseconds to Instant, then to LocalDateTime
        LocalDateTime startTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(result.getStartMillis()), ZoneId.systemDefault());
        LocalDateTime endTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(result.getEndMillis()), ZoneId.systemDefault());

        // Define the desired format (e.g., "yyyy-MM-dd HH:mm:ss")
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Format the LocalDateTime into a string representation
        String formattedStartTime = startTime.format(formatter);
        String formattedEndTime = endTime.format(formatter);

        // Create and return the TestCaseResult object with formatted times
        return new TestCaseResult(formattedStartTime, formattedEndTime, success, errorMessage);
    }

    // Get the captured test case results
    public static List<TestCaseResult> getTestCaseResults() {
        return testCaseResults;
    }
    public static void clearResults() {
        // Clear the stored test results
        testCaseResults.clear();
    }
}
