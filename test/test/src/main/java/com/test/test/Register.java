package com.test.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.time.Duration;

@Service
public class Register {
    private SeleniumService seleniumService;
    private WebDriver driver;

    @Autowired
    public Register() {
        this.seleniumService = new SeleniumService();
    }



    public String runRegister(String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password,String browser) {
        seleniumService.setUp(browser);
        driver = seleniumService.getDriver();
        String result;

        try {
            register(firstName, lastName, address, city, state, zipCode, phone, ssn, username, password); // Call the testLogin method with only the username
            result = "Test completed successfully."; // Indicate success
        } catch (AssertionError e) {
            result = "Test failed: " + e.getMessage(); // Capture assertion failures
        } catch (WebDriverException e) {
            result = "WebDriver error: " + e.getMessage(); // Capture WebDriver-specific errors
        } catch (Exception e) {
            result = "Test encountered an error: " + e.getMessage(); // Capture other exceptions
        } finally {
            seleniumService.tearDown(); // Ensure the teardown happens regardless of test success
        }

        return result; // Return the result after cleanup
    }

    public void register(String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password) {
        driver.get("https://parabank.parasoft.com/parabank/index.htm");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement registerLink = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//a[text()='Register']")
        ));
        registerLink.click();


        WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.firstName']")
        ));
        firstNameInput.sendKeys(firstName);

        WebElement lastNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.lastName']")
        ));
        lastNameInput.sendKeys(lastName);

        WebElement addressInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.street']")
        ));
        addressInput.sendKeys(address);

        WebElement cityInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.city']")
        ));
        cityInput.sendKeys(city);

        WebElement stateInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.state']")
        ));
        stateInput.sendKeys(state);

        WebElement zipCodeInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.zipCode']")
        ));
        zipCodeInput.sendKeys(zipCode);

        WebElement phoneInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.phoneNumber']")
        ));
        phoneInput.sendKeys(phone);

        WebElement ssnInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.ssn']")
        ));
        ssnInput.sendKeys(ssn);

        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.username']")
        ));
        usernameInput.sendKeys(username);

        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.password']")
        ));
        passwordInput.sendKeys(password);

        WebElement repeatedInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='repeatedPassword']")
        ));
        repeatedInput.sendKeys(password);

        WebElement registerButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='submit' and @value='Register']")));
        registerButton.click();


        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();


        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[@id='rightPanel']/p")));

        // Verify that the message text is as expected
        Assert.assertEquals(successMessage.getText(), "Your account was created successfully. You are now logged in.", "Registration was not successful.");
        System.out.println("Registration was successful, and the message is displayed.");

    }






}