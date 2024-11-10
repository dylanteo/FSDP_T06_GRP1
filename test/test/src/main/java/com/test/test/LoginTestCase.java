package com.test.test;

public class LoginTestCase {
    private String username;
    private String password;
    private String browser;

    // Constructor, getters, and setters

    public LoginTestCase(String username,String password,String browser) {
        this.username = username;
        this.password = password;
        this.browser = browser;
    }
    public void setUserName(String username)
    {
        this.username = username;
    }
    public void setPassWord(String password)
    {
        this.password = password;
    }
    public void setBrowser(String browser){this.browser = browser;}
    public String getUserName()
    {
        return this.username;
    }
    public String getPassWord()
    {
        return this.password;
    }
    public String getBrowser(){return this.browser;}

}
