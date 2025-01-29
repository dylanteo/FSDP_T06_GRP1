pipeline {
    agent any

    environment {
        KUBECONFIG = credentials('kubeconfig-file-id')
        APP_DIR = 'test/React/my-react-app'
        K8S_NAMESPACE = 'default'
        DEPLOYMENT_FILES = "test/selenium-hub.yaml,test/selenium-hub-service.yaml,test/selenium-node-chrome-deployment.yaml,test/selenium-node-edge-deployment.yaml,test/selenium-node-firefox-deployment.yaml"
        TEST_DIR = 'test/test'
        HUB_HEALTH_CHECK = "http://localhost:4444/wd/hub/status"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('React Dependencies') {
                    steps {
                        dir(APP_DIR) {
                            bat 'npm install'
                        }
                    }
                }
                stage('Java Dependencies') {
                    steps {
                        dir(TEST_DIR) {
                            bat 'mvn clean install -DskipTests'
                        }
                    }
                }
            }
        }

        stage('Deploy Selenium Grid') {
            steps {
                script {
                    // Apply Selenium Hub first
                    bat "kubectl apply -f test/selenium-hub.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl apply -f test/selenium-hub-service.yaml --namespace=${K8S_NAMESPACE}"

                    // Wait for Hub to be ready
                    bat "kubectl wait --for=condition=ready pod -l app=selenium-hub --timeout=120s --namespace=${K8S_NAMESPACE}"

                    // Deploy browser nodes
                    bat "kubectl apply -f test/selenium-node-chrome-deployment.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl apply -f test/selenium-node-edge-deployment.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl apply -f test/selenium-node-firefox-deployment.yaml --namespace=${K8S_NAMESPACE}"

                    // Wait for all nodes to be ready
                    bat "kubectl wait --for=condition=ready pod -l app=selenium-node-chrome --timeout=120s --namespace=${K8S_NAMESPACE}"
                    bat "kubectl wait --for=condition=ready pod -l app=selenium-node-edge --timeout=120s --namespace=${K8S_NAMESPACE}"
                    bat "kubectl wait --for=condition=ready pod -l app=selenium-node-firefox --timeout=120s --namespace=${K8S_NAMESPACE}"

                    // Port forward Selenium Hub
                    bat "start /B kubectl port-forward service/selenium-hub 4444:4444 --namespace=${K8S_NAMESPACE}"

                    // Wait for Hub to be accessible
                    sleep(30)
                }
            }
        }

        stage('Start React Development Server') {
            steps {
                script {
                    dir(APP_DIR) {
                        bat 'start /B npm run dev'
                        sleep 15 // Wait for server to start
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    parallel(
                        chrome: {
                            bat 'mvn test -Dtest=com.test.test.OpenYouTubeTestChrome -Dbrowser=chrome'
                        },
                        firefox: {
                            bat 'mvn test -Dtest=com.test.test.OpenYouTubeTestFirefox -Dbrowser=firefox'
                        },
                        edge: {
                            bat 'mvn test -Dtest=com.test.test.OpenYouTubeTestEdge -Dbrowser=edge'
                        },
                        failFast: true
                    )
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    // Stop the React development server
                    bat 'taskkill /F /IM node.exe'
                } catch (Exception e) {
                    echo "Error stopping React server: ${e.getMessage()}"
                }

                try {
                    // Kill port-forward process
                    bat 'for /f "tokens=5" %a in (\'netstat -aon ^| find "4444"\') do taskkill /F /PID %a'

                    // Clean up Kubernetes resources
                    bat "kubectl delete -f test/selenium-hub.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl delete -f test/selenium-hub-service.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl delete -f test/selenium-node-chrome-deployment.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl delete -f test/selenium-node-edge-deployment.yaml --namespace=${K8S_NAMESPACE}"
                    bat "kubectl delete -f test/selenium-node-firefox-deployment.yaml --namespace=${K8S_NAMESPACE}"
                } catch (Exception e) {
                    echo "Error cleaning up Kubernetes resources: ${e.getMessage()}"
                }
            }

            junit '**/target/surefire-reports/*.xml'
        }
    }
}