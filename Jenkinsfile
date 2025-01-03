pipeline {
    agent any

    environment {
        // Define the directory where the app is located
        APP_DIR = 'my-react-app'
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
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    // Build the React app
                    dir(APP_DIR) {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Start Backend') {
            steps {
                script {
                    // Start the backend server
                    dir(APP_DIR) {
                        sh 'npm run start:backend'
                    }
                }
            }
        }

        stage('Start Frontend') {
            steps {
                script {
                    // Start the React app frontend
                    dir(APP_DIR) {
                        sh 'npm run start'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build and deployment were successful.'
        }
        failure {
            echo 'Build or deployment failed.'
        }
    }
}
