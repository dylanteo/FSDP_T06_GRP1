package com.test.test;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Controller
@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints
//@CrossOrigin(origins = "http://localhost:3001")
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
    public String test(){
        return Login.runLogin("test", "test");
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
            TestCaseResult result = Login.runLogin1(loginRequest.getUserName(), loginRequest.getPassWord());

            // Add the result to the list
            results.add(result);
        }

        // Return the list as JSON
        return ResponseEntity.ok(results);
    }

}