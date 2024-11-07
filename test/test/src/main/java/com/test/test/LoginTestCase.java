package com.test.test;

public class LoginTestCase {
    private String username;
    private String password;

    // Constructor, getters, and setters

    public LoginTestCase(String username,String password) {
        this.username = username;
        this.password = password;
    }
    public void setUserName(String username)
    {
        this.username = username;
    }
    public void setPassWord(String password)
    {
        this.password = password;
    }
    public String getUserName()
    {
        return this.username;
    }
    public String getPassWord()
    {
        return this.password;
    }

}
