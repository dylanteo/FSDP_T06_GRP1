package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class Login {
    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();
    private static final SeleniumService seleniumService = new SeleniumService();

    // Method to get WebDriver instance per thread
    private static WebDriver getDriver(String browser) {
        WebDriver driver = driverThreadLocal.get();
        if (driver == null) {
            seleniumService.setUp(browser);  // Pass browser type to SeleniumService
            driver = seleniumService.getDriver();
            driverThreadLocal.set(driver);
        }
        return driver;
    }

    // Method to properly clean up WebDriver resources
    private static void cleanupDriver() {
        try {
            WebDriver driver = driverThreadLocal.get();
            if (driver != null) {
                seleniumService.tearDown();
                driverThreadLocal.remove(); // Remove the ThreadLocal reference
            }
        } catch (Exception e) {
            // Log the cleanup error but don't throw it
            System.err.println("Error during driver cleanup: " + e.getMessage());
        }
    }

    public static String runLogin(String username, String password, String browser) {
        String result;

        try {
            WebDriver driver = getDriver(browser);  // Pass the browser parameter
            login(driver, username, password); // Perform login
            result = "Test completed successfully.";
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

    public static TestCaseResult runLogin1(String username, String password, String browser) {
        String startTime = LocalDateTime.now().toString();
        String endTime = null;
        boolean success = false;
        String errorMessage = null;

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
