package com.test.test;

import java.time.LocalDateTime;
import java.util.UUID;

public class TestCaseResult {
    private String id; // Unique identifier for the test case result
    private String startTime; // Start time of the test
    private String endTime; // End time of the test
    private boolean success; // Indicates if the test was successful
    private String errorMessage; // Error message if the test failed

    // Constructor
    public TestCaseResult(String startTime, String endTime, boolean success, String errorMessage) {
        this.id = UUID.randomUUID().toString(); // Generate a unique ID
        this.startTime = startTime;
        this.endTime = endTime;
        this.success = success;
        this.errorMessage = errorMessage;
    }

    // Getters
    public String getId() {
        return id;
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
}