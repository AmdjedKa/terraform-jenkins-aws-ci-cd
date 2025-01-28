pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        AWS_ACCOUNT_ID = '851725608377'
        AWS_REGION = 'us-east-1'
        VERSION = 'latest'
        CLUSTER_NAME = 'main-cluster'
        GITHUB_REPO = "https://github.com/AmdjedKa/ci-cd-aws-microservices-terraform-jenkins.git"
        services = ['frontend', 'auth-service', 'project-service', 'task-service']
        DOCKER_BUILDKIT = '1'
        DOCKER_REGISTRY = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
        BUILD_VERSION = "${BUILD_NUMBER}"
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: env.GITHUB_REPO
            }
        }

        stage('Configure AWS') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws_access_key_id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws_secret_access_key', variable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'aws_session_token', variable: 'AWS_SESSION_TOKEN')
                ]) {
                    sh """
                        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                        aws configure set region ${env.AWS_REGION}
                        aws configure set aws_session_token $AWS_SESSION_TOKEN
                    """
                }
            }
        }

        // stage('Install Dependencies') {
        //     steps {
        //         sh """
        //             cd ./frontend
        //             npm install --force
                    
        //             cd ../backend/services/auth-service
        //             npm install --force
                    
        //             cd ../project-service
        //             npm install --force
                    
        //             cd ../task-service
        //             npm install --force
                    
        //             cd ../../..
        //         """
        //     }
        // }

        stage('Create ECR Repositories') {
            steps {
                script {
                    {
                        env.services.each { service ->
                            sh """
                                aws ecr describe-repositories --repository-names ${service} --region ${env.AWS_REGION} || \
                                aws ecr create-repository --repository-name ${service} --region ${env.AWS_REGION}
                            """
                        }
                    }
                }
            }
        }

        stage('Build and Push Docker Images to ECR') {
            steps {
                script {
                    // Login to ECR
                    sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.DOCKER_REGISTRY}"
                    
                    env.services.each { service ->
                        def path = service == 'frontend' ? service : "backend/services/${service}"
                        
                        sh """
                            cd ${path}
                            docker build -t ${service}:${env.BUILD_VERSION} .
                            docker tag ${service}:${env.BUILD_VERSION} ${env.DOCKER_REGISTRY}/${service}:${env.BUILD_VERSION}
                            docker tag ${service}:${env.BUILD_VERSION} ${env.DOCKER_REGISTRY}/${service}:latest
                            docker push ${env.DOCKER_REGISTRY}/${service}:${env.BUILD_VERSION}
                            docker push ${env.DOCKER_REGISTRY}/${service}:latest
                            cd -
                        """
                    }
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    {
                        // Apply database secrets first
                        sh """
                            kubectl apply -f k8s/db-secret.yaml || true
                        """

                        // Apply the consolidated manifest file with variable substitution
                        sh """
                            cat k8s/services.yaml | \
                            sed 's/\${AWS_ACCOUNT_ID}/${env.AWS_ACCOUNT_ID}/g' | \
                            sed 's/\${AWS_REGION}/${env.AWS_REGION}/g' | \
                            sed 's/\${BUILD_VERSION}/${env.BUILD_VERSION}/g' | \
                            kubectl apply -f -
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    // Initial status check
                    sh """
                        echo "Current Pods Status:"
                        kubectl get pods -o wide
                        
                        echo "\nCurrent Services Status:"
                        kubectl get svc
                        
                        echo "\nCurrent Deployments Status:"
                        kubectl get deployments
                    """

                    env.services.each { service ->
                        try {
                            echo "Checking deployment status for ${service}..."
                            
                            // Wait for deployment
                            def rolloutStatus = sh(script: "kubectl rollout status deployment/${service} --timeout=60s", returnStatus: true)
                            
                            if (rolloutStatus != 0) {
                                echo "Deployment for ${service} failed or timed out. Checking pod logs..."
                                
                                // Get pod names for this service
                                def podNames = sh(script: "kubectl get pods -l app=${service} -o jsonpath='{.items[*].metadata.name}'", returnStdout: true).trim()
                                
                                if (podNames) {
                                    podNames.tokenize().each { podName ->
                                        echo "Logs for pod ${podName}:"
                                        sh "kubectl logs ${podName} --all-containers=true || true"
                                        
                                        echo "Describing pod ${podName}:"
                                        sh "kubectl describe pod ${podName} || true"
                                    }
                                }
                                
                                echo "Describing deployment ${service}:"
                                sh "kubectl describe deployment ${service} || true"
                                
                                // Check events
                                echo "Recent events:"
                                sh "kubectl get events --sort-by='.lastTimestamp' || true"
                                
                                error "Deployment for ${service} failed. Check the logs above for details."
                            } else {
                                echo "Deployment for ${service} succeeded!"
                                
                                // Get service endpoint if it's the frontend
                                if (service == 'frontend') {
                                    echo "Getting frontend service endpoint..."
                                    sh "kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
                                }
                            }
                        } catch (Exception e) {
                            echo "Error occurred while verifying ${service} deployment: ${e.message}"
                            throw e
                        }
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    def services = []
                    if (env.SERVICE == 'all') {
                        services = ['frontend', 'auth-service', 'project-service', 'task-service']
                    } else {
                        services = [env.SERVICE]
                    }

                    services.each { service ->
                        sh """
                            docker rmi ${env.DOCKER_REGISTRY}/${service}:${env.BUILD_VERSION} || true
                            docker rmi ${env.DOCKER_REGISTRY}/${service}:latest || true
                            docker rmi ${service}:${env.BUILD_VERSION} || true
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}