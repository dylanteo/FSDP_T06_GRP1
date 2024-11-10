package com.test.test;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class LoginTest {

    // Define a DataProvider that supplies test data
    @DataProvider(name = "loginDataProvider")
    public Object[][] loginDataProvider() {
        // Here we call the backend to get the latest test cases
        List<LoginTestCase> loginTestCases = getLoginTestCasesFromBackend();

        // Convert the list to a 2D array required by TestNG DataProvider
        Object[][] data = new Object[loginTestCases.size()][3];

        // Fill the data array with the test case data
        for (int i = 0; i < loginTestCases.size(); i++) {
            LoginTestCase testCase = loginTestCases.get(i);
            data[i][0] = testCase.getUserName();  // username
            data[i][1] = testCase.getPassWord();  // password
            data[i][2] = testCase.getBrowser();   // browser
        }

        return data;
    }

    // Fetch login test cases from the backend (mocked here for simplicity)
    private List<LoginTestCase> getLoginTestCasesFromBackend() {
        // You can replace this with a call to the Spring Boot API to fetch data
        // For example, using RestTemplate to make a call to your backend:

        // Mocking data here for demonstration purposes
        List<LoginTestCase> testCases = new ArrayList<>();
        testCases.add(new LoginTestCase("user1", "password1", "chrome"));
        testCases.add(new LoginTestCase("user2", "password2", "firefox"));
        testCases.add(new LoginTestCase("user3", "password3", "edge"));
        // Fetch real data from backend if needed
        return testCases;
    }

    // Use the DataProvider in your test method
    @Test(dataProvider = "loginDataProvider")
    public void testLogin(String username, String password, String browser) {
        System.out.println("Running login test with the following data:");
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);
        System.out.println("Browser: " + browser);

        // Record the start time of the test
        String startTime = LocalDateTime.now().toString();

        // Variables to store the success/failure and error message
        boolean success = false;
        String errorMessage = null;

        try {
            // Your login test logic here (using the browser, username, and password)
            String result = Login.runLogin(username, password, browser);
            System.out.println("Test Result: " + result);
            success = true; // If no exception occurs, the test is successful
        } catch (Exception e) {
            errorMessage = e.getMessage(); // Capture any error message if the test fails
            System.out.println("Error: " + errorMessage);
        }

        // Record the end time of the test
        String endTime = LocalDateTime.now().toString();

        // Print out the results to the console
        System.out.println("Test Case ID: " + UUID.randomUUID().toString());
        System.out.println("Start Time: " + startTime);
        System.out.println("End Time: " + endTime);
        System.out.println("Success: " + success);
        System.out.println("Error Message: " + errorMessage);

        // Return the TestCaseResult object with details of the test execution
        // This will be used in the controller to collect all results
        //return new TestCaseResult(startTime, endTime, success, errorMessage);
    }

}