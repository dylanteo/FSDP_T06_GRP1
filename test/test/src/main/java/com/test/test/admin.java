package com.test.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class admin {
    private final SeleniumService seleniumService;

    @Autowired
    public admin(SeleniumService seleniumService) {
        this.seleniumService = seleniumService;
    }

    public String runBankManagerLogin(String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;

        try {
            bankManagerLogin(driver);
            result = "Bank Manager Login Test completed successfully.";
        } catch (Exception e) {
            result = "Bank Manager Login Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        return result;
    }

    private void bankManagerLogin(WebDriver driver) {
        // Your admin login automation steps here
    }

    public String runAddCustomer(String browser, String firstName, String lastName, String postCode) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;

        try {
            addCustomer(driver, firstName, lastName, postCode);
            result = "Add Customer Test completed successfully.";
        } catch (Exception e) {
            result = "Add Customer Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        return result;
    }

    private void addCustomer(WebDriver driver, String firstName, String lastName, String postCode) {
        // Your add customer automation steps here
    }
}
