package com.test.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import io.github.bonigarcia.wdm.WebDriverManager;

public class HeadlessTest {
    public static void main(String[] args) {
        // Set up ChromeDriver using WebDriverManager
        WebDriverManager.chromedriver().setup();

        // Create ChromeOptions object
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode
        options.addArguments("--no-sandbox"); // Optional: for certain environments
        options.addArguments("--disable-dev-shm-usage"); // Optional: for certain environments

        // Create WebDriver instance with options
        WebDriver driver = new ChromeDriver(options);

        try {
            // Your test code here
            driver.get("http://localhost:3000/loginsignup.html");
            System.out.println("Title: " + driver.getTitle());

            // Add further interactions and assertions as needed
        } finally {
            // Clean up and close the browser
            driver.quit();
        }
    }
}
