package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.testng.ITestListener;
import org.testng.TestListenerAdapter;
import org.testng.TestNG;




import java.util.*;
import java.util.stream.Collectors;
@Controller
@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints
public class TestController {

    @Autowired
    private SeleniumService seleniumService;
    private static List<TestCaseResult> testResults = new ArrayList<>();
    private static List<LoginTestCase> loginTestCases = new ArrayList<>();

    @Autowired
    private Login login; // Inject Login service

    @Autowired
    private Register register; // Inject Register service

    @Autowired
    private OpenAccount openAccount;

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



    @GetMapping("/testingForgotLoginInfo")
    public String testForgotLoginInfo() {
        return forgetLogin.runForgotLoginInfo("chrome"); // Run the "Forgot Login Info" test
    }
    @GetMapping("/testinglogin")
    public String test(){
        return Login.runLogin("hi", "hi","chrome");
    }

    @GetMapping("/signup")
    public String signup(){
        return register.runRegister("hi", "hi","hi","hi","hi","hi","hi","hi","hi","hi","chrome");
    }

    @GetMapping("/openaccount")
    public String openaccount(){
        return openAccount.runOpenNewAccount("hi","hi", "SAVINGS", "15120","chrome");
    }

    @GetMapping("/react")
    public String sayHello() {
        return "Hello from Java backend!";
    }

    @GetMapping("/managerLogin")
    public String managerLogin(){
        return admin.runBankManagerLogin("chrome");
    }
    @GetMapping("/addcustomer")
    public String addCustomer(){
        return admin.runAddCustomer("chrome","yes","yes","yes");
    }
    @GetMapping("/addcustomer1")
    public String addCustomer1(){
        // Run the test twice
        String result1 = admin.runAddCustomer("chrome", "yes", "yes", "yes");
        String result2 = admin.runAddCustomer("chrome", "yes", "yes", "yes");

        // Combine the results into a single string
        return "First run result: " + result1 + "<br>" + "Second run result: " + result2;
    }

//    @PostMapping("/testinglogin1")
//    public ResponseEntity<List<TestCaseResult>> testLogin(@RequestBody List<LoginTestCase> loginRequests) {
//        // Create a list to store results
//        List<TestCaseResult> results = new ArrayList<>();
//        System.out.println("testing start" );
//
//        // Process each loginRequest
//        for (LoginTestCase loginRequest : loginRequests) {
//            System.out.println("Received username: " + loginRequest.getUserName());
//            System.out.println("Received password: " + loginRequest.getPassWord());
//
//            // Run the login test and collect the result
//            TestCaseResult result = Login.runLogin1(loginRequest.getUserName(), loginRequest.getPassWord(),"chrome");
//
//            // Add the result to the list
//            results.add(result);
//        }
//
//        // Return the list as JSON
//        return ResponseEntity.ok(results);
//    }

    @PostMapping("/testinglogin3")
    public ResponseEntity<List<TestCaseResult>> testLogin3(@RequestBody List<LoginTestCase> loginRequests) {
        try {
            // Group test cases by browser
            resetTestState();
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
    private void resetTestState() {
        // Clear the test results and any stored data
        TestResultListener.clearResults(); // Assuming you have a method in TestResultListener to clear results
        LoginTest.setGroupedTestCases(new HashMap<>()); // Reset the grouped test cases
        testResults.clear(); // Clear the test results list
    }
    @GetMapping("/run-suite")
    public String runTestSuite() {
        // Specify the path to your TestNG XML suite file
        String testNgXmlPath = "../FSDP_T06_GRP1/test/test/testng.xml"; // Update this path

        TestNG testNG = new TestNG();
        testNG.setTestSuites(Collections.singletonList(testNgXmlPath));

        // Run the TestNG suite
        testNG.run();

        return "Test suite execution started using TestNG XML suite file.";
    }
    @PostMapping("/run-test1")
    public String runTest1(@RequestBody Map<String, List<Map<String, String>>> requestData) {
        List<Map<String, String>> testData = requestData.get("testData");

        // Iterate over each row of test data
        for (Map<String, String> row : testData) {
            String browser = row.get("browser");
            String firstName = row.get("firstName");
            String lastName = row.get("lastName");
            String postCode = row.get("postCode");

            // Run the TestNG test
            TestNG testng = new TestNG();
            testng.setTestClasses(new Class[] { Testng.class });
            testng.setGroups("test1"); // Run only the test1 group

            // Set browser parameter dynamically (can also handle other parameters)
            System.setProperty("browser", browser);

            // Optionally, set additional parameters for firstName, lastName, postCode as needed
            System.setProperty("firstName", firstName);
            System.setProperty("lastName", lastName);
            System.setProperty("postCode", postCode);

            testng.run();  // Run the TestNG test
        }

        return "Test 1 completed";
    }
}