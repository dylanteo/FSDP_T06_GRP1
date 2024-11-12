package com.test.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;

@Service
public class OpenAccount {
    private final SeleniumService seleniumService;
    private final Login loginHelper; // Inject Login helper to handle login

    @Autowired
    public OpenAccount(SeleniumService seleniumService, Login loginHelper) {
        this.seleniumService = seleniumService;
        this.loginHelper = loginHelper;
    }

    public String runOpenNewAccount(String username, String password, String accountType, String accountNumber,String Browser) {
        WebDriver driver = seleniumService.getDriver("chrome"); // Get the driver from SeleniumService
        seleniumService.setUp(Browser);

        String result;

        try {
            openNewAccount(driver, username, password, accountType, accountNumber);
            result = "Test completed successfully."; // Indicate success
        } catch (AssertionError e) {
            result = "Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }

    private void openNewAccount(WebDriver driver, String username, String password, String accountType, String accountNumber) {
        System.out.println("Logging in...");
        loginHelper.login(driver, username, password); // Use injected loginHelper to log in

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        System.out.println("Navigating to 'Open New Account' page...");
        driver.findElement(By.linkText("Open New Account")).click();

        System.out.println("Current URL after navigating to 'Open New Account': " + driver.getCurrentUrl());

        // Select account type
        System.out.println("Selecting account type: " + accountType);
        WebElement accountTypeDropdown = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("type")));
        Select accountTypeSelect = new Select(accountTypeDropdown);
        accountTypeSelect.selectByVisibleText(accountType);

        // Select "From Account"
        WebElement fromAccountDropdown = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("fromAccountId")));
        Select fromAccountSelect = new Select(fromAccountDropdown);
        fromAccountSelect.selectByVisibleText(accountNumber);

        // Click "Open New Account" button
        WebElement createButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='button' and @value='Open New Account']")));
        createButton.click();

        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();

        // Verify success message
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[@id='openAccountResult']/p")));
        Assert.assertEquals(successMessage.getText(), "Congratulations, your account is now open.", "Account opening was not successful.");
        System.out.println("Open account was successful, and the message is displayed.");
    }
}
