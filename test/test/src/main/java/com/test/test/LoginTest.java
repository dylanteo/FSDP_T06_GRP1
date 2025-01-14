//package com.test.test;
//
//import org.testng.annotations.DataProvider;
//import org.testng.annotations.Test;
//
//import java.time.LocalDateTime;
//import java.util.*;
//
//public class LoginTest {
//    private static Map<String, List<LoginTestCase>> groupedTestCases = new HashMap<>();
//
//    public static void setGroupedTestCases(Map<String, List<LoginTestCase>> testCases) {
//        groupedTestCases = testCases;
//    }
//
//    public static Map<String, List<LoginTestCase>> getGroupedTestCases() {
//        return groupedTestCases;
//    }
//
//    // Define a DataProvider that supplies test data
//    @DataProvider(name = "loginDataProvider")
//    public static Object[][] loginDataProvider() {
//        // Retrieve the grouped test cases from the static method
//        Map<String, List<LoginTestCase>> groupedTestCases = LoginTest.getGroupedTestCases();
//        System.out.println("Grouped Test Cases Size: " + groupedTestCases.size());
//        groupedTestCases.forEach((browser, testCases) ->
//                System.out.println("Browser: " + browser + ", Test Cases Count: " + testCases.size())
//        );
//        // Create a 2D array to pass to the DataProvider
//        List<Object[]> data = new ArrayList<>();
//
//        // Populate the data array with test cases for each browser
//        for (Map.Entry<String, List<LoginTestCase>> entry : groupedTestCases.entrySet()) {
//            String browser = entry.getKey();
//            for (LoginTestCase testCase : entry.getValue()) {
//                data.add(new Object[]{testCase.getUserName(), testCase.getPassWord(), browser});
//            }
//        }
//
//        // Convert to 2D array (required by TestNG DataProvider)
//        return data.toArray(new Object[0][0]);
//    }
//
//    // The test method
//    @Test(dataProvider = "loginDataProvider")
//    public void testLogin(String username, String password, String browser) {
//        System.out.println("Running login test with the following data:");
//        System.out.println("Username: " + username);
//        System.out.println("Password: " + password);
//        System.out.println("Browser: " + browser);
//
//        String startTime = LocalDateTime.now().toString();
//        boolean success = false;
//        String errorMessage = null;
//
//        try {
//            String result = Login.runLogin(username, password, browser);
//            System.out.println("Test Result: " + result);
//
//            // Check the result to set success based on actual outcome
//            success = result.equalsIgnoreCase("Success"); // Adjust according to expected success criteria
//            if (!success) {
//                errorMessage = "Login failed due to incorrect credentials or other issues.";
//            }
//        } catch (Exception e) {
//            errorMessage = e.getMessage();
//            System.out.println("Error: " + errorMessage);
//        }
//
//        String endTime = LocalDateTime.now().toString();
//
//        // Output results
//        System.out.println("Test Case ID: " + UUID.randomUUID().toString());
//        System.out.println("Start Time: " + startTime);
//        System.out.println("End Time: " + endTime);
//        System.out.println("Success: " + success);
//        System.out.println("Error Message: " + (errorMessage != null ? errorMessage : "No errors"));
//    }
//}