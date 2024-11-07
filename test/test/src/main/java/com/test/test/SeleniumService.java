package com.test.test;

import com.opencsv.CSVReader;
import org.openqa.selenium.*;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.chrome.ChromeDriver;

import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.testng.Assert;


import java.net.MalformedURLException;
import java.net.URL;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SeleniumService {
    WebDriver driver;
    private static final String GRID_URL = "http://localhost:4444/wd/hub"; // Update with your Grid hub URL

    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");


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
            alert.accept();
        } catch (TimeoutException | NoAlertPresentException e) {
            // Alert was not present or timed out
        }
    }

    void checkForErrorMessage() {
        try {
            WebElement errorMessage = driver.findElement(By.cssSelector(".error-message"));
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText);
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

    public List<Map<String, String>> readTestDataFromCSV() {
        List<Map<String, String>> testDataList = new ArrayList<>();

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(
                new ClassPathResource("testData.csv").getInputStream(), StandardCharsets.UTF_8))) {

            String[] nextLine;
            boolean isFirstLine = true;

            while ((nextLine = csvReader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false; // Skip the header line
                    continue;
                }
                Map<String, String> data = new HashMap<>();
                data.put("username", nextLine[0]);
                data.put("password", nextLine[1]);
                testDataList.add(data);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Handle exceptions appropriately
        }

        return testDataList;
    }

    public List<String> runTestsFromLoginTestCases(List<LoginTestCase> testCases) {
        List<String> results = new ArrayList<>();

        for (LoginTestCase testCase : testCases) {
            String username = testCase.getUserName();
            String password = testCase.getPassWord();

            System.out.println("Running test with username: " + username + " and password: " + password);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String result = runTest1(username, password,formatter); // Reuse existing runTest method
            results.add(result); // Collect result for each test case
        }

        return results;
    }
}
