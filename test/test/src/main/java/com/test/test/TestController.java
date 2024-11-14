package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.List;
import java.util.stream.Collectors;

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
    @GetMapping("/executeTest")
    public ResponseEntity<String> executeTest(@RequestParam String className) {
        try {
            // Dynamically compile the test class from the file
            String filePath = "src/main/java/com/test/test/" + className + ".java"; // Assuming it's uploaded here
            compileJavaFile(filePath);

            // Dynamically load and run the compiled class
            Class<?> testClass = Class.forName("com.test.test." + className);  // Fully qualified name
            Method method = testClass.getMethod("testMethod");  // Assuming test method is named `testMethod`
            Object testInstance = testClass.getDeclaredConstructor().newInstance();
            method.invoke(testInstance);  // Run the test method

            return ResponseEntity.ok("Test executed successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error executing test: " + e.getMessage());
        }
    }

    private void compileJavaFile(String filePath) throws Exception {
        // Prepare a JavaCompiler to dynamically compile the .java file
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        int result = compiler.run(null, null, null, filePath);
        if (result != 0) {
            throw new Exception("Compilation failed for file: " + filePath);
        }
    }
}