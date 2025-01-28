pipeline {
    agent any

    environment {
        KUBECONFIG = credentials('kubeconfig-file-id')
        APP_DIR = 'test/React/my-react-app'
        K8S_NAMESPACE = 'your-namespace'
        DEPLOYMENT_FILES = "test/selenium-hub.yaml,test/selenium-hub-service.yaml,test/selenium-node-chrome-deployment.yaml,test/selenium-node-edge-deployment.yaml,test/selenium-node-firefox-deployment.yaml"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    dir(APP_DIR) {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Start React Development Server') {
            steps {
                script {
                    // Start the React app locally without deploying to Kubernetes
                    dir(APP_DIR) {
                        bat 'start /B npm run dev'
                        sleep 5 // Wait a bit for the server to start
                    }
                }
            }
        }

        stage('Deploy Selenium Hub and Nodes') {
            steps {
                script {
                    // Apply all Kubernetes deployment YAML files for Selenium
                    DEPLOYMENT_FILES.split(',').each { file ->
                        bat "kubectl apply -f ${file} --namespace=${K8S_NAMESPACE} --validate=false"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Development server started and Selenium Hub and Nodes deployed successfully.'
        }
        failure {
            echo 'Failed to start development server or deploy Selenium Hub/nodes.'
        }
        always {
            script {
                try {
                    // Clean up by stopping the React development server, check if node.exe is running
                    def processList = bat(script: 'tasklist /FI "IMAGENAME eq node.exe"', returnStdout: true).trim()
                    if (processList.contains('node.exe')) {
                        bat 'taskkill /F /IM node.exe'
                    } else {
                        echo 'No Node.js process found to kill.'
                    }
                } catch (Exception e) {
                    echo "Error during cleanup: ${e.getMessage()}"
                }
            }
        }
    }
}
