package com.test.test;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

@Service
public class SeleniumService {

    private static final String GRID_URL = "http://localhost:4444/wd/hub"; // Update with your Grid hub URL
    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    public void setUp(String browser) {
        // Set up WebDriverManager to manage the browser drivers
        if ("chrome".equalsIgnoreCase(browser)) {
            WebDriverManager.chromedriver().setup();  // Automatically download and set up Chrome driver
        } else if ("firefox".equalsIgnoreCase(browser)) {
            WebDriverManager.firefoxdriver().driverVersion("0.35.0").setup(); // Automatically download and set up Firefox driver
        } else if ("edge".equalsIgnoreCase(browser)) {
            WebDriverManager.edgedriver().setup(); // Automatically download and set up Edge driver
        } else {
            throw new IllegalArgumentException("Unsupported browser: " + browser);
        }

        // Set the desired capabilities based on the browser
        DesiredCapabilities capabilities = new DesiredCapabilities();

        if ("chrome".equalsIgnoreCase(browser)) {
            ChromeOptions chromeOptions = new ChromeOptions();
//            chromeOptions.addArguments("--headless"); // Run in headless mode
            chromeOptions.addArguments("--no-sandbox"); // Optional
            chromeOptions.addArguments("--disable-dev-shm-usage"); // Optional
            capabilities.setCapability(ChromeOptions.CAPABILITY, chromeOptions);
        } else if ("firefox".equalsIgnoreCase(browser)) {
            FirefoxOptions firefoxOptions = new FirefoxOptions();
            firefoxOptions.addArguments("--headless"); // Run Firefox in headless mode
            capabilities.setCapability(FirefoxOptions.FIREFOX_OPTIONS, firefoxOptions);
        } else if ("edge".equalsIgnoreCase(browser)) {
            EdgeOptions edgeOptions = new EdgeOptions();
            edgeOptions.addArguments("--headless"); // Run in headless mode
            capabilities.setCapability(EdgeOptions.CAPABILITY, edgeOptions);
        }

        try {
            // Connect to the Selenium Grid hub with RemoteWebDriver
            driver.set(new RemoteWebDriver(new URL(GRID_URL), capabilities));
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to connect to Selenium Grid at " + GRID_URL, e);
        }
    }

    public WebDriver getDriver() {
        if (driver.get() == null) {
            throw new IllegalStateException("Driver is not initialized. Call setUp() first.");
        }
        return driver.get();
    }

    public void tearDown() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }

    // Handle browser alerts
    public void handleAlert() {
        try {
            WebDriverWait wait = new WebDriverWait(getDriver(), Duration.ofSeconds(3));
            wait.until(ExpectedConditions.alertIsPresent());
            Alert alert = getDriver().switchTo().alert();
            alert.accept(); // Click "OK"
        } catch (TimeoutException | NoAlertPresentException e) {
            // Handle timeout or no alert
        }
    }

    // Check for error messages on the page
    public void checkForErrorMessage() {
        try {
            WebElement errorMessage = getDriver().findElement(By.cssSelector(".error-message")); // Adjust the selector
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText); // Print error message for debugging

            Assert.assertNotNull(errorText, "Error message should not be null.");
        } catch (NoSuchElementException e) {
            // No error message was present
        }
    }

    // Wait for the page URL to match the expected one
    public void waitForPageUrl(String expectedUrl) {
        WebDriverWait wait = new WebDriverWait(getDriver(), Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
    }

    // Add custom retry logic in case of intermittent failures
    public void retryLoginTest(int maxRetries) {
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                // Assume login logic is here
                // Example: check for login success or failure

                // Assuming the login page should redirect to the overview page
                waitForPageUrl("https://parabank.parasoft.com/parabank/overview.htm");

                // If successful, break the loop
                break;
            } catch (TimeoutException | AssertionError e) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw new RuntimeException("Login test failed after " + maxRetries + " attempts.");
                }
                System.out.println("Retrying login... Attempt " + (attempt + 1));
            }
        }
    }
}
