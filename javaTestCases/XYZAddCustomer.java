package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.ITestResult;
import org.testng.annotations.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

public class XYZAddCustomer {
    private ThreadLocal<WebDriver> driver = new ThreadLocal<>();
    private ThreadLocal<ObjectNode> currentTestData = new ThreadLocal<>();
    private static ArrayNode allTestResults = new ObjectMapper().createArrayNode();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeClass(alwaysRun = true)
    public void setup() {
        allTestResults = objectMapper.createArrayNode();
        File resultsFile = new File("test-results.json");
        if (resultsFile.exists()) {
            resultsFile.delete();
        }
    }

    @BeforeMethod
    public void beforeMethod(Method method, Object[] testData) {
        String browser = (String) testData[0];
        String firstName = (String) testData[1];
        String lastName = (String) testData[2];

        ObjectNode testNode = objectMapper.createObjectNode();
        testNode.put("browser", browser);
        testNode.put("firstName", firstName);
        testNode.put("lastName", lastName);
        testNode.put("threadName", Thread.currentThread().getName());
        LocalDate date = LocalDate.now();
        String dateString = date.toString();
        testNode.put("date", dateString);
        testNode.put("startTime", Instant.now().toString());
        testNode.put("testName", String.format("Add Account Test - %s %s (%s)", firstName, lastName, Thread.currentThread().getName()));

        ArrayNode steps = objectMapper.createArrayNode();
        testNode.set("steps", steps);

        currentTestData.set(testNode);
    }

    private void handleAlert(WebDriverWait wait) {
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            alert.accept();
        } catch (Exception e) {
            // No alert or failed to handle
        }
    }

    private void addTestStep(ObjectNode testData, String stepName, String status, String message) {
        ArrayNode steps = (ArrayNode) testData.get("steps");
        ObjectNode step = objectMapper.createObjectNode();
        step.put("name", stepName);
        step.put("status", status);
        step.put("message", message);
        step.put("timestamp", Instant.now().toString());
        steps.add(step);
    }

    @Test(dataProvider = "addAccountData", invocationCount = 3, threadPoolSize = 3)
    public void addAccount(String browser, String firstName, String lastName, String postCode) {
        ObjectNode testData = currentTestData.get();
        Instant startTime = Instant.now();

        try {
            addTestStep(testData, "Setup", "info", "Initializing test with browser: " + browser);

            initializeDriver(browser);
            addTestStep(testData, "Driver Initialization", "pass", "Driver initialized successfully");

            WebDriver driver = getDriver();
            driver.get("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login");
            addTestStep(testData, "Navigation", "pass", "Navigated to banking project login page");

            performAddAccountSteps(driver, testData, firstName, lastName, postCode);

        } catch (Exception e) {
            String error = e.getClass().getSimpleName() + ": " + e.getMessage();
            addTestStep(testData, "Error", "fail", error);
            throw e;
        } finally {
            testData.put("endTime", Instant.now().toString());
            testData.put("duration", Duration.between(startTime, Instant.now()).toMillis());
        }
    }

    private void performAddAccountSteps(WebDriver driver, ObjectNode testData, String firstName, String lastName, String postCode) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        try {
            // Bank Manager Login
            WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(@ng-click, 'manager()') and contains(text(), 'Bank Manager Login')]"))
            );
            loginButton.click();
            addTestStep(testData, "Login", "pass", "Logged in as Bank Manager");

            // Add Customer
            WebElement addCustomerButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(@ng-click, 'addCust()') and contains(text(), 'Add Customer')]"))
            );
            addCustomerButton.click();
            addTestStep(testData, "Navigate", "pass", "Navigated to Add Customer page");

            // Fill Customer Details
            fillCustomerForm(wait, firstName, lastName, postCode);
            addTestStep(testData, "Customer Form", "pass", "Filled customer details successfully");

            // Open Account
