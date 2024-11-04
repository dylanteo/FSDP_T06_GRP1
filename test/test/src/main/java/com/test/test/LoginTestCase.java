package com.test.test;

public class LoginTestCase {
    private String userName;
    private String passWord;

    // Constructor, getters, and setters

    public LoginTestCase(String userName,String passWord) {
        this.userName = userName;
        this.passWord = passWord;
    }
    public void setUserName(String userName)
    {
        this.userName = userName;
    }
    public void setPassWord(String passWord)
    {
        this.passWord = passWord;
    }
    public String getUserName()
    {
        return this.userName;
    }
    public String getPassWord()
    {
        return this.passWord;
    }

}
