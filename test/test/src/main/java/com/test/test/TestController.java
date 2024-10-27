package com.test.test;

import com.test.test.SeleniumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
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
    @ResponseBody
    public String runSeleniumTest(@RequestParam String username, @RequestParam String password) {
        // Capture the result of the Selenium test
        String result = seleniumService.runTest(username, password); // Pass the credentials to the Selenium service
        return result; // Return the result to be printed in the response
    }
}
