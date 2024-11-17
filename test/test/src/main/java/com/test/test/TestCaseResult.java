package com.test.test;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.UUID;

public class TestCaseResult {
    private String testCaseId; // Unique identifier for the test case result
    private String startTime; // Start time of the test
    private String endTime; // End time of the test
    private boolean success; // Indicates if the test was successful
    private String errorMessage; // Error message if the test failed
    private long timeTaken; // Time taken in seconds


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

    private long calculateTimeTaken(String starttime, String endtime) {
        if (starttime == null || starttime.isEmpty() || endtime == null || endtime.isEmpty()) {
            throw new IllegalArgumentException("Start time or end time cannot be empty");
        }

        // Try parsing the start and end times with the default format
        try {
            LocalDateTime start = LocalDateTime.parse(starttime);
            LocalDateTime end = LocalDateTime.parse(endtime);

            // Calculate the duration between start and end
            Duration duration = Duration.between(start, end);

            // Return the time taken in seconds
            return duration.toSeconds();
        } catch (DateTimeParseException e) {
            // Handle invalid date format by throwing an exception or logging an error
            throw new IllegalArgumentException("Invalid date-time format for start or end time", e);
        }
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
    public String toString1() {
        return "<testcase>\n" +
                "    <starttime>" + this.startTime + "</starttime>\n" +
                "    <endtime>" + this.endTime + "</endtime>\n" +
                "    <success>" + this.success + "</success>\n" +
                "    <result>" + this.success + "</result>\n" +
                "    <timeTaken>" + calculateTimeTaken(this.startTime,this.endTime) + " seconds</timeTaken>\n" +
                "    <error>" + this.errorMessage+"<error>\n"+
                "</testcase>";
    }


}