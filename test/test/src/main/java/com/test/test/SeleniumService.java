package com.test.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URL;

@Service
public class SeleniumService {
    private WebDriver driver;
    private static final String GRID_URL = "http://localhost:4444/wd/hub"; // Update with your Grid hub URL

    public void setUp() {
        if (driver == null) { // Only set up the driver if it hasn't been initialized
            System.out.println("Initializing WebDriver...");
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");

            DesiredCapabilities capabilities = new DesiredCapabilities();
            capabilities.setCapability(ChromeOptions.CAPABILITY, options);

            try {
                driver = new RemoteWebDriver(new URL(GRID_URL), capabilities);
                System.out.println("WebDriver initialized successfully.");
            } catch (MalformedURLException e) {
                throw new RuntimeException("Failed to connect to Selenium Grid at " + GRID_URL, e);
            }
        } else {
            System.out.println("WebDriver already initialized.");
        }
    }

    public WebDriver getDriver() {
        if (driver == null) {
            System.out.println("Driver is null, calling setUp...");
            setUp(); // Call setUp if driver is null
        }
        return driver;
    }

    public void tearDown() {

        System.out.println("Tearing down WebDriver...");
        driver.quit();
        driver = null;

    }

    public void handleAlert() {
        // Implement alert handling if necessary
    }

    public void checkForErrorMessage() {
        // Implement error message checking if necessary
    }
}
