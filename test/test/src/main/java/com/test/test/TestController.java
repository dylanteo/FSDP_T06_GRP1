package com.test.test;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;



import java.math.BigDecimal;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Controller
@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints


public class TestController {
    @Autowired
    private SeleniumService seleniumService;

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
    public String test(@RequestParam String username, @RequestParam String password){
        return Login.runLogin(username, password);
    }

    @GetMapping("/react")
    public String sayHello() {
        return "Hello from Java backend!";
    }

    @PostMapping("/run-tests")
    public ResponseEntity<Map<String, Object>> runTests(@RequestBody List<Map<String, String>> testCases) {
        List<String> results = seleniumService.runTests(testCases); // Pass the test cases to Selenium
        Map<String, Object> response = new HashMap<>();
        response.put("results", results);
        return ResponseEntity.ok(response);

    }
    @GetMapping("/run-tests1")
    public List<String> runTests1() {
        List<Map<String, String>> testDataList = new ArrayList<>();

        Map<String, String> data1 = new HashMap<>();
        data1.put("username", "yanhui");
        data1.put("password", "yanhui");
        testDataList.add(data1);

        Map<String, String> data2 = new HashMap<>();
        data2.put("username", "asdasd");
        data2.put("password", "asdasd");
        testDataList.add(data2);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Run tests using runTest1 and retrieve detailed results
        List<String> results = new ArrayList<>();
        for (Map<String, String> data : testDataList) {
            String result = seleniumService.runTest1(data.get("username"), data.get("password"), formatter);
            results.add(result);
        }
        return results;
    }
    @GetMapping("/run-tests2")
    public List<String> runTests2() {
        List<Map<String, String>> testDataList = seleniumService.readTestDataFromCSV(); // Get test data from CSV
        List<String> results = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Map<String, String> data : testDataList) {
            String username = data.get("username");
            String password = data.get("password");

            System.out.println("Running test with username: " + username + " and password: " + password);

            String result = seleniumService.runTest1(username, password,formatter);
            results.add(result); // Collect result for each test case
        }

        return results;
    }
    @PostMapping(value = "/run-tests", consumes = "text/csv")
    public ResponseEntity<List<String>> runTests(@RequestBody String csvData) {
        List<LoginTestCase> testCases = parseCsvToTestCases(csvData); // Parse CSV to LoginTestCase objects
        List<String> results = seleniumService.runTestsFromLoginTestCases(testCases); // Run Selenium tests with the parsed cases
        return ResponseEntity.ok(results); // Return the results
    }

    private List<LoginTestCase> parseCsvToTestCases(String csvData) {
        List<LoginTestCase> result = new ArrayList<>();
        String[] lines = csvData.split("\n");

        // Assuming the first line is the header
        String[] headers = lines[0].split(",");
        int userNameIndex = -1;
        int passWordIndex = -1;

        // Identify the index of userName and passWord
        for (int i = 0; i < headers.length; i++) {
            if ("userName".equalsIgnoreCase(headers[i])) {
                userNameIndex = i;
            } else if ("passWord".equalsIgnoreCase(headers[i])) {
                passWordIndex = i;
            }
        }

        for (int i = 1; i < lines.length; i++) {
            String[] values = lines[i].split(",");
            if (values.length > Math.max(userNameIndex, passWordIndex)) { // Check for index validity
                String userName = values[userNameIndex];
                String passWord = values[passWordIndex];
                LoginTestCase testCase = new LoginTestCase(userName, passWord);
                result.add(testCase);
            }
        }
        return result;
    }

}
