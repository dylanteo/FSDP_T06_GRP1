package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import java.time.Duration;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import io.github.bonigarcia.wdm.WebDriverManager;

public class SeleniumTest {
    private WebDriver driver;

    @BeforeClass
    public void setUp() {
        // Use WebDriverManager to handle driver setup
        WebDriverManager.chromedriver().setup();

        // Set up Chrome options for headless execution
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode
        options.addArguments("--no-sandbox"); // Optional
        options.addArguments("--disable-dev-shm-usage"); // Optional

        // Initialize the WebDriver with options
        driver = new ChromeDriver(options);
    }

    @Test
    public void testLogin() {
        driver.get("http://localhost:3000/loginsignup.html");

        // Step 1: Click on the "Login" link to show the login form
        WebElement loginLink = driver.findElement(By.xpath("//a[text()='Login']"));
        loginLink.click();

        // Step 2: Fill in the login form
        WebElement usernameInput = driver.findElement(By.id("loginUsername"));
        WebElement passwordInput = driver.findElement(By.id("loginPassword"));
        WebElement loginButton = driver.findElement(By.cssSelector("#loginForm button[type='submit']"));

        String testUsername = "yanhui"; // Replace with your test username
        String testPassword = "yanhui"; // Replace with your test password

        usernameInput.sendKeys(testUsername);
        passwordInput.sendKeys(testPassword);

        // Step 3: Submit the form
        loginButton.click();

        // Step 4: Handle alert if present
        try {
            // Wait for alert to be present
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5)); // Wait for up to 5 seconds
            wait.until(ExpectedConditions.alertIsPresent());

            Alert alert = driver.switchTo().alert(); // Switch to the alert
            alert.accept(); // Click "OK"
            System.out.println("Alert accepted.");
        } catch (TimeoutException e) {
            System.out.println("No alert was displayed.");
        } catch (NoAlertPresentException e) {
            System.out.println("No alert was present.");
        }

        // Step 5: Check for error messages
        try {
            // Look for an error message element (adjust the selector as needed)
            WebElement errorMessage = driver.findElement(By.cssSelector(".error-message")); // Change the selector to match your error message element
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText); // Print the error message for debugging

            // You can also add an assertion to fail the test if an error message is found
            Assert.assertNotNull(errorText, "Error message should not be null.");

        } catch (NoSuchElementException e) {
            // No error message was present
            System.out.println("No error message displayed.");
        }

        // Step 6: Check the outcome
        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, "http://localhost:3000/donation.html", "Login was not successful.");
    }

}