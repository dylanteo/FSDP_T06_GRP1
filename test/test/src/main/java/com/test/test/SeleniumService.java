package com.test.test;

import com.opencsv.CSVReader;
import org.openqa.selenium.*;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.testng.Assert;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SeleniumService {
    private WebDriver driver;

    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
    }
    private String getRootCauseMessage(Throwable throwable) {
        Throwable cause = throwable;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getMessage();
    }

    public List<String> runTests(List<Map<String, String>> testDataList) {
        List<String> results = new ArrayList<>();

        for (Map<String, String> data : testDataList) {
            String username = data.get("username");
            String password = data.get("password");

            System.out.println("Running test with username: " + username + " and password: " + password);

            String result = runTest(username, password);
            results.add(result); // Collect result for each test case
        }

        return results;
    }

    public String runTest(String username, String password) {
        setUp();
        String result;

        try {
            testLogin(username, password);
            result = "Test completed successfully for username: " + username;
        } catch (AssertionError e) {
            result = "Test failed for username: " + username + " - " + e.getMessage();
        } catch (WebDriverException e) {
            result = "WebDriver error for username: " + username + " - " + e.getMessage();
        } catch (Exception e) {
            result = "Test encountered an error for username: " + username + " - " + e.getMessage();
        } finally {
            tearDown();
        }

        return result;
    }
    public String runTest1(String username, String password, DateTimeFormatter formatter) {
        setUp();
        String result;
        String testId = UUID.randomUUID().toString(); // Generate unique ID for each test

        LocalDateTime startTime = LocalDateTime.now(); // Record start time
        String formattedStartTime = startTime.format(formatter);

        try {
            testLogin(username, password);
            LocalDateTime endTime = LocalDateTime.now(); // Record end time
            String formattedEndTime = endTime.format(formatter);
            result = "Test ID: " + testId + " - Test completed successfully for username: " + username
                    + " - Start time: " + formattedStartTime
                    + ", End time: " + formattedEndTime;
        } catch (AssertionError e) {
            LocalDateTime endTime = LocalDateTime.now();
            String formattedEndTime = endTime.format(formatter);
            result = "Test ID: " + testId + " - Test failed for username: " + username
                    + " - Start time: " + formattedStartTime
                    + ", End time: " + formattedEndTime
                    + " - " + e.getMessage();
        } catch (WebDriverException e) {
            LocalDateTime endTime = LocalDateTime.now();
            String formattedEndTime = endTime.format(formatter);
            result = "Test ID: " + testId + " - WebDriver error for username: " + username
                    + " - Start time: " + formattedStartTime
                    + ", End time: " + formattedEndTime
                    + " - " + getRootCauseMessage(e);
        } catch (Exception e) {
            LocalDateTime endTime = LocalDateTime.now();
            String formattedEndTime = endTime.format(formatter);
            result = "Test ID: " + testId + " - Test encountered an error for username: " + username
                    + " - Start time: " + formattedStartTime
                    + ", End time: " + formattedEndTime
                    + " - " + e.getMessage();
        } finally {
            tearDown();
        }

        return result;
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
            alert.accept();
        } catch (TimeoutException | NoAlertPresentException e) {
            // Alert was not present or timed out
        }
    }

    private void checkForErrorMessage() {
        try {
            WebElement errorMessage = driver.findElement(By.cssSelector(".error-message"));
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText);
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
}
