package com.test.test;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.testng.Assert;

import java.math.BigDecimal;
import java.time.Duration;

@Service
public class Login {
    private static SeleniumService seleniumService;
    private static WebDriver driver;

    public Login() {
        this.seleniumService = new SeleniumService();
    }

    /*private static WebDriver driver;
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
    }*/

    public static String runLogin(String username, String password) {
        seleniumService.setUp();
        driver = seleniumService.getDriver();
        String result;

        try {
            login(username, password); // Call the testLogin method with only the username
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


        seleniumService.handleAlert();
        seleniumService.checkForErrorMessage();


        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, "https://parabank.parasoft.com/parabank/overview.htm", "Login was not successful.");


    }



}

