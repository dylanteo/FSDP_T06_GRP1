package com.test.test;

import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OpenAccount {
    private final SeleniumService seleniumService;
    private final Login loginHelper;

    @Autowired
    public OpenAccount(SeleniumService seleniumService, Login loginHelper) {
        this.seleniumService = seleniumService;
        this.loginHelper = loginHelper;
    }

    public String runOpenNewAccount(String username, String password, String accountType, String accountNumber, String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;

        try {
            openNewAccount(driver, username, password, accountType, accountNumber);
            result = "Open New Account Test completed successfully.";
        } catch (Exception e) {
            result = "Open New Account Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        return result;
    }

    private void openNewAccount(WebDriver driver, String username, String password, String accountType, String accountNumber) {
        loginHelper.login(driver, username, password);
        // Account opening steps here
    }
}
