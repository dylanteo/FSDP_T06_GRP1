package com.test.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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
    private final TestCaseOutputRepository testCaseOutputRepository;

    @Autowired
    public Login(SeleniumService seleniumService, TestCaseOutputRepository testCaseOutputRepository) {
        this.seleniumService = seleniumService;
        this.testCaseOutputRepository = testCaseOutputRepository;
    }

    public void login(WebDriver driver, String username, String password) {
        // Ensure driver is not null before starting
//        if (driver == null) {
//            throw new IllegalStateException("WebDriver instance is null. Make sure the WebDriver is properly initialized.");
//        }

        driver.get("https://parabank.parasoft.com/parabank/index.htm");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));

        usernameInput.sendKeys(username);
        passwordInput.sendKeys(password);
        driver.findElement(By.xpath("//input[@value='Log In']")).click();

        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();

        Assert.assertEquals(driver.getCurrentUrl(), "https://parabank.parasoft.com/parabank/overview.htm", "Login was not successful.");
    }

    private void saveTestResult(String testCaseId, String startTime, String endTime, Long timeTaken, String result, boolean success) {
        System.out.println("uploading file to database");
        TestCaseOutput output = new TestCaseOutput();
        output.setTestCaseId(testCaseId);
        output.setStartTime(startTime);
        output.setEndTime(endTime);
        output.setTimeTaken(timeTaken);
        output.setStatus(success ? "Success" : "Failure");
        output.setErrorMessage(success ? "No Error" : result);

        testCaseOutputRepository.save(output);
    }



    public String runLogin(String username, String password, String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver();
        String result;
        String startTime = LocalDateTime.now().toString();
        boolean success = false;
        long timeTaken = 0;

        try {
            // Record start time
            long start = System.nanoTime();

            login(driver, username, password);

            // Record end time
            long end = System.nanoTime();

            // Calculate time taken in milliseconds
            timeTaken = (end - start) / 1_000_000;

            result = "Login Test completed successfully.";
            success = true;
        } catch (Exception e) {
            result = "Login Test encountered an error: " + e.getMessage();
        } finally {
            if (driver != null) {
                seleniumService.tearDown();
            }
        }

        saveTestResult("LoginTest", startTime, LocalDateTime.now().toString(), timeTaken, result, success);
        return result;
    }

}