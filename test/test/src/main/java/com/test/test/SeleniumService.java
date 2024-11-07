package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

@Service
public class SeleniumService {
    WebDriver driver;
    private static final String GRID_URL = "http://localhost:4444/wd/hub"; // Update with your Grid hub URL

    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode
        options.addArguments("--no-sandbox"); // Optional
        options.addArguments("--disable-dev-shm-usage"); // Optional

        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability(ChromeOptions.CAPABILITY, options);

        try {
            // Connect to the Grid hub with RemoteWebDriver
            driver = new RemoteWebDriver(new URL(GRID_URL), capabilities);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to connect to Selenium Grid at " + GRID_URL, e);
        }
    }



    void handleAlert() {
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

    void checkForErrorMessage() {
        try {
            WebElement errorMessage = driver.findElement(By.cssSelector(".error-message")); // Adjust the selector
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText); // Print error message for debugging

            Assert.assertNotNull(errorText, "Error message should not be null.");

        } catch (NoSuchElementException e) {
            // No error message was present
        }
    }

    public WebDriver getDriver() {
        if (driver == null) {
            setUp(); // Initialize the driver if it's not set up yet
        }
        return driver;
    }

    public void tearDown() {
        driver.quit();

    }
}
