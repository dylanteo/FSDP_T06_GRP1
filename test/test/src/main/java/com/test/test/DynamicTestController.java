//package com.test.test;
//
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import java.io.*;
//import javax.tools.*;
//import java.lang.reflect.*;
//
//@RestController
//@RequestMapping("/api")
//public class DynamicTestController {
//
//    @GetMapping("/executeTest")
//    public ResponseEntity<String> executeTest(@RequestParam String className) {
//        try {
//            // Dynamically compile the test class from the file
//            String filePath = "src/main/java/com/test/test/" + className + ".java"; // Assuming it's uploaded here
//            compileJavaFile(filePath);
//
//            // Dynamically load and run the compiled class
//            Class<?> testClass = Class.forName("com.test.test." + className);  // Fully qualified name
//            Method method = testClass.getMethod("testMethod");  // Assuming test method is named `testMethod`
//            Object testInstance = testClass.getDeclaredConstructor().newInstance();
//            method.invoke(testInstance);  // Run the test method
//
//            return ResponseEntity.ok("Test executed successfully!");
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error executing test: " + e.getMessage());
//        }
//    }
//
//    private void compileJavaFile(String filePath) throws Exception {
//        // Prepare a JavaCompiler to dynamically compile the .java file
//        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
//        int result = compiler.run(null, null, null, filePath);
//        if (result != 0) {
//            throw new Exception("Compilation failed for file: " + filePath);
//        }
//    }
//}
