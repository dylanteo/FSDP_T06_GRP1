package com.test.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Login {
    private final SeleniumService seleniumService;

    @Autowired
    public Login(SeleniumService seleniumService) {
        this.seleniumService = seleniumService;
    }

    public String runLogin(String username, String password, String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;

        try {
            login(driver, username, password);
            result = "Login Test completed successfully.";
        } catch (Exception e) {
            result = "Login Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        return result;
    }

    public void login(WebDriver driver, String username, String password) {
        // Your login automation steps here
    }
}
