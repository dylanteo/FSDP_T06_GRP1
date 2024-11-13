package com.test.test;

import org.testng.annotations.Test;
import org.testng.annotations.Parameters;


public class testng {


//    @Test
//    @Parameters("browser")
//    public void test1(String browser){
//        System.out.println(admin.runAddCustomer(browser, "1", "1", "1"));
//    }
//
//    @Test
//    @Parameters("browser")
//    public void test2(String browser){
//        System.out.println(admin.runAddCustomer(browser, "2", "2", "2"));
//    }

    @Test
    @Parameters("browser")
    public void test3(String browser){
        System.out.println(admin.runAddCustomer(browser, "test","test","test"));
    }
}