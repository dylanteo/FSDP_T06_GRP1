# Use an official OpenJDK image as the base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven `pom.xml` and `src` files to the container
COPY pom.xml .

# Download the dependencies first (to leverage Docker cache)
RUN ./mvnw dependency:go-offline

# Copy the rest of the application code to the container
COPY src ./src

# Build the application using Maven
RUN ./mvnw clean package -DskipTests

# Expose the port your Java application will run on
EXPOSE 8080

# Command to run the JAR file (make sure to replace with your actual JAR name)
CMD ["java", "-jar", "target/myapp.jar"]
