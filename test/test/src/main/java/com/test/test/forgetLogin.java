package com.test.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.logging.Logger;

@Service
public class forgetLogin {

    private final SeleniumService seleniumService;
    private final TestCaseOutputRepository testCaseOutputRepository;
    private static final Logger LOGGER = Logger.getLogger(forgetLogin.class.getName());

    @Autowired
    public forgetLogin(SeleniumService seleniumService, TestCaseOutputRepository testCaseOutputRepository) {
        this.seleniumService = seleniumService;
        this.testCaseOutputRepository = testCaseOutputRepository;
    }

    public String runForgotLoginInfo(String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver(browser);
        String result;
        String startTime = LocalDateTime.now().toString();
        boolean success = false;

        try {
            forgotLoginInfo(driver); // Run the automation steps for "Forgot Login Info"
            result = "Forgot Login Info Test completed successfully.";
            success = true;
        } catch (Exception e) {
            result = "Forgot Login Info Test encountered an error: " + e.getMessage();
            LOGGER.severe("Error during Forgot Login Info test: " + e.getMessage());
        } finally {
            seleniumService.tearDown(); // Clean up the WebDriver session
        }

        saveTestResult("ForgotLoginInfoTest", startTime, LocalDateTime.now().toString(), result, success);
        return result;
    }

    private void forgotLoginInfo(WebDriver driver) {
        driver.get("https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement forgotLoginLink = wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Forgot login info?")));
        forgotLoginLink.click();

        wait.until(ExpectedConditions.urlContains("parabank/lookup.htm"));

        driver.findElement(By.id("firstName")).sendKeys("A");
        driver.findElement(By.id("lastName")).sendKeys("A");
        driver.findElement(By.id("address.street")).sendKeys("A");
        driver.findElement(By.id("address.city")).sendKeys("A");
        driver.findElement(By.id("address.state")).sendKeys("A");
        driver.findElement(By.id("address.zipCode")).sendKeys("A");
        driver.findElement(By.id("ssn")).sendKeys("A");

        driver.findElement(By.xpath("//input[@type='submit' and @value='Find My Login Info']")).click();

        WebElement rightPanel = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("rightPanel")));
        String panelText = rightPanel.getText();
        System.out.println("Debug: Right panel text content:\n" + panelText); // Log the panel text for debugging

        try {
            // Check if both "Username:" and "Password:" exist in the panel text
            if (panelText.contains("Username:") && panelText.contains("Password:")) {
                String displayedUsername = panelText.split("Username:")[1].split("Password:")[0].trim();
                String displayedPassword = panelText.split("Password:")[1].trim();

                // Verify the retrieved username and password
                Assert.assertEquals(displayedUsername, "A", "Username does not match expected value.");
                Assert.assertEquals(displayedPassword, "A", "Password does not match expected value.");
            } else {
                throw new AssertionError("The expected 'Username:' and/or 'Password:' text was not found in the panel.");
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            throw new AssertionError("Could not parse username and password from text: " + panelText, e);
        }
    }



    private void saveTestResult(String testCaseId, String startTime, String endTime, String result, boolean success) {
        TestCaseOutput output = new TestCaseOutput();
        output.setTestCaseId(testCaseId);
        output.setStartTime(startTime);
        output.setEndTime(endTime);
        output.setStatus(success ? "Success" : "Failure"); // Set status based on success flag
        output.setErrorMessage(success ? "No Error" : result);

        testCaseOutputRepository.save(output);
    }
}
