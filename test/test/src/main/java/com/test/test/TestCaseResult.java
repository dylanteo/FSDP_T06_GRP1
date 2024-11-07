package com.test.test;

import java.time.LocalDateTime;
import java.util.UUID;

public class TestCaseResult {
    private String testCaseId; // Unique identifier for the test case result
    private String startTime; // Start time of the test
    private String endTime; // End time of the test
    private boolean success; // Indicates if the test was successful
    private String errorMessage; // Error message if the test failed

    // Constructor
    public TestCaseResult(String startTime, String endTime, boolean success, String errorMessage) {
        this.testCaseId = UUID.randomUUID().toString(); // Generate a unique ID
        this.startTime = startTime;
        this.endTime = endTime;
        this.success = success;
        this.errorMessage = errorMessage;
    }

    // Getters
    public String getTestCaseId() {
        return testCaseId;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
    @Override
    public String toString() {
        // Use StringBuilder to build the JSON array string
        StringBuilder result = new StringBuilder("[");

        result.append("{")
                .append("\"testCaseId\":\"").append(testCaseId).append("\",")
                .append("\"startTime\":\"").append(startTime).append("\",")
                .append("\"endTime\":\"").append(endTime).append("\",")
                .append("\"success\":").append(success).append(",")
                .append("\"errorMessage\":\"").append(errorMessage != null ? errorMessage : "null").append("\"")
                .append("}");

        result.append("]"); // Close the array
        return result.toString();
    }


}