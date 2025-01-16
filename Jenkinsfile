pipeline {
    agent any

    environment {
        // Define the directory where the app is located
        APP_DIR = 'test/React/my-react-app'
        SELENIUM_SERVER_JAR = 'test/test/selenium-server-4.26.0.jar' // Update this path
        SELENIUM_GRID_URL = 'http://localhost:4444/wd/hub'  // URL to access the Selenium Grid
        BROWSER_CHROME = 'chrome'
        BROWSER_FIREFOX = 'firefox'
        BROWSER_EDGE = 'MicrosoftEdge'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the source code from the repository
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Navigate to the app directory and install npm dependencies
                    dir(APP_DIR) {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Start Development Server') {
            steps {
                script {
                    // Run npm run dev in the background to start the development server
                    dir(APP_DIR) {
                        bat 'start /B npm run dev'
                    }
                }
            }
        }

        stage('Start Selenium Server') {
            steps {
                script {
                    // Start the Selenium server in the background
                    bat "start /B java -jar ${SELENIUM_SERVER_JAR} standalone"
                }
            }
        }

        stage('Run Tests on Chrome') {
            steps {
                script {
                    // Run your tests on Chrome using Selenium WebDriver
                    echo "Running tests on Chrome"
                    bat """
                    mvn clean test -Dbrowser=${BROWSER_CHROME} -Dselenium.url=${SELENIUM_GRID_URL}
                    """
                }
            }
        }

        stage('Run Tests on Firefox') {
            steps {
                script {
                    // Run your tests on Firefox using Selenium WebDriver
                    echo "Running tests on Firefox"
                    bat """
                    mvn clean test -Dbrowser=${BROWSER_FIREFOX} -Dselenium.url=${SELENIUM_GRID_URL}
                    """
                }
            }
        }

        stage('Run Tests on Edge') {
            steps {
                script {
                    // Run your tests on Edge using Selenium WebDriver
                    echo "Running tests on Microsoft Edge"
                    bat """
                    mvn clean test -Dbrowser=${BROWSER_EDGE} -Dselenium.url=${SELENIUM_GRID_URL}
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Development server, Selenium server, and tests executed successfully.'
        }
        failure {
            echo 'Failed to start the servers or run tests.'
        }
        always {
            script {
                // Cleanup to ensure processes are terminated
                bat 'taskkill /F /IM node.exe'    // Stop the React development server
                bat 'taskkill /F /IM java.exe'    // Stop the Selenium server
            }
        }
    }
}
