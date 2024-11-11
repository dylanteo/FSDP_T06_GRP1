package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints
//@CrossOrigin(origins = "http://localhost:3001")
public class TestController {
    @Autowired
    private SeleniumService seleniumService;

    @Autowired
    private Login login; // Inject Login service

    @Autowired
    private Register register; // Inject Register service

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
        return login.runLogin("test", "test");
    }

    @GetMapping("/signup")
    public String signup(){
        return register.runRegister("hi", "hi","hi","hi","hi","hi","hi","hi","hi","hi");
    }

    @GetMapping("/react")
    public String sayHello() {
        return "Hello from Java backend!";
    }
}