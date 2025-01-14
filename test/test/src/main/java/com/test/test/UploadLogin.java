package com.test.test;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.ITestResult;
import org.testng.annotations.*;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

public class UploadLogin{

    private ThreadLocal<WebDriver> driver = new ThreadLocal<>();
    private MongoClient mongoClient;
    private MongoDatabase database;
    private MongoCollection<Document> collection;

    @BeforeClass
    public void setup() {
        // MongoDB setup
        String connectionString = "mongodb+srv://yanhui:yanhui@cluster0.sse7e.mongodb.net/TestCaseOutput1?retryWrites=true&w=majority&appName=Cluster0";

        try {
            System.out.println("Connecting to MongoDB...");
            mongoClient = MongoClients.create(connectionString);
            database = mongoClient.getDatabase("TestCaseOutput1");
            collection = database.getCollection("testCaseOutputs");
            System.out.println("Connected to MongoDB successfully.");
        } catch (Exception e) {
            System.err.println("Failed to connect to MongoDB: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Test method to perform login with multiple browsers in parallel
    @Test(dataProvider = "browserCredentials", invocationCount = 1, threadPoolSize = 3)
    public void login(String browser, String username, String password) {
        Instant startTime = Instant.now();
        String error = "";
        initializeDriver(browser);
        WebDriver driver = getDriver();
        System.out.println("Navigating to the login page...");
        driver.get("https://parabank.parasoft.com/parabank/index.htm");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));

        usernameInput.sendKeys(username);
        passwordInput.sendKeys(password);

        System.out.println("Clicking the login button...");
        driver.findElement(By.xpath("//input[@value='Log In']")).click();

        handleAlert(driver);
        checkForErrorMessage(driver);

        boolean loginSuccessful = driver.getCurrentUrl().equals("https://parabank.parasoft.com/parabank/overview.htm");
        Instant endTime = Instant.now();
        long timeTaken = Duration.between(startTime, endTime).toMillis();
        if(loginSuccessful == false)
        {
            error = "Invalid credientials";
        }

        System.out.println("Login test completed. Time taken: " + timeTaken + " ms. Login successful: " + loginSuccessful);

        saveTestResultToMongoDB("LoginTest", startTime, endTime, timeTaken, error,loginSuccessful);

        Assert.assertTrue(loginSuccessful, "Login was not successful.");
        tearDown();
    }

    // Test method to perform login with multiple browsers in parallel
    @Test(dataProvider = "registerData", invocationCount = 1, threadPoolSize = 1)
    public void register(String browser, String firstName, String lastName, String address, String city, String state, String zipCode, String phone, String ssn, String username, String password) {
        Instant startTime = Instant.now();
        String error = "";

        initializeDriver(browser);
        WebDriver driver = getDriver();
        driver.get("https://parabank.parasoft.com/parabank/index.htm");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement registerLink = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//a[text()='Register']")
        ));
        registerLink.click();


        WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.firstName']")
        ));
        WebElement lastNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.lastName']")
        ));
        WebElement addressInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.street']")
        ));
        WebElement cityInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.city']")
        ));
        WebElement stateInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.state']")
        ));
        WebElement zipCodeInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.address.zipCode']")
        ));
        WebElement phoneInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.phoneNumber']")
        ));
        WebElement ssnInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.ssn']")
        ));
        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.username']")
        ));
        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='customer.password']")
        ));
        WebElement repeatedInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@id='repeatedPassword']")
        ));

        firstNameInput.sendKeys(firstName);
        lastNameInput.sendKeys(lastName);
        addressInput.sendKeys(address);
        cityInput.sendKeys(city);
        stateInput.sendKeys(state);
        zipCodeInput.sendKeys(zipCode);
        phoneInput.sendKeys(phone);
        ssnInput.sendKeys(ssn);
        usernameInput.sendKeys(username);
        passwordInput.sendKeys(password);
        repeatedInput.sendKeys(password);

        WebElement registerButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='submit' and @value='Register']")));
        registerButton.click();


        handleAlert(driver);
        checkForErrorMessage(driver);


        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[@id='rightPanel']/p")));

        // Verify that the message text is as expected
        boolean success = successMessage.getText().equals("Your account was created successfully. You are now logged in.");

        if(success == false)
        {
            error = "Invalid username or password did not match";
        }

        Instant endTime = Instant.now();
        long timeTaken = Duration.between(startTime, endTime).toMillis();


        System.out.println("Register test completed. Time taken: " + timeTaken + " ms. Register successful " + success);

        saveTestResultToMongoDB("RegisterTest", startTime, endTime, timeTaken, error,success);

        Assert.assertTrue(success, "Registration was not successful.");

        tearDown();
    }

    @Test(dataProvider = "openNewAccount", invocationCount = 1, threadPoolSize = 1)
    public void openNewAccount(String browser, String username, String password, String accountType, String accountNumber) {
        Instant startTime = Instant.now();
        String error = "";
        boolean success = false; // Track test success
        WebDriver driver = null;

        try {
            initializeDriver(browser);
            driver = getDriver();
            System.out.println("Logging in...");
            driver.get("https://parabank.parasoft.com/parabank/index.htm");
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

            // Login
            WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
            usernameInput.sendKeys(username);

            WebElement passwordInput = driver.findElement(By.name("password"));
            passwordInput.sendKeys(password);

            WebElement loginButton = driver.findElement(By.xpath("//input[@value='Log In']"));
            loginButton.click();

            error = "Log In Failed";

            // Wait for successful login
            wait.until(ExpectedConditions.urlToBe("https://parabank.parasoft.com/parabank/overview.htm"));
            error = "";
            System.out.println("Login successful.");


            // Navigate to "Open New Account" page
            System.out.println("Navigating to 'Open New Account' page...");
            driver.findElement(By.linkText("Open New Account")).click();

            System.out.println("Current URL after navigating to 'Open New Account': " + driver.getCurrentUrl());

            // Select account type
            System.out.println("Selecting account type: " + accountType);
            WebElement accountTypeDropdown = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("type")));
            Select accountTypeSelect = new Select(accountTypeDropdown);
            accountTypeSelect.selectByVisibleText(accountType);

            // Select "From Account"
            WebElement fromAccountDropdown = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("fromAccountId")));
            wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(By.xpath("//select[@id='fromAccountId']/option"), 0));
            Select fromAccountSelect = new Select(fromAccountDropdown);
            fromAccountSelect.selectByValue(accountNumber);

            // Click "Open New Account" button
            WebElement createButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='button' and @value='Open New Account']")));
            createButton.click();

            handleAlert(driver);
            checkForErrorMessage(driver);

            // Verify success message
            WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[@id='openAccountResult']/p")));
            success = successMessage.getText().equals("Congratulations, your account is now open.");

            if (!success) {
                error = "Invalid account number or unexpected message.";
            }

            System.out.println("Open new account test completed successfully.");


        } finally {
            // Record the test result
            Instant endTime = Instant.now();
            long timeTaken = Duration.between(startTime, endTime).toMillis();
            System.out.println("Open new account test completed. Time taken: " + timeTaken + " ms. Open new account successful: " + success);
            saveTestResultToMongoDB("OpenNewAccountTest", startTime, endTime, timeTaken, error, success);

            // Cleanup WebDriver
            tearDown();
        }

        // Assert the success of the test
        Assert.assertTrue(success, "Open new account test failed. " + error);
    }


    @Test(dataProvider = "addAccountData", invocationCount = 1, threadPoolSize = 1)
    public void addAccount(String browser, String firstName, String lastName, String postCode)
    {
        Instant startTime = Instant.now();
        String error = "";
        initializeDriver(browser);
        WebDriver driver = getDriver();
        driver.get("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        // Locate the "Bank Manager Login" button and click it
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@ng-click, 'manager()') and contains(text(), 'Bank Manager Login')]"))
        );
        loginButton.click();

        wait.until(ExpectedConditions.urlToBe("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/manager"));

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


        boolean success = alertMessage1.contains("Account created successfully with account Number");
        alert1.accept();

        if(success == false)
        {
            error = "Account creation failed or unexpected message.";
        }

        Instant endTime = Instant.now();
        long timeTaken = Duration.between(startTime, endTime).toMillis();


        System.out.println("Add account test completed. Time taken: " + timeTaken + " ms. Add account successful: " + success);

        saveTestResultToMongoDB("AddAccountTest", startTime, endTime, timeTaken, error,success);

        Assert.assertTrue(success, "Add account was not successful.");

        tearDown();
    }

    @DataProvider(name = "browserCredentials", parallel = true)
    public Object[][] browserCredentials() {
        return new Object[][]{
                {"chrome", "test", "test"},
                {"firefox", "user2", "password2"},
                {"edge", "user3", "password3"}
        };
    }

    @DataProvider(name = "registerData", parallel = true)
    public Object[][] registerData() {
        return new Object[][]{
                {"chrome", "John", "Doe", "123 Main St", "Metropolis", "NY", "10001", "5551234567", "123-45-6789", "johndoe", "password1"},
                {"firefox", "Jane", "Smith", "456 Elm St", "Gotham", "NJ", "07001", "5559876543", "987-65-4321", "janesmith", "password2"},
                {"edge", "Alice", "Johnson", "789 Maple Dr", "Star City", "CA", "90210", "5555555555", "555-55-5555", "alicejohnson", "password3"}
        };
    }

    @DataProvider(name = "addAccountData",parallel = true)
    public Object[][] addAccountData() {
        return new Object[][]{
                {"chrome", "Clark", "Kent", "10001"},
                {"firefox", "Bruce", "Wayne", "07001"},
                {"edge", "Diana", "Prince", "90210"}
        };
    }

    @DataProvider(name = "openNewAccount",parallel = true)
    public Object[][] openNewAccount() {
        return new Object[][]{
                {"chrome","test","test","SAVINGS","15231"}

        };
    }

    private void saveTestResultToMongoDB(String testCaseId, Instant startTime, Instant endTime, long timeTaken, String error, boolean success) {
        String status = success ? "Success" : "Failure";

        Document result = new Document()
                .append("_id", UUID.randomUUID().toString())
                .append("testCaseId", testCaseId)
                .append("startTime", startTime.toString())
                .append("endTime", endTime.toString())
                .append("timeTaken", timeTaken)
                .append("status", status)
                .append("errorMessage", error);

        try {
            collection.insertOne(result);
            System.out.println("Document inserted successfully with status: " + status);
        } catch (Exception e) {
            System.err.println("Failed to insert document: " + e.getMessage());
        }
    }

    private WebDriver getDriver() {
        return driver.get();
    }

    private void initializeDriver(String browser) {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setBrowserName(browser.toLowerCase());

        if (browser.equalsIgnoreCase("chrome")) {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--disable-gpu");
            capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        } else if (browser.equalsIgnoreCase("firefox")) {
            FirefoxOptions options = new FirefoxOptions();
            options.addArguments("--headless");
            capabilities.setCapability(FirefoxOptions.FIREFOX_OPTIONS, options);
        } else if (browser.equalsIgnoreCase("edge")) {
            EdgeOptions options = new EdgeOptions();
            options.addArguments("--headless");
            capabilities.setCapability(EdgeOptions.CAPABILITY, options);
        }

        try {
            driver.set(new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), capabilities));
        } catch (MalformedURLException e) {
            throw new RuntimeException("Selenium Grid URL is invalid.", e);
        }
    }

    private void handleAlert(WebDriver driver) {
        try {
            Alert alert = driver.switchTo().alert();
            alert.accept();
        } catch (Exception e) {
            // No alert
        }
    }

    private void checkForErrorMessage(WebDriver driver) {
        try {
            WebElement errorMessage = driver.findElement(By.id("errorMessage"));
            if (errorMessage.isDisplayed()) {
                System.out.println("Error Message: " + errorMessage.getText());
            }
        } catch (Exception e) {
            // No error message found
        }
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }

    public static void main(String[] args) {
        org.testng.TestNG testNG = new org.testng.TestNG();
        testNG.setTestClasses(new Class[]{UploadLogin.class});
        testNG.setParallel(org.testng.xml.XmlSuite.ParallelMode.METHODS);
        testNG.setThreadCount(10);
        testNG.run();
    }

}
