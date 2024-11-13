package com.test.test;

import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Register {
    private final SeleniumService seleniumService;

    @Autowired
    public Register(SeleniumService seleniumService) {
        this.seleniumService = seleniumService;
    }

    public String runRegister(String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password, String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;

        try {
            register(driver, firstName, lastName, address, city, state, zipCode, phone, ssn, username, password);
            result = "Registration Test completed successfully.";
        } catch (Exception e) {
            result = "Registration Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        return result;
    }

    private void register(WebDriver driver, String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password) {
        // Your registration automation steps here
    }
}
