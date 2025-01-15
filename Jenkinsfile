pipeline {
    agent any

    environment {
        // Define the directory where the app is located
        APP_DIR = 'test/React/my-react-app'
        SELENIUM_SERVER_JAR = 'test/test/selenium-server-4.26.0.jar' // Update this path
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
    }

    post {
        success {
            echo 'Development server and Selenium server started successfully.'
        }
        failure {
            echo 'Failed to start the servers.'
        }
        always {
            script {
                // Cleanup to ensure processes are terminated
                bat 'taskkill /F /IM node.exe'    // Stop the React development server
                bat 'taskkill /F /IM java.exe'   // Stop the Selenium server
            }
        }
    }
}
