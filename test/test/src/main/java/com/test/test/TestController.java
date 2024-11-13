package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.testng.ITestListener;
import org.testng.TestListenerAdapter;
import org.testng.TestNG;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
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

    // Inject the TestCaseOutputRepository to save results to MongoDB
    @Autowired
    private TestCaseOutputRepository testCaseOutputRepository;

    // Inject SimpMessagingTemplate for WebSocket broadcasting
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Helper method to save and broadcast test results
    private void saveAndBroadcastResult(TestCaseOutput testCaseOutput) {
        // Save the result to MongoDB
        testCaseOutputRepository.save(testCaseOutput);

        // Broadcast the result to WebSocket clients
        messagingTemplate.convertAndSend("/topic/testResults", testCaseOutput);
    }

    // New endpoint to retrieve all test results from MongoDB
    @GetMapping("/getTestResults")
    public List<TestCaseOutput> getTestResults() {
        // This will fetch all documents from the testCaseOutputs collection
        return testCaseOutputRepository.findAll();
    }

    @GetMapping("/hello")
    public String hello() {
        return "hello"; // This will look for hello.html in src/main/resources/templates
    }

    @GetMapping("/test")
    public String greeting() {
        return "test"; // This will look for greeting.html in src/main/resources/templates
    }

    @GetMapping("/testingForgotLoginInfo")
    public String testForgotLoginInfo() {
        String result;
        String consoleOutput = "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try {
            String startTime = LocalDateTime.now().format(formatter);

            // Capture terminal output
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream ps = new PrintStream(baos);
            PrintStream originalOut = System.out;
            System.setOut(ps);

            // Run the test
            result = forgetLogin.runForgotLoginInfo("chrome");
            consoleOutput = baos.toString();
            System.setOut(originalOut);

            boolean success = result.contains("successfully");

            String endTime = LocalDateTime.now().format(formatter);
            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("ForgotLoginInfoTest");
            testCaseOutput.setStartTime(startTime);
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus(success ? "Success" : "Failure");
            testCaseOutput.setTimeTaken(5000); // Replace with actual time calculation if possible
            testCaseOutput.setErrorMessage(success ? "No Error" : consoleOutput);

            saveAndBroadcastResult(testCaseOutput);
            return result;
        } catch (Exception e) {
            consoleOutput = e.getMessage();
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("ForgotLoginInfoTest");
            testCaseOutput.setStartTime(LocalDateTime.now().format(formatter));
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus("Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage("Exception: " + e.getMessage() + "\nConsole Output:\n" + consoleOutput);

            saveAndBroadcastResult(testCaseOutput);
            return "Error running Forgot Login Info test: " + e.getMessage();
        }
    }

    @GetMapping("/testinglogin")
    public String test() {
        String result;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try {
            String startTime = LocalDateTime.now().format(formatter);
            result = login.runLogin("A", "A", "firefox");

            boolean success = result.contains("successfully");
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("LoginTest");
            testCaseOutput.setStartTime(startTime);
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus(success ? "Success" : "Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage(success ? "No Error" : result);

            saveAndBroadcastResult(testCaseOutput);
            return result;
        } catch (Exception e) {
            String consoleOutput = e.getMessage();
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("LoginTest");
            testCaseOutput.setStartTime(LocalDateTime.now().format(formatter));
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus("Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage("Exception: " + e.getMessage());

            saveAndBroadcastResult(testCaseOutput);
            return "Error running Login test: " + e.getMessage();
        }
    }

    @GetMapping("/signup")
    public String signup() {
        String result;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try {
            String startTime = LocalDateTime.now().format(formatter);
            result = register.runRegister("hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "chrome");

            boolean success = result.contains("successfully");
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("SignupTest");
            testCaseOutput.setStartTime(startTime);
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus(success ? "Success" : "Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage(success ? "No Error" : result);

            saveAndBroadcastResult(testCaseOutput);
            return result;
        } catch (Exception e) {
            String consoleOutput = e.getMessage();
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("SignupTest");
            testCaseOutput.setStartTime(LocalDateTime.now().format(formatter));
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus("Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage("Exception: " + e.getMessage());

            saveAndBroadcastResult(testCaseOutput);
            return "Error running Signup test: " + e.getMessage();
        }
    }

    @GetMapping("/openaccount")
    public String openaccount() {
        String result;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try {
            String startTime = LocalDateTime.now().format(formatter);
            result = openAccount.runOpenNewAccount("hi", "hi", "SAVINGS", "15120", "chrome");

            boolean success = result.contains("successfully");
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("OpenAccountTest");
            testCaseOutput.setStartTime(startTime);
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus(success ? "Success" : "Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage(success ? "No Error" : result);

            saveAndBroadcastResult(testCaseOutput);
            return result;
        } catch (Exception e) {
            String consoleOutput = e.getMessage();
            String endTime = LocalDateTime.now().format(formatter);

            TestCaseOutput testCaseOutput = new TestCaseOutput();
            testCaseOutput.setTestCaseId("OpenAccountTest");
            testCaseOutput.setStartTime(LocalDateTime.now().format(formatter));
            testCaseOutput.setEndTime(endTime);
            testCaseOutput.setStatus("Failure");
            testCaseOutput.setTimeTaken(5000);
            testCaseOutput.setErrorMessage("Exception: " + e.getMessage());

            saveAndBroadcastResult(testCaseOutput);
            return "Error running OpenAccount test: " + e.getMessage();
        }
    }

    @GetMapping("/react")
    public String sayHello() {
        return "Hello from Java backend!";
    }

    @GetMapping("/managerLogin")
    public String managerLogin() {
        return admin.runBankManagerLogin("chrome");
    }

    @GetMapping("/addcustomer")
    public String addCustomer() {
        return admin.runAddCustomer("chrome", "yes", "yes", "yes");
    }

    @GetMapping("/addcustomer1")
    public String addCustomer1() {
        String result1 = admin.runAddCustomer("chrome", "yes", "yes", "yes");
        String result2 = admin.runAddCustomer("chrome", "yes", "yes", "yes");
        return "First run result: " + result1 + "<br>" + "Second run result: " + result2;
    }

    // Updated calculateTimeDifference to return long
    private long calculateTimeDifference(String startTime, String endTime) {
        Instant start = Instant.parse(startTime);
        Instant end = Instant.parse(endTime);
        return java.time.Duration.between(start, end).toMillis();
    }

    private void resetTestState() {
        TestResultListener.clearResults();
        LoginTest.setGroupedTestCases(new HashMap<>());
        testResults.clear();
    }
}
