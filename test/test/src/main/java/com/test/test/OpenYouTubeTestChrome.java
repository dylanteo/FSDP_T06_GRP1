package com.test.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.net.URL;

public class OpenYouTubeTestChrome {
    private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    @DataProvider(name = "browserProvider")
    public Object[][] browserProvider() {
        return new Object[][]{
                {"chrome"}
        };
    }

    @Test(dataProvider = "browserProvider")
    public void openYouTube(String browser) {
        try {
            WebDriver driver = initializeDriver(browser);
            this.driver.set(driver);
            driver.get("https://www.youtube.com");
            System.out.println("Opened YouTube in: " + browser);
        } catch (Exception e) {
            throw new RuntimeException("Failed to open YouTube in " + browser + ": " + e.getMessage(), e);
        }
    }

    private WebDriver initializeDriver(String browser) {
        try {
            DesiredCapabilities capabilities = new DesiredCapabilities();
            capabilities.setBrowserName(browser.toLowerCase());

            switch (browser.toLowerCase()) {
                case "chrome":
                    ChromeOptions chromeOptions = new ChromeOptions();
                    chromeOptions.addArguments("--disable-gpu", "--headless");
                    capabilities.setCapability(ChromeOptions.CAPABILITY, chromeOptions);
                    break;
                case "firefox":
                    FirefoxOptions firefoxOptions = new FirefoxOptions();
                    firefoxOptions.addArguments("--headless");
                    capabilities.setCapability(FirefoxOptions.FIREFOX_OPTIONS, firefoxOptions);
                    break;
                case "edge":
                    EdgeOptions edgeOptions = new EdgeOptions();
                    edgeOptions.addArguments("--headless");
                    capabilities.setCapability(EdgeOptions.CAPABILITY, edgeOptions);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported browser: " + browser);
            }

            return new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), capabilities);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize driver: " + e.getMessage(), e);
        }
    }

    @AfterMethod
    public void tearDown() {
        WebDriver driverInstance = driver.get();
        if (driverInstance != null) {
            driverInstance.quit();
            driver.remove();
        }
    }
    public static void main(String[] args) {
        org.testng.TestNG testNG = new org.testng.TestNG();
        testNG.setTestClasses(new Class[]{OpenYouTubeTestChrome.class});
        testNG.setParallel(org.testng.xml.XmlSuite.ParallelMode.METHODS);
        testNG.setThreadCount(3);
        testNG.run();
    }
}
