package com.test.test;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// Mark this class as a MongoDB document and specify the collection name
@Document(collection = "testCaseOutputs")
public class TestCaseOutput {

    @Id // This annotation marks the field as the primary key for MongoDB
    private String id;

    private String testCaseId;
    private String startTime;
    private String endTime;
    private long timeTaken;
    private String status;
    private String errorMessage;

    // Default constructor (required for MongoDB and Spring)
    public TestCaseOutput() {}

    // Parameterized constructor
    public TestCaseOutput(String testCaseId, String startTime, String endTime, long timeTaken, String status, String errorMessage) {
        this.testCaseId = testCaseId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.timeTaken = timeTaken;
        this.status = status;
        this.errorMessage = errorMessage;
    }

    // Getters and setters for each field

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(String testCaseId) {
        this.testCaseId = testCaseId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public long getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(long timeTaken) {
        this.timeTaken = timeTaken;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    // Optional: Override toString() for easier debugging and logging

    @Override
    public String toString() {
        return "TestCaseOutput{" +
                "id='" + id + '\'' +
                ", testCaseId='" + testCaseId + '\'' +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", timeTaken=" + timeTaken +
                ", status='" + status + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                '}';
    }
}