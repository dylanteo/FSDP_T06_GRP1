package com.test.test;
//
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.ITestResult;
import org.testng.annotations.*;
import com.aventstack.extentreports.*;
import com.aventstack.extentreports.markuputils.MarkupHelper;

import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class registerTestCase {

    private ThreadLocal<WebDriver> driver = new ThreadLocal<>();
    private MongoClient mongoClient;
    private MongoDatabase database;
    private MongoCollection<Document> collection;

    private ExtentReports extentReports;
    private ExtentTest extentTest;

    @BeforeClass
    public void setup() {
        // MongoDB setup
        String connectionString = "mongodb+srv://yanhui:yanhui@cluster0.sse7e.mongodb.net/TestCaseOutput1?retryWrites=true&w=majority";
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

        // Set up ExtentReports
        ExtentSparkReporter sparkReporter = new ExtentSparkReporter("test-output/ExtentReports.html");
        extentReports = new ExtentReports();
        extentReports.attachReporter(sparkReporter);
    }

    @BeforeMethod
    public void beforeMethod(Method method) {
        // Start a new test in ExtentReports
        extentTest = extentReports.createTest(method.getName());
    }

    @Test(dataProvider = "registerData", invocationCount = 1, threadPoolSize = 1)
    public void register(String browser, String firstName, String lastName, String address, String city,
                         String state, String zipCode, String phone, String ssn, String username, String password) {
        Instant startTime = Instant.now();
        String error = "";
        String responseMessage = "";
        WebDriver driver = null;

        try {
            extentTest.info("testing for firstName: " + firstName);
            extentTest.info("Initializing driver for browser: " + browser);
            initializeDriver(browser);
            driver = getDriver();

            extentTest.info("Navigating to registration page...");
            driver.get("https://parabank.parasoft.com/parabank/index.htm");
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

            try {
                // Click register link
                extentTest.info("Clicking register link...");
                WebElement registerLink = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//a[text()='Register']")));
                registerLink.click();

                // Fill in registration form
                extentTest.info("Filling registration form...");
                WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.firstName']")));
                WebElement lastNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.lastName']")));
                WebElement addressInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.address.street']")));
                WebElement cityInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.address.city']")));
                WebElement stateInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.address.state']")));
                WebElement zipCodeInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.address.zipCode']")));
                WebElement phoneInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.phoneNumber']")));
                WebElement ssnInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.ssn']")));
                WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.username']")));
                WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='customer.password']")));
                WebElement repeatedInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@id='repeatedPassword']")));

                extentTest.info("Entering registration details...");
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

                extentTest.info("Submitting registration form...");
                WebElement registerButton = wait.until(ExpectedConditions.elementToBeClickable(
                        By.xpath("//input[@type='submit' and @value='Register']")));
                registerButton.click();

                handleAlert(driver);

                // Check for error messages or success message
                try {
                    // First check for specific error messages
                    List<WebElement> errorElements = driver.findElements(By.className("error"));
                    if (!errorElements.isEmpty()) {
                        responseMessage = errorElements.stream()
                                .map(WebElement::getText)
                                .filter(text -> !text.isEmpty())
                                .collect(Collectors.joining(", "));
                        error = "Registration failed - " + responseMessage;
                        extentTest.fail(MarkupHelper.createLabel("Registration failed: " + responseMessage, ExtentColor.RED));
                        throw new AssertionError(error);
                    }

                    // Check for validation errors
                    List<WebElement> validationErrors = driver.findElements(By.cssSelector("span[class*='error']"));
                    if (!validationErrors.isEmpty()) {
                        responseMessage = validationErrors.stream()
                                .map(WebElement::getText)
                                .filter(text -> !text.isEmpty())
                                .collect(Collectors.joining(", "));
                        error = "Validation failed - " + responseMessage;
                        extentTest.fail(MarkupHelper.createLabel("Validation errors: " + responseMessage, ExtentColor.RED));
                        throw new AssertionError(error);
                    }

                    // If no errors, check for success message
                    WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                            By.xpath("//*[@id='rightPanel']/p")));
                    String actualMessage = successMessage.getText();
                    String expectedMessage = "Your account was created successfully. You are now logged in.";

                    if (actualMessage.equals(expectedMessage)) {
                        extentTest.pass(MarkupHelper.createLabel("Registration successful", ExtentColor.GREEN));
                    } else {
                        responseMessage = actualMessage;
                        error = "Registration failed - Unexpected message: " + responseMessage;
                        extentTest.fail(MarkupHelper.createLabel("Registration failed", ExtentColor.RED));
                        throw new AssertionError(error);
                    }

                } catch (TimeoutException e) {
                    // Check if there's any error message on the page
                    List<WebElement> possibleErrors = driver.findElements(
                            By.cssSelector("#rightPanel .error, #rightPanel .alert, #rightPanel .message"));
                    if (!possibleErrors.isEmpty()) {
                        responseMessage = possibleErrors.stream()
                                .map(WebElement::getText)
                                .filter(text -> !text.isEmpty())
                                .collect(Collectors.joining(", "));
                    }
                    error = "Timeout while checking registration result: " +
                            (responseMessage.isEmpty() ? e.getMessage() : responseMessage);
                    extentTest.fail(MarkupHelper.createLabel(error, ExtentColor.RED));
                    throw new AssertionError(error);
                }

            } catch (TimeoutException e) {
                error = "Timeout waiting for elements: " + e.getMessage();
                extentTest.fail(MarkupHelper.createLabel("Timeout Exception: " + error, ExtentColor.RED));
                throw e;
            } catch (NoSuchElementException e) {
                error = "Element not found: " + e.getMessage();
                extentTest.fail(MarkupHelper.createLabel("Element Not Found: " + error, ExtentColor.RED));
                throw e;
            }

        } catch (Exception e) {
            error = e.getClass().getSimpleName() + ": " + e.getMessage();
            extentTest.fail(MarkupHelper.createLabel("Test Failed: " + error, ExtentColor.RED));
            extentTest.fail(e);
            throw e;
        } finally {
            Instant endTime = Instant.now();
            long timeTaken = Duration.between(startTime, endTime).toMillis();

            // Include response message in MongoDB document
            Document result = new Document()
                    .append("_id", UUID.randomUUID().toString())
                    .append("testCaseId", "RegisterTest")
                    .append("startTime", startTime.toString())
                    .append("endTime", endTime.toString())
                    .append("timeTaken", timeTaken)
                    .append("status", error.isEmpty() ? "Success" : "Failure")
                    .append("errorMessage", error)
                    .append("responseMessage", responseMessage)
                    .append("browser", browser)
                    .append("username", username);

            try {
                collection.insertOne(result);
                System.out.println("Test result saved to MongoDB");
            } catch (Exception e) {
                System.err.println("Failed to save test result to MongoDB: " + e.getMessage());
            }
            extentTest.info("test");
            extentTest.info("Test completed. Time taken: " + timeTaken + " ms");
        }
    }
    // Additional tests would follow the same structure as above...

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

        String hubUrl = "http://selenium-hub.default.svc.cluster.local:4444";

        try {
            if (browser.equalsIgnoreCase("chrome")) {
                hubUrl = "http://selenium-node-chrome.default.svc.cluster.local:4444";
            } else if (browser.equalsIgnoreCase("firefox")) {
                hubUrl = "http://selenium-node-firefox.default.svc.cluster.local:4444";
            } else if (browser.equalsIgnoreCase("edge")) {
                hubUrl = "http://selenium-node-edge.default.svc.cluster.local:4444";
            }
            driver.set(new RemoteWebDriver(new URL(hubUrl), capabilities));
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    private void handleAlert(WebDriver driver) {
        try {
            Alert alert = driver.switchTo().alert();
            alert.accept();
        } catch (NoAlertPresentException e) {
            // No alert present
        }
    }

    private void checkForErrorMessage(WebDriver driver) {
        try {
            WebElement errorMessage = driver.findElement(By.id("error-message"));
            if (errorMessage != null && errorMessage.isDisplayed()) {
                extentTest.fail("Error: " + errorMessage.getText());
            }
        } catch (NoSuchElementException e) {
            // No error message
        }
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        // Log the test result in ExtentReports
        if (result.getStatus() == ITestResult.FAILURE) {
            extentTest.fail(MarkupHelper.createLabel("Test Failed", ExtentColor.RED));
        } else if (result.getStatus() == ITestResult.SUCCESS) {
            extentTest.pass(MarkupHelper.createLabel("Test Passed", ExtentColor.GREEN));
        }

        // Quit WebDriver if it's still running
        if (driver.get() != null) {
            driver.get().quit();
        }
    }

    @AfterClass
    public void tearDownClass() {
        if (extentReports != null) {
            extentReports.flush();
        }

        // Close MongoDB connection
        if (mongoClient != null) {
            mongoClient.close();
        }
    }

    @DataProvider(name = "registerData")
    public Object[][] registerData() {
        return new Object[][]{
                {"chrome", "John", "Doe", "123 Street", "City", "State", "12345", "1234567890", "123-45-6789", "john_doe", "password123"},
                {"chrome", "John1", "Doe1", "123 Street1", "City1", "State1", "123451", "12345678901", "123-45-67891", "john_doe1", "password1231"}
        };
    }
    public static void main(String[] args) {
        org.testng.TestNG testNG = new org.testng.TestNG();
        testNG.setTestClasses(new Class[]{registerTestCase.class});
        testNG.setParallel(org.testng.xml.XmlSuite.ParallelMode.METHODS);
        testNG.setThreadCount(10);
        testNG.run();
    }
}
