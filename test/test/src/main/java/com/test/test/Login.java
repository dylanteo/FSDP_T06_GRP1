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
    private static SeleniumService seleniumService = new SeleniumService();

    @Autowired
    public Login(SeleniumService seleniumService, TestCaseOutputRepository testCaseOutputRepository) {
        this.seleniumService = seleniumService;
    }



    public static String runLogin(String username, String password, String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(); // Get the driver from SeleniumService

        String result;

        try {
            login(driver, username, password); // Call the testLogin method with only the username
            result = "Logged in successfully."; // Indicate success

        } catch (AssertionError e) {
            result = "Login Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Login Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }
    public static TestCaseResult runLogin1(String username, String password, String browser) {
        //WebDriver driver = seleniumService.getDriver(); // Get the driver from SeleniumService
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver();
        String result;
        String start = LocalDateTime.now().toString();
        String end = "";
        boolean success = false;
        try {
            login(driver, username, password); // Call the testLogin method with only the username
            end = LocalDateTime.now().toString();
            result = "Test completed successfully."; // Indicate success
            success = true;
        } catch (AssertionError e) {
            result = "Login Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Login Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }
        TestCaseResult tcr = new TestCaseResult(start,end,success,result);
        return tcr; // Return the result after cleanup
    }


    public static void login(WebDriver driver, String username, String password) {

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

        // Handle potential alerts and check for any error messages
        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();

        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, "https://parabank.parasoft.com/parabank/overview.htm", "Login was not successful.");
        //driver.quit();
    }

}
