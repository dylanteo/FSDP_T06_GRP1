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
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Parameters;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
@Service
public class SeleniumService {

    private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();
    private static final String GRID_URL = "http://localhost:4444/wd/hub"; // Update as needed

    @BeforeMethod
    @Parameters("browser")
    public void setUp(String browser) {
        DesiredCapabilities capabilities = new DesiredCapabilities();

        if ("chrome".equalsIgnoreCase(browser)) {
            WebDriverManager.chromedriver().setup();
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");
            capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        } else if ("firefox".equalsIgnoreCase(browser)) {
            WebDriverManager.firefoxdriver().driverVersion("0.35.0").setup();
            FirefoxOptions options = new FirefoxOptions();
            options.addArguments("--headless");
            capabilities.setCapability(FirefoxOptions.FIREFOX_OPTIONS, options);
        } else if ("edge".equalsIgnoreCase(browser)) {
            WebDriverManager.edgedriver().setup();
            EdgeOptions options = new EdgeOptions();
            options.addArguments("--headless");
            capabilities.setCapability(EdgeOptions.CAPABILITY, options);
        } else {
            throw new IllegalArgumentException("Unsupported browser: " + browser);
        }

        try {
            driver.set(new RemoteWebDriver(new URL(GRID_URL), capabilities));
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to connect to Selenium Grid at " + GRID_URL, e);
        }
    }

    public WebDriver getDriver() {
        return driver.get();
    }

    @AfterMethod
    public void tearDown() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }

    // Example of handling an alert
    public void handleAlert() {
        WebDriverWait wait = new WebDriverWait(getDriver(), Duration.ofSeconds(3));
        try {
            wait.until(ExpectedConditions.alertIsPresent());
            Alert alert = getDriver().switchTo().alert();
            alert.accept();
        } catch (TimeoutException | NoAlertPresentException e) {
            // Handle alert not present
        }
    }

    // Check for an error message on the page
    public void checkForErrorMessage() {
        try {
            WebElement errorMessage = getDriver().findElement(By.cssSelector(".error-message")); // Adjust selector
            String errorText = errorMessage.getText();
            Assert.assertNotNull(errorText, "Error message should not be null.");
        } catch (NoSuchElementException e) {
            // No error message was present
        }
    }

    // Wait for a specific URL
    public void waitForPageUrl(String expectedUrl) {
        WebDriverWait wait = new WebDriverWait(getDriver(), Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
    }

    // Retry logic for login test
    public void retryLoginTest(int maxRetries) {
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                waitForPageUrl("https://parabank.parasoft.com/parabank/overview.htm");
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