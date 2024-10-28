package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.testng.Assert;

import java.time.Duration;

@Service
public class SeleniumService {
    private WebDriver driver;

    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode
        options.addArguments("--no-sandbox"); // Optional
        options.addArguments("--disable-dev-shm-usage"); // Optional

        driver = new ChromeDriver(options);
    }

    public String runTest(String username, String password) {
        setUp(); // Ensure the driver is set up before running tests
        String result;

        try {
            testLogin(username, password); // Call the testLogin method
            result = "Test completed successfully."; // Indicate success
        } catch (AssertionError e) {
            result = "Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }

    private void testLogin(String username, String password) {
        driver.get("http://localhost:2000/loginsignup.html");
        WebElement loginLink = driver.findElement(By.xpath("//a[text()='Login']"));
        loginLink.click();

        WebElement usernameInput = driver.findElement(By.id("loginUsername"));
        WebElement passwordInput = driver.findElement(By.id("loginPassword"));
        WebElement loginButton = driver.findElement(By.cssSelector("#loginForm button[type='submit']"));

        usernameInput.sendKeys(username);
        passwordInput.sendKeys(password);
        loginButton.click();

        handleAlert();
        checkForErrorMessage();

        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, "http://localhost:2000/index.html", "Login was not successful.");
    }

    private void handleAlert() {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));
            wait.until(ExpectedConditions.alertIsPresent());
            Alert alert = driver.switchTo().alert();
            alert.accept(); // Click "OK"
        } catch (TimeoutException e) {
            // Handle timeout
        } catch (NoAlertPresentException e) {
            // Handle no alert present
        }
    }

    private void checkForErrorMessage() {
        try {
            WebElement errorMessage = driver.findElement(By.cssSelector(".error-message")); // Adjust the selector
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText); // Print error message for debugging

            Assert.assertNotNull(errorText, "Error message should not be null.");

        } catch (NoSuchElementException e) {
            // No error message was present
        }
    }

    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
