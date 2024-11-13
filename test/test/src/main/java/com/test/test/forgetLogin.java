package com.test.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class forgetLogin {
    private final SeleniumService seleniumService;

    @Autowired
    public forgetLogin(SeleniumService seleniumService) {
        this.seleniumService = seleniumService;
    }

    public String runForgotLoginInfo(String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;

        try {
            forgotLoginInfo(driver);
            result = "Forgot Login Info Test completed successfully.";
        } catch (Exception e) {
            result = "Forgot Login Info Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        return result;
    }

    private void forgotLoginInfo(WebDriver driver) {
        // Perform the "Forgot Login Info" steps as before
        // Your existing code here
    }
}
