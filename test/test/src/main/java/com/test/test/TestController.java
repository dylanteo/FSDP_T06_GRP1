package com.test.test;

import com.test.test.SeleniumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints
@CrossOrigin(origins = "http://localhost:3001")
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

    @GetMapping("/selenium")
    public String runSeleniumTest(@RequestParam String username, @RequestParam String password) {
        // Run the Selenium test with the provided username and password
        return seleniumService.runTest(username, password);
    }
    @GetMapping("/react")
    public String sayHello() {
        return "Hello from Java backend!";
    }

    @GetMapping("/run-tests")
    public List<String> runTests() {
        List<Map<String, String>> testDataList = new ArrayList<>();

        Map<String, String> data1 = new HashMap<>();
        data1.put("username", "user1");
        data1.put("password", "pass1");
        testDataList.add(data1);

        Map<String, String> data2 = new HashMap<>();
        data2.put("username", "user2");
        data2.put("password", "pass2");
        testDataList.add(data2);

        // Add more test data as needed

        // Run tests and retrieve detailed results
        return seleniumService.runTests(testDataList);
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

}
