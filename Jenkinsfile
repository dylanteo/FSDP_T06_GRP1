pipeline {
    agent any

    environment {
        // Define the directory where the app is located
        APP_DIR = 'test/React/my-react-app'
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
    }

    post {
        success {
            echo 'Development server started successfully.'
        }
        failure {
            echo 'Failed to start the development server.'
        }
        always {
            script {
                // Cleanup to ensure processes are terminated
                bat 'taskkill /F /IM node.exe'  // Stop the React development server
            }
        }
    }
}
