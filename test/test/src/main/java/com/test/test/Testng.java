package com.test.test;

import org.testng.annotations.AfterSuite;
import org.testng.annotations.Test;
import org.testng.annotations.Parameters;

public class Testng {
    Register register = new Register();
    SeleniumService seleniumService = new SeleniumService();
    Login login = new Login(seleniumService);
    OpenAccount oc = new OpenAccount(seleniumService, login);

    @Test(groups = "test1")
    @Parameters({"browser", "firstName", "lastName", "postCode"})
    public void test1(String browser,String firstName, String lastName, String postCode) {
        // Initialize WebDriver first in SeleniumService
        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
        System.out.println(admin.runAddCustomer(browser, firstName, lastName, postCode));
        //seleniumService.tearDown();
    }

    @Test
    @Parameters("browser")
    public void test2(String browser) {
        // Initialize WebDriver first in SeleniumService
        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
        System.out.println(admin.runAddCustomer(browser, "2", "2", "2"));
        //seleniumService.tearDown();
    }

    @Test
    @Parameters("browser")
    public void test3(String browser) {
        // Initialize WebDriver first in SeleniumService
        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
        System.out.println(admin.runAddCustomer(browser, "3", "3", "3"));
        //seleniumService.tearDown();
    }

    @Test
    @Parameters("browser")
    public void test4(String browser) {
        // Initialize WebDriver first in SeleniumService
        //seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
        System.out.println("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        System.out.println(register.runRegister("a", "a", "a", "a", "a", "a", "a", "a", "a", "a", browser));
        //seleniumService.tearDown();
    }

    @Test
    @Parameters("browser")
    public void test5(String browser) {
        // Initialize WebDriver first in SeleniumService
        seleniumService.setUp(browser); // Set up the WebDriver based on the browser parameter
        System.out.println("====================================================");
        System.out.println(oc.runOpenNewAccount("a", "a", "SAVINGS", "17118", browser));
        seleniumService.tearDown();
    }
    @AfterSuite
    public void tearDownSuite() {
        // Ensure that the WebDriver is properly cleaned up after all tests are complete
        seleniumService.tearDown(); // Perform cleanup
        System.out.println("Selenium WebDriver has been torn down after all tests.");
    }
}
