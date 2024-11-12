package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class Login {

    private final SeleniumService seleniumService;

    @Autowired
    public Login(SeleniumService seleniumService) {
        this.seleniumService = seleniumService;
    }


    public String runLogin(String username, String password) {
        WebDriver driver = seleniumService.getDriver(); // Get the driver from SeleniumService
        seleniumService.setUp();
        String result;

        try {
            login(driver, username, password); // Call the testLogin method with only the username
            result = "Test completed successfully."; // Indicate success

        } catch (AssertionError e) {
            result = "Test failed: " + e.getMessage();
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage();
        } catch (Exception e) {
            result = "Test encountered an error: " + e.getMessage();
        } finally {
            cleanupDriver(); // Use the new cleanup method
        }

        return result;
    }


    public void login(WebDriver driver, String username, String password) {
        driver.get("https://parabank.parasoft.com/parabank/index.htm");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@name='username' and @type='text']")
        ));
        usernameInput.sendKeys(username);

        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@name='password' and @type='password']")
        ));
        passwordInput.sendKeys(password);

        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='submit' and @value='Log In']")));
        loginButton.click();


        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();
        try {
            // Input validation
            if (username == null || password == null) {
                throw new IllegalArgumentException("Username or Password cannot be null");
            }

            WebDriver driver = getDriver(browser);  // Pass the browser parameter
            login(driver, username, password);

            success = true;
        } catch (IllegalArgumentException e) {
            errorMessage = "Test failed: " + e.getMessage();
        } catch (AssertionError e) {
            errorMessage = "Test failed: " + e.getMessage();
        } catch (WebDriverException e) {
            errorMessage = "WebDriver error: " + e.getMessage();
        } catch (Exception e) {
            errorMessage = "Test encountered an error: " + e.getMessage();
        } finally {
            endTime = LocalDateTime.now().toString();
            cleanupDriver();
        }

        return new TestCaseResult(startTime, endTime, success, errorMessage);
    }

    private static void login(WebDriver driver, String username, String password) {
        try {
            driver.get("https://parabank.parasoft.com/parabank/index.htm");
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));

            WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//input[@name='username' and @type='text']"))
            );
            usernameInput.sendKeys(username);

            WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//input[@name='password' and @type='password']"))
            );
            passwordInput.sendKeys(password);

            WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//input[@type='submit' and @value='Log In']"))
            );
            loginButton.click();

            seleniumService.handleAlert();
            seleniumService.checkForErrorMessage();

            String currentUrl = driver.getCurrentUrl();
            Assert.assertEquals(currentUrl,
                    "https://parabank.parasoft.com/parabank/overview.htm",
                    "Login was not successful.");
        } catch (Exception e) {
            // Rethrow the exception after cleanup
            throw e;
        }
    }
}
