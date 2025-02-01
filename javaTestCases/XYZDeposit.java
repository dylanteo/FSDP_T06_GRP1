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

public class XYZDeposit {
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
        testNode.put("date", date.toString());
        testNode.put("startTime", Instant.now().toString());
        testNode.put("testName", String.format("Deposit - %s %s (%s)", firstName, lastName, Thread.currentThread().getName()));

        ArrayNode steps = objectMapper.createArrayNode();
        testNode.set("steps", steps);

        currentTestData.set(testNode);
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
    @Test(dataProvider = "addAccountData", invocationCount = 1, threadPoolSize = 1)
    public void addAccount(String browser, String firstName, String lastName, String account, String amount) {
        ObjectNode testData = currentTestData.get();
        Instant startTime = Instant.now();

        try {
            addTestStep(testData, "Driver Initialization", "info", "Initializing test with browser: " + browser);
            initializeDriver(browser);
            WebDriver driver = getDriver();
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

            driver.get("https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login");
            addTestStep(testData, "Navigation", "pass", "Navigated to banking project login page");

            performDepositSteps(driver, testData, firstName,lastName, account, amount);

        } catch (Exception e) {
            addTestStep(testData, "Error", "fail", e.getClass().getSimpleName() + ": " + e.getMessage());
            throw e;
        }finally {
            testData.put("endTime", Instant.now().toString());
            testData.put("duration", Duration.between(startTime, Instant.now()).toMillis());
        }
    }
    private void performDepositSteps(WebDriver driver, ObjectNode testData,
                                     String firstName, String lastName, String account, String amount) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        try{
            WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(@ng-click, 'customer()') and contains(text(), 'Customer Login')]"))
            );
            loginButton.click();
            addTestStep(testData, "Deposit", "pass", "Logged in as Customer");
            logIn(wait,testData,firstName,lastName,account,amount);
        }catch (Exception e){
            addTestStep(testData, "Process Failure", "fail", "Failed to complete process: " + e.getMessage());
            throw e;
        }
    }
    private void logIn(WebDriverWait wait, ObjectNode testData,
                       String firstName, String lastName, String account,String amount) {
        try{
            WebElement customerDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("userSelect")));
            Select selectCustomer = new Select(customerDropdown);

            String fullName = firstName + " " + lastName;
            selectCustomer.selectByVisibleText(fullName);
            WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(@ng-show, 'custId != ') and contains(text(), 'Login')]"))
            );
            loginButton.click();
            addTestStep(testData, "Deposit", "pass", String.format("Logged in as %s %s", firstName, lastName));
            deposit(wait, testData, firstName,lastName, account, amount);
        }catch (Exception e) {
            addTestStep(testData, "Error", "fail", e.getClass().getSimpleName() + ": " + e.getMessage());
            throw e;
        }
    }
    private void deposit(WebDriverWait wait, ObjectNode testData,
                         String firstName, String lastName, String account,String amount) {
        try{
            WebElement accountDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("accountSelect")));
            Select selectAccount = new Select(accountDropdown);
            selectAccount.selectByVisibleText(account);
            addTestStep(testData, "Deposit", "pass", String.format("Selected Account: %s", account));
            WebElement depositButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[contains(@ng-click, 'deposit()') and contains(text(), 'Deposit')]"))
            );
            depositButton.click();
            addTestStep(testData, "Deposit", "pass", "Clicked on the deposit button");
            WebElement amountField = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//input[@ng-model='amount' and @placeholder='amount']")
            ));
            amountField.sendKeys(amount);
            addTestStep(testData, "Deposit", "pass", "Entered deposit amount");
            WebElement DepositButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[@type='submit' and text()='Deposit']"))
            );
            DepositButton.click();
            addTestStep(testData, "Deposit", "pass", "Deposited");
            WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//span[@class='error ng-binding' and contains(text(), 'Deposit Successful')]")
            ));

            if (successMessage != null) {
                addTestStep(testData, "Deposit", "pass", "Successfully deposited");
                System.out.println("Deposit was successful.");
            } else {
                addTestStep(testData, "Deposit", "fail", "deposit failed");
                System.out.println("Deposit failed.");
            }
        }catch (Exception e) {
            addTestStep(testData, "Process Failure", "fail", "Failed to complete process: " + e.getMessage());
            throw e;
        }
    }





    private void initializeDriver(String browser) {
        try {
            DesiredCapabilities capabilities = new DesiredCapabilities();
            capabilities.setBrowserName(browser.toLowerCase());

            switch (browser.toLowerCase()) {
                case "chrome":
                    ChromeOptions chromeOptions = new ChromeOptions();
                    chromeOptions.addArguments("--disable-gpu","--headless");
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
                {"chrome", "Hermoine", "Granger", "1001","1000"},
                {"firefox", "Harry", "Potter", "1004","1000"},
                {"edge", "Ron", "Weasly", "1007","1000"},
                {"chrome", "Ron", "Wealy", "Rupee","1000"}
        };
    }

    public static void main(String[] args) {
        org.testng.TestNG testNG = new org.testng.TestNG();
        testNG.setTestClasses(new Class[]{XYZDeposit.class});
        testNG.setParallel(org.testng.xml.XmlSuite.ParallelMode.METHODS);
        testNG.setThreadCount(3);
        testNG.run();
    }
}