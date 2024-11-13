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
public class Register {
    private final SeleniumService seleniumService;
    private final TestCaseOutputRepository testCaseOutputRepository;

    @Autowired
    public Register(SeleniumService seleniumService, TestCaseOutputRepository testCaseOutputRepository) {
        this.seleniumService = seleniumService;
        this.testCaseOutputRepository = testCaseOutputRepository;
    }

    public String runRegister(String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password, String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String startTime = LocalDateTime.now().toString();
        String result;
        boolean success = false;

        try {
            register(driver, firstName, lastName, address, city, state, zipCode, phone, ssn, username, password);
            result = "Registration completed successfully.";
            success = true; // Mark success as true if no exceptions occur
        } catch (Exception e) {
            result = "Registration encountered an error: " + e.getMessage();
        } finally {
            seleniumService.tearDown();
        }

        saveTestResult("RegisterTest", startTime, LocalDateTime.now().toString(), result, success);
        return result;
    }

    private void register(WebDriver driver, String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password) {
        driver.get("https://parabank.parasoft.com/parabank/index.htm");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        // Click Register link
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Register"))).click();

        // Fill in registration form fields
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.firstName"))).sendKeys(firstName);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.lastName"))).sendKeys(lastName);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.address.street"))).sendKeys(address);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.address.city"))).sendKeys(city);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.address.state"))).sendKeys(state);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.address.zipCode"))).sendKeys(zipCode);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.phoneNumber"))).sendKeys(phone);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.ssn"))).sendKeys(ssn);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.username"))).sendKeys(username);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer.password"))).sendKeys(password);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("repeatedPassword"))).sendKeys(password);

        // Submit the registration form
        driver.findElement(By.xpath("//input[@type='submit' and @value='Register']")).click();

        // Wait for success message
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id='rightPanel']/p")));
        Assert.assertEquals(successMessage.getText(), "Your account was created successfully. You are now logged in.", "Registration was not successful.");
    }

    private void saveTestResult(String testCaseId, String startTime, String endTime, String result, boolean success) {
        TestCaseOutput output = new TestCaseOutput();
        output.setTestCaseId(testCaseId);
        output.setStartTime(startTime);
        output.setEndTime(endTime);
        output.setStatus(success ? "Success" : "Failure");
        output.setErrorMessage(success ? "No Error" : result);

        try {
            testCaseOutputRepository.save(output); // Save the result to MongoDB
            System.out.println("Test result saved to MongoDB successfully.");
        } catch (Exception e) {
            System.err.println("Failed to save test result to MongoDB: " + e.getMessage());
        }
    }
}
