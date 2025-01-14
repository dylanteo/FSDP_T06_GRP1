package com.test.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.annotations.Parameters;

@SpringBootTest
//@ContextConfiguration(classes = Login.class)
public class Testng {


    @Autowired
    private TestCaseOutputRepository testCaseOutputRepository;

    SeleniumService seleniumService = new SeleniumService();

    Register register = new Register();

    Login login = new Login(seleniumService,testCaseOutputRepository);

    OpenAccount oc = new OpenAccount(seleniumService,login);

    @BeforeClass
    public void setUp() {
        // Spring will manage the lifecycle of these objects
        // No need to manually instantiate them in the code
        System.out.println("Spring Context Initialized");
    }

//    @Test
//    @Parameters("browser")
//    public void test2(String browser) {
//        // Initialize WebDriver first in SeleniumService
//        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
//        System.out.println(admin.runAddCustomer(browser, "2", "2", "2"));
//        //seleniumService.tearDown();
//    }
//
//    @Test
//    @Parameters("browser")
//    public void test4(String browser) {
//        // Initialize WebDriver first in SeleniumService
//        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
//        System.out.println("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
//        System.out.println(register.runRegister("a", "a", "a", "a", "a", "a", "a", "a", "a", "a", browser));
//        //seleniumService.tearDown();
//    }
//
//    @Test
//    @Parameters("browser")
//    public void test5(String browser) {
//        // Initialize WebDriver first in SeleniumService
//        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
//        System.out.println("====================================================");
//        System.out.println(oc.runOpenNewAccount("a", "a", "SAVINGS", "17118", browser));
//        //seleniumService.tearDown();
//    }
    @Test
    @Parameters("browser")
    public void testloginbanksite(String browser)
    {
        System.out.println("====================================================");
        System.out.println(login.runLogin("test","test",browser));
        System.out.println("====================================================");
    }
//    @Test
//    @Parameters("browser")
//    public void createAccount(String browser)
//    {
//        System.out.println(oc.runOpenNewAccount("test1","test1","SAVINGS","23556",browser));
//    }
    @AfterSuite
    public void tearDownSuite() {
        // Ensure that the WebDriver is properly cleaned up after all tests are complete
        //seleniumService.tearDown(); // Perform cleanup
        System.out.println("Selenium WebDriver has been torn down after all tests.");
    }
}
