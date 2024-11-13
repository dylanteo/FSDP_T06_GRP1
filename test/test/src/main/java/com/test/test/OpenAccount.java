package com.test.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class OpenAccount {
    private final SeleniumService seleniumService;
    private final TestCaseOutputRepository testCaseOutputRepository;
    private final Login loginHelper;

    @Autowired
    public OpenAccount(SeleniumService seleniumService, TestCaseOutputRepository testCaseOutputRepository, Login loginHelper) {
        this.seleniumService = seleniumService;
        this.testCaseOutputRepository = testCaseOutputRepository;
        this.loginHelper = loginHelper;
    }



    private void openNewAccount(WebDriver driver, String username, String password, String accountType, String accountNumber) {
        // Log in using loginHelper
        loginHelper.runLogin(username, password, "chrome");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        driver.findElement(By.linkText("Open New Account")).click();

        WebElement accountTypeDropdown = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("type")));
        new Select(accountTypeDropdown).selectByVisibleText(accountType);

        WebElement fromAccountDropdown = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("fromAccountId")));
        new Select(fromAccountDropdown).selectByVisibleText(accountNumber);

        driver.findElement(By.xpath("//input[@value='Open New Account']")).click();

        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("openAccountResult")));
        Assert.assertTrue(successMessage.getText().contains("Congratulations"));
    }

    public String runOpenNewAccount(String username, String password, String accountType, String accountNumber, String browser) {
        WebDriver driver = seleniumService.getDriver(browser);
        seleniumService.setUp(browser);
        String startTime = LocalDateTime.now().toString();
        String result;
        boolean success = false;

        try {
            openNewAccount(driver, username, password, accountType, accountNumber);
            result = "Open Account Test completed successfully.";
            success = true;
        } catch (Exception e) {
            result = "Open Account Test encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        saveTestResult("OpenAccountTest", startTime, LocalDateTime.now().toString(), result, success);
        return result;
    }

    private void saveTestResult(String testCaseId, String startTime, String endTime, String result, boolean success) {
        TestCaseOutput output = new TestCaseOutput();
        output.setTestCaseId(testCaseId);
        output.setStartTime(startTime);
        output.setEndTime(endTime);
        output.setStatus(success ? "Success" : "Failure");
        output.setErrorMessage(success ? "No Error" : result);

        testCaseOutputRepository.save(output);
    }
}
