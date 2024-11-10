package com.test.test;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.testng.ITestListener;
import org.testng.TestListenerAdapter;
import org.testng.TestNG;


import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints
//@CrossOrigin(origins = "http://localhost:3001")
public class TestController {
    @Autowired
    private SeleniumService seleniumService;
    private static List<TestCaseResult> testResults = new ArrayList<>();
    private static List<LoginTestCase> loginTestCases = new ArrayList<>();

    @GetMapping("/hello")
    public String hello() {
        return "hello"; // This will look for hello.html in src/main/resources/templates
    }

    @GetMapping("/test")
    public String greeting() {
        return "test"; // This will look for greeting.html in src/main/resources/templates
    }

    /*@GetMapping("/selenium")
    public String runSeleniumTest(@RequestParam String username, @RequestParam String password) {
        // Run the Selenium test with the provided username and password
        return seleniumService.runTest(username);
    }*/
    @GetMapping("/testinglogin")
    public String test(){
        return Login.runLogin("test", "test","chrome");
    }

    @GetMapping("/react")
    public String sayHello() {
        return "Hello from Java backend!";
    }


    @PostMapping("/testinglogin1")
    public ResponseEntity<List<TestCaseResult>> testLogin(@RequestBody List<LoginTestCase> loginRequests) {
        // Create a list to store results
        List<TestCaseResult> results = new ArrayList<>();
        System.out.println("testing start" );

        // Process each loginRequest
        for (LoginTestCase loginRequest : loginRequests) {
            System.out.println("Received username: " + loginRequest.getUserName());
            System.out.println("Received password: " + loginRequest.getPassWord());

            // Run the login test and collect the result
            TestCaseResult result = Login.runLogin1(loginRequest.getUserName(), loginRequest.getPassWord(),"chrome");

            // Add the result to the list
            results.add(result);
        }

        // Return the list as JSON
        return ResponseEntity.ok(results);
    }
    @PostMapping("/testinglogin3")
    public ResponseEntity<List<TestCaseResult>> testLogin3(@RequestBody List<LoginTestCase> loginRequests) {
        try {
            // Group test cases by browser
            Map<String, List<LoginTestCase>> groupedTestCases = loginRequests.stream()
                    .collect(Collectors.groupingBy(LoginTestCase::getBrowser));

            // Store the grouped test cases in a static variable for access by DataProvider
            LoginTest.setGroupedTestCases(groupedTestCases);

            // Create a TestNG instance
            TestNG testng = new TestNG();

            // Add the TestResultListener to the TestNG suite
            TestResultListener resultListener = new TestResultListener();
            testng.addListener((ITestListener) resultListener); // Register the listener

            // Set the TestNG XML suite (make sure the path is correct)
            testng.setTestSuites(Collections.singletonList("../FSDP_T06_GRP1/test/test/testng.xml"));

            // Run the tests
            testng.run();

            // Retrieve the test results
            List<TestCaseResult> results = TestResultListener.getTestCaseResults();

            // Return the test results in the response
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            // Return an error response if something goes wrong
            return ResponseEntity.status(500).body(null);
        }
    }
    // Trigger TestNG programmatically
    private List<TestCaseResult> runTestNg() {
        List<TestCaseResult> testResults = new ArrayList<>();

        try {
            // Create a TestNG instance
            TestNG testng = new TestNG();

            // Add the test cases from `loginTestCases` list
            for (LoginTestCase loginRequest : loginTestCases) {
                TestCaseResult result = Login.runLogin1(loginRequest.getUserName(), loginRequest.getPassWord(), loginRequest.getBrowser());
                testResults.add(result); // Collect the test result
            }

            // Run the tests
            testng.run();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return testResults;
    }


    // Method to retrieve test cases for TestNG (used in your TestNG DataProvider)
    public static List<LoginTestCase> getLoginTestCases() {
        return loginTestCases;
    }
}