package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController // Use @RestController to directly return JSON responses
@RequestMapping("/api") // Set a base URL path for all endpoints
public class TestController {

    @Autowired
    private Login login; // Inject Login service

    @Autowired
    private Register register; // Inject Register service

    @Autowired
    private OpenAccount openAccount;

    @Autowired
    private forgetLogin forgetLogin; // Inject forgetLogin service

    @Autowired
    private admin admin; // Inject admin service

    // Endpoint to retrieve all test results from MongoDB
    @Autowired
    private TestCaseOutputRepository testCaseOutputRepository;

    @GetMapping("/getTestResults")
    public List<TestCaseOutput> getTestResults() {
        return testCaseOutputRepository.findAll();
    }

    @GetMapping("/testingForgotLoginInfo")
    public String testForgotLoginInfo() {
        return forgetLogin.runForgotLoginInfo("chrome");
    }

    @GetMapping("/testinglogin")
    public String testLogin() {
        return login.runLogin("A", "A", "firefox");
    }

    @GetMapping("/signup")
    public String signup() {
        return register.runRegister("hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "chrome");
    }

    @GetMapping("/openaccount")
    public String openAccount() {
        return openAccount.runOpenNewAccount("A", "A", "CHECKING", "14121", "chrome");
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
}