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

@Service
public class forgetLogin {
    private static SeleniumService seleniumService = new SeleniumService();

    @Autowired

    public static String runForgotLoginInfo(String browser) {
        seleniumService.setUp(browser);
        WebDriver driver = seleniumService.getDriver();
        String result;

        try {
            forgotLoginInfo(driver); // Call the forgotLoginInfo method
            result = "Forgot Login Info Test completed successfully."; // Indicate success
        } catch (AssertionError e) {
            result = "Forgot Login Info Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Forgot Login Info Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }

    // Private method to perform the "Forgot Login Info" steps
    public static void forgotLoginInfo(WebDriver driver) {
        // Navigate to the initial login page
        driver.get("https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Click on the "Forgot login info?" link
        WebElement forgotLoginLink = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.linkText("Forgot login info?")
        ));
        forgotLoginLink.click();

        // Wait until the lookup page loads
        wait.until(ExpectedConditions.urlContains("https://parabank.parasoft.com/parabank/lookup.htm"));

        // Fill out the "Customer Lookup" form
        driver.findElement(By.id("firstName")).sendKeys("A");
        driver.findElement(By.id("lastName")).sendKeys("A");
        driver.findElement(By.id("address.street")).sendKeys("A");
        driver.findElement(By.id("address.city")).sendKeys("A");
        driver.findElement(By.id("address.state")).sendKeys("A");
        driver.findElement(By.id("address.zipCode")).sendKeys("A");
        driver.findElement(By.id("ssn")).sendKeys("A");

        // Click the "Find My Login Info" button
        WebElement findLoginButton = driver.findElement(By.xpath("//input[@type='submit' and @value='Find My Login Info']"));
        findLoginButton.click();

        // Wait for the username and password to display in the right panel
        WebElement rightPanel = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("rightPanel")
        ));

        // Extract the text content of the right panel
        String panelText = rightPanel.getText();
        System.out.println("Debug: Right panel text content:\n" + panelText);

        try {
            // Extract Username
            String displayedUsername = panelText.split("Username:")[1].split("Password:")[0].trim();
            // Extract Password
            String displayedPassword = panelText.split("Password:")[1].trim();

            // Verify the retrieved username and password
            Assert.assertEquals(displayedUsername, "A", "Username does not match expected value.");
            Assert.assertEquals(displayedPassword, "A", "Password does not match expected value.");
        } catch (ArrayIndexOutOfBoundsException e) {
            throw new AssertionError("Could not parse username and password from text: " + panelText, e);
        }
    }
}