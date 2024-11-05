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

import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

@Service
public class Deposit {
    private static WebDriver driver;
    private static final String GRID_URL = "http://localhost:4444/wd/hub"; // Update with your Grid hub URL

    public static void setUp() {
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

    public static String runDeposit() {
        setUp(); // Ensure the driver is set up before running tests
        String result;

        try {
            deposit(); // Call the testLogin method with only the username
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

    private static void deposit() {
        driver.get("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement loginLink = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'customer()') and contains(text(), 'Customer Login')]"))
        );
        loginLink.click();

        WebElement usernameDropdown = wait.until(ExpectedConditions.elementToBeClickable(
                By.id("userSelect")));
        Select selectCustomer = new Select(usernameDropdown);
        selectCustomer.selectByVisibleText("Harry Potter");

        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[text()='Login']")));
        loginButton.click();

        WebElement depositLink = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'deposit()') and contains(text(), 'Deposit')]"))
        );
        depositLink.click();


        WebElement amountInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//form[contains(@ng-submit, 'deposit()')]//input[@placeholder='amount']")
        ));

        amountInput.sendKeys(String.valueOf(100));

        WebElement depositButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[text()='Deposit']"))
        );
        depositButton.click();

        handleAlert();
        checkForErrorMessage();

        try {
            // Wait until the success message is visible
            WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//span[text()='Deposit Successful' and @ng-show='message']")));

            // Verify that the message text is as expected
            Assert.assertEquals(successMessage.getText(), "Deposit Successful", "Deposit was not successful.");
            System.out.println("Deposit was successful, and the message is displayed.");
        } catch (TimeoutException e) {
            Assert.fail("Deposit success message was not displayed.");
        }
    }

    private static void handleAlert() {
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

    private static void checkForErrorMessage() {
        try {
            WebElement errorMessage = driver.findElement(By.cssSelector(".error-message")); // Adjust the selector
            String errorText = errorMessage.getText();
            System.out.println("Error message: " + errorText); // Print error message for debugging

            Assert.assertNotNull(errorText, "Error message should not be null.");

        } catch (NoSuchElementException e) {
            // No error message was present
        }
    }

    public static void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