//            openAccount(wait, firstName, lastName);
//            addTestStep(testData, "Open Account", "pass", "Opened account successfully");

        } catch (Exception e) {
            addTestStep(testData, "Add Customer Process", "fail", "Failed to complete add Customer process: " + e.getMessage());
            throw e;
        }
    }

    private void fillCustomerForm(WebDriverWait wait, String firstName, String lastName, String postCode) {
        try {
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

            WebElement addCustomerButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[@type='submit' and @class='btn btn-default']")
            ));
            addCustomerButton.click();

            // Handle potential alerts
            try {
                Alert alert = wait.until(ExpectedConditions.alertIsPresent());
                String alertText = alert.getText();

                if (alertText.contains("Customer added successfully with customer id :")) {
                    String customerId = alertText.split(":")[1].trim();
                    addTestStep(currentTestData.get(), "Customer Form", "pass",
                            "Customer added successfully. Customer ID: " + customerId);
                    alert.accept();
                } else if (alertText.contains("Customer may be duplicate") ||
                        alertText.contains("Please check the details")) {
                    addTestStep(currentTestData.get(), "Customer Form", "warning",
                            "Potential duplicate customer: " + alertText);
                    alert.accept();
                    throw new RuntimeException("Duplicate customer detected: " + alertText);
                } else {
                    alert.accept();
                }
            } catch (Exception alertEx) {
                // If no specific alert found, rethrow or handle as needed
                throw alertEx;
            }
        } catch (Exception e) {
            addTestStep(currentTestData.get(), "Customer Form", "fail",
                    "Error adding customer: " + e.getMessage());
            throw e;
        }
    }

//    private void openAccount(WebDriverWait wait, String firstName, String lastName) {
//        WebElement openAccountTab = wait.until(ExpectedConditions.elementToBeClickable(
//                By.xpath("//button[contains(@ng-click, 'openAccount()') and contains(text(), 'Open Account')]"))
//        );
//        openAccountTab.click();
//
//        WebElement customerDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("userSelect")));
//        Select selectCustomer = new Select(customerDropdown);
//
//        String fullName = firstName + " " + lastName;
//        selectCustomer.selectByVisibleText(fullName);
//
//        WebElement currencyDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("currency")));
//        Select currency = new Select(currencyDropdown);
//        currency.selectByVisibleText("Dollar");
//
//        WebElement processButton = wait.until(ExpectedConditions.elementToBeClickable(
//                By.xpath("//button[@type='submit' and contains(text(), 'Process')]"))
//        );
//        processButton.click();
//
//        handleAlert(wait);
//    }

    private void initializeDriver(String browser) {
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

            driver.set(new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), capabilities));
            driver.get().manage().window().maximize();
            driver.get().manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize driver: " + e.getMessage(), e);
        }
    }

    private WebDriver getDriver() {
        return driver.get();
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        ObjectNode testData = currentTestData.get();
        testData.put("status", result.getStatus() == ITestResult.SUCCESS ? "pass" : "fail");

        if (result.getThrowable() != null) {
            testData.put("error", result.getThrowable().getMessage());
        }

        synchronized (allTestResults) {
            allTestResults.add(testData);
        }

        WebDriver driverInstance = driver.get();
        if (driverInstance != null) {
            driverInstance.quit();
            driver.remove();
        }

        currentTestData.remove();
    }

    @AfterClass(alwaysRun = true)
    public void afterClass() {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("testName", this.getClass().getSimpleName());
            rootNode.set("testResults", allTestResults);

            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File("test-results.json"), rootNode);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

@DataProvider(name = "addAccountData", parallel = true)
public Object[][] addAccountData() {
    return new Object[][]{
            {"chrome", "Clark", "Kent", "10001"},
            {"firefox", "Bruce", "Wayne", "07001"},
            {"edge", "Diana", "Prince", "90210"},
            {"chrome", "Hermione", "Granger", "E859AB"},
            {"firefox", "Tony", "Stark", "30303"},
            {"edge", "Natasha", "Romanoff", "60606"},
            {"chrome", "Steve", "Rogers", "70707"},
            {"firefox", "Barry", "Allen", "90909"},
            {"edge", "Peter", "Parker", "11222"},
            {"chrome", "Wanda", "Maximoff", "22333"},
            {"firefox", "Logan", "Howlett", "33444"},
            {"edge", "Charles", "Xavier", "44555"},
            {"chrome", "Arthur", "Curry", "66777"},
            {"firefox", "Victor", "Stone", "77888"},
            {"edge", "Hal", "Jordan", "88999"},
    };
}

    public static void main(String[] args) {
        org.testng.TestNG testNG = new org.testng.TestNG();
        testNG.setTestClasses(new Class[]{XYZAddCustomer.class});
        testNG.setParallel(org.testng.xml.XmlSuite.ParallelMode.METHODS);
        testNG.setThreadCount(3);
        testNG.run();
    }
}