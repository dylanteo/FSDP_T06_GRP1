package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;

@Service
public class Login {
    private static SeleniumService seleniumService;
    private static WebDriver driver;

    public Login() {
        this.seleniumService = new SeleniumService();
    }

    // Method to run the standard login test
    public static String runLogin(String username, String password) {
        seleniumService.setUp();
        driver = seleniumService.getDriver();
        String result;

        try {
            login(username, password); // Call the login method
            result = "Login Test completed successfully."; // Indicate success
        } catch (AssertionError e) {
            result = "Login Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Login Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }

    // Private method to perform the login steps
    private static void login(String username, String password) {
        driver.get("https://parabank.parasoft.com/parabank/index.htm");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@name='username' and @type='text']")
        ));
        usernameInput.sendKeys(username);

        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@name='password' and @type='password']")
        ));
        passwordInput.sendKeys(password);

        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='submit' and @value='Log In']")));
        loginButton.click();

        // Handle potential alerts and check for any error messages
        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();

        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, "https://parabank.parasoft.com/parabank/overview.htm", "Login was not successful.");
    }

    // Method to run the "Forgot Login Info" test
    public static String runForgotLoginInfo() {
        seleniumService.setUp();
        driver = seleniumService.getDriver();
        String result;

        try {
            forgotLoginInfo(); // Call the forgotLoginInfo method
            result = "Forgot Login Info Test completed successfully."; // Indicate success
        } catch (AssertionError e) {
            result = "Forgot Login Info Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Forgot Login Info Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }

    // Private method to perform the "Forgot Login Info" steps
    private static void forgotLoginInfo() {
        // Navigate to the initial login page
        driver.get("https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Click on the "Forgot login info?" link
        WebElement forgotLoginLink = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.linkText("Forgot login info?")
        ));
        forgotLoginLink.click();

        // Wait until the lookup page loads
        wait.until(ExpectedConditions.urlContains("https://parabank.parasoft.com/parabank/lookup.htm"));

        // Fill out the "Customer Lookup" form
        driver.findElement(By.id("firstName")).sendKeys("ced");
        driver.findElement(By.id("lastName")).sendKeys("ced");
        driver.findElement(By.id("address.street")).sendKeys("ced");
        driver.findElement(By.id("address.city")).sendKeys("ced");
        driver.findElement(By.id("address.state")).sendKeys("ced");
        driver.findElement(By.id("address.zipCode")).sendKeys("ced");
        driver.findElement(By.id("ssn")).sendKeys("ced");

        // Click the "Find My Login Info" button
        WebElement findLoginButton = driver.findElement(By.xpath("//input[@type='submit' and @value='Find My Login Info']"));
        findLoginButton.click();

        // Wait for the username and password to display in the right panel
        WebElement rightPanel = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("rightPanel")
        ));

        // Extract the text content of the right panel
        String panelText = rightPanel.getText();
        System.out.println("Debug: Right panel text content:\n" + panelText);

        try {
            // Extract Username
            String displayedUsername = panelText.split("Username:")[1].split("Password:")[0].trim();
            // Extract Password
            String displayedPassword = panelText.split("Password:")[1].trim();

            // Verify the retrieved username and password
            Assert.assertEquals(displayedUsername, "cedricojx", "Username does not match expected value.");
            Assert.assertEquals(displayedPassword, "cedricojx", "Password does not match expected value.");
        } catch (ArrayIndexOutOfBoundsException e) {
            throw new AssertionError("Could not parse username and password from text: " + panelText, e);
        }
    }



}
