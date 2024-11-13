package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.devtools.v121.fedcm.model.Account;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.sql.Time;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class admin {

    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();
    private static final SeleniumService seleniumService = new SeleniumService();

    private static WebDriver getDriver(String browser) {
        WebDriver driver = driverThreadLocal.get();
        if (driver == null) {
            seleniumService.setUp(browser);  // Pass browser type to SeleniumService
            driver = seleniumService.getDriver();
            driverThreadLocal.set(driver);
        }
        return driver;
    }
    private static void cleanupDriver() {
        try {
            WebDriver driver = driverThreadLocal.get();
            if (driver != null) {
                seleniumService.tearDown();
                driverThreadLocal.remove(); // Remove the ThreadLocal reference
            }
        } catch (Exception e) {
            // Log the cleanup error but don't throw it
            System.err.println("Error during driver cleanup: " + e.getMessage());
        }
    }

    public static String runBankManagerLogin(String browser)
    {
        String starttime = "";
        String endtime = "";
        boolean success = false;
        String error;
        String result;
        try{
            starttime = LocalDateTime.now().toString();
            WebDriver driver = getDriver(browser);
            endtime = LocalDateTime.now().toString();
            bankManagerLogin(driver);
            success = true;
            result = "test completed";
        }catch (AssertionError e) {
            //success = false;
            result = "Test failed: " + e.getMessage();
        } catch (WebDriverException e) {
            //success = false;
            result = "WebDriver error: " + e.getMessage();
        } catch (Exception e) {
            //success = false;
            result = "Test encountered an error: " + e.getMessage();
        } finally {
            cleanupDriver(); // Use the new cleanup method
            seleniumService.tearDown();

        }
        TestCaseResult tcr = new TestCaseResult(starttime,endtime,success,result);
        //seleniumService.tearDown();
        return tcr.toString();
    }
    public static String runAddCustomer(String browser, String firstName, String lastName, String postCode)
    {
        String starttime = "";
        String endtime = "";
        boolean success = false;
        String error;
        String result;
        starttime = LocalDateTime.now().toString();

        try {
            WebDriver driver = getDriver(browser);
            addAccount(driver, firstName, lastName, postCode);
            endtime = LocalDateTime.now().toString();
            success = true;
            result = "test completed";
        } catch (AssertionError e) {
            //success = false;
            result = "Test failed: " + e.getMessage();
            endtime = LocalDateTime.now().toString();
        } catch (WebDriverException e) {
            //success = false;
            result = "WebDriver error: " + e.getMessage();
            endtime = LocalDateTime.now().toString();
        } catch (Exception e) {
            //success = false;
            result = "Test encountered an error: " + e.getMessage();
            endtime = LocalDateTime.now().toString();
        } finally {
            cleanupDriver(); // Ensure proper cleanup of the WebDriver
            seleniumService.tearDown();

        }
        TestCaseResult tcr = new TestCaseResult(starttime,endtime,success,result);
        //seleniumService.tearDown();
        return tcr.toString1();
    }
    public static void bankManagerLogin(WebDriver driver)
    {
        driver.get("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        // Locate the "Bank Manager Login" button and click it
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'manager()') and contains(text(), 'Bank Manager Login')]"))
        );
        loginButton.click();

        // Set an explicit wait for the page to load and the URL to change
        WebDriverWait wait1 = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait1.until(ExpectedConditions.urlToBe("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/manager"));

        // Assert that the current URL matches the expected URL
        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, "https://www.globalsqa.com/angularJs-protractor/BankingProject/#/manager",
                "The URL did not change to the expected URL.");

        // Close the browser
        driver.quit();
    }
    public static void addAccount(WebDriver driver, String firstName, String lastName, String postCode)
    {
        driver.get("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        // Locate the "Bank Manager Login" button and click it
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'manager()') and contains(text(), 'Bank Manager Login')]"))
        );
        loginButton.click();

        WebDriverWait wait1 = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait1.until(ExpectedConditions.urlToBe("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/manager"));

        // Locate and click the "Add Customer" button
        WebElement addCustomer = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'addCust()') and contains(text(), 'Add Customer')]"))
        );
        addCustomer.click();

        // Fill out the form
        WebElement firstNameInput = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//input[@ng-model='fName' and @placeholder='First Name']")
        ));
        firstNameInput.sendKeys(firstName);

        WebElement lastNameField = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//input[@ng-model='lName' and @placeholder='Last Name']")
        ));
        lastNameField.sendKeys(lastName);

        WebElement postCodeField = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//input[@ng-model='postCd' and @placeholder='Post Code']")
        ));
        postCodeField.sendKeys(postCode);

        WebElement addCustomerButton = driver.findElement(By.xpath("//button[@type='submit' and @class='btn btn-default']"));
        addCustomerButton.click();

        // Wait for the alert to be present
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());
        String alertMessage = alert.getText();
        System.out.println("Alert Message: " + alertMessage);

        // Check the alert message to determine success or failure
        if (alertMessage.contains("Customer added successfully")) {
            System.out.println("Success: Customer added successfully");
            alert.accept();
        } else if (alertMessage.contains("Please check the details.")) {
            // If the customer is not added due to duplicate or invalid details, mark as failure
            System.out.println("Failure: Customer not added (Details are invalid or duplicated)");
            alert.accept(); // Optionally, you can dismiss the alert here
        } else {
            // Handle unexpected alerts
            System.out.println("Unexpected alert message: " + alertMessage);
            alert.accept();
        }
        WebElement openAccount = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'openAccount()') and contains(text(), 'Open Account')]"))
        );
        openAccount.click();

        WebElement usernameDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("userSelect")));
        Select selectCustomer = new Select(usernameDropdown);

        WebDriverWait waitForOptions = new WebDriverWait(driver, Duration.ofSeconds(10));
        waitForOptions.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.xpath("//select[@id='userSelect']/option")));
        String name = firstName + " "+ lastName;
        selectCustomer.selectByVisibleText(name);

        WebElement Currency = wait.until(ExpectedConditions.elementToBeClickable(
                By.id("currency")));
        Select currency = new Select(Currency);
        currency.selectByVisibleText("Dollar");

        WebElement processButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[@type='submit' and contains(text(), 'Process')]"))
        );
        processButton.click();
        Alert alert1 = wait.until(ExpectedConditions.alertIsPresent());
        String alertMessage1 = alert1.getText();
        System.out.println("Alert Message: " + alertMessage);
        if (alertMessage1.contains("Account created successfully with account Number")) {
            System.out.println("Success: Account created successfully with account number.");
            alert1.accept();
        } else {
            System.out.println("Failure: Account creation failed or unexpected message.");
            alert1.accept();
        }
        driver.quit();
    }
}