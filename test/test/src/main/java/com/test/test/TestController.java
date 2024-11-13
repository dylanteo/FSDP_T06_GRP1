package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Controller
@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private SeleniumService seleniumService;

    @Autowired
    private Login login;

    @Autowired
    private Register register;

    @Autowired
    private OpenAccount openAccount;

    @Autowired
    private forgetLogin forgetLogin;

    @Autowired
    private admin admin;

    @Autowired
    private TestCaseOutputRepository testCaseOutputRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private void saveAndBroadcastResult(TestCaseOutput testCaseOutput) {
        testCaseOutputRepository.save(testCaseOutput);
        messagingTemplate.convertAndSend("/topic/testResults", testCaseOutput);
    }

    @GetMapping("/getTestResults")
    public List<TestCaseOutput> getTestResults() {
        return testCaseOutputRepository.findAll();
    }

    @GetMapping("/testingForgotLoginInfo")
    public String testForgotLoginInfo() {
        String result = forgetLogin.runForgotLoginInfo("chrome");
        saveTestResult("ForgotLoginInfoTest", result);
        return result;
    }

    @GetMapping("/testinglogin")
    public String testLogin() {
        String result = login.runLogin("B", "A", "firefox");
        saveTestResult("LoginTest", result);
        return result;
    }

    @GetMapping("/signup")
    public String signup() {
        String result = register.runRegister("hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "hi", "chrome");
        saveTestResult("SignupTest", result);
        return result;
    }

    @GetMapping("/openaccount")
    public String openaccount() {
        String result = openAccount.runOpenNewAccount("hi", "hi", "SAVINGS", "15120", "chrome");
        saveTestResult("OpenAccountTest", result);
        return result;
    }

    @GetMapping("/managerLogin")
    public String managerLogin() {
        String result = admin.runBankManagerLogin("chrome");
        saveTestResult("ManagerLoginTest", result);
        return result;
    }

    @GetMapping("/addcustomer")
    public String addCustomer() {
        String result = admin.runAddCustomer("chrome", "yes", "yes", "yes");
        saveTestResult("AddCustomerTest", result);
        return result;
    }

    private void saveTestResult(String testCaseId, String result) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String startTime = LocalDateTime.now().format(formatter);
        String endTime = LocalDateTime.now().format(formatter);
        boolean success = result.contains("successfully");

        TestCaseOutput testCaseOutput = new TestCaseOutput();
        testCaseOutput.setTestCaseId(testCaseId);
        testCaseOutput.setStartTime(startTime);
        testCaseOutput.setEndTime(endTime);
        testCaseOutput.setStatus(success ? "Success" : "Failure");
        testCaseOutput.setTimeTaken(5000);
        testCaseOutput.setErrorMessage(success ? "No Error" : result);

        saveAndBroadcastResult(testCaseOutput);
    }
}
