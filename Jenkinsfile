pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '851725608377'
        AWS_REGION = 'us-east-1'
        VERSION = 'latest'
        CLUSTER_NAME = 'main-cluster'
        GITHUB_REPO = "https://github.com/AmdjedKa/ci-cd-aws-microservices-terraform-jenkins.git"
        DOCKER_BUILDKIT = '1'
        ECR_REGISTRY = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
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

        stage('Create ECR Repositories') {
            steps {
                script {
                    def services = ['frontend', 'auth-service', 'project-service', 'task-service']

                    services.each { service ->
                        sh """
                            aws ecr describe-repositories --repository-names ${service} --region ${env.AWS_REGION} || \
                            aws ecr create-repository --repository-name ${service} --region ${env.AWS_REGION}
                        """
                    }
                }
            }
        }

        stage('Build and Push Docker Images to ECR') {
            steps {
                script {
                    def services = ['frontend', 'auth-service', 'project-service', 'task-service']

                    // Login to ECR
                    sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}"
                    
                    services.each { service ->
                        def path = service == 'frontend' ? service : "backend/services/${service}"
                        
                        sh """
                            cd ${path}
                            docker build -t ${service}:${env.BUILD_VERSION} .
                            docker tag ${service}:${env.BUILD_VERSION} ${env.ECR_REGISTRY}/${service}:${env.BUILD_VERSION}
                            docker tag ${service}:${env.BUILD_VERSION} ${env.ECR_REGISTRY}/${service}:latest
                            docker push ${env.ECR_REGISTRY}/${service}:${env.BUILD_VERSION}
                            docker push ${env.ECR_REGISTRY}/${service}:latest
                            cd -
                        """
                    }
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    // Configure kubectl
                    sh """
                        aws eks update-kubeconfig --name ${env.CLUSTER_NAME} --region ${env.AWS_REGION}
                    """

                    // Apply the consolidated manifest file with variable substitution
                    sh """
                        for file in k8s/deployments/*.yaml; do
                            cat \$file | \
                            sed 's/\\\${AWS_ACCOUNT_ID}/${env.AWS_ACCOUNT_ID}/g' | \
                            sed 's/\\\${AWS_REGION}/${env.AWS_REGION}/g' | \
                            sed 's/\\\${BUILD_VERSION}/${env.BUILD_VERSION}/g' | \
                            kubectl apply -f -
                        done
                    """
                        
                    sh """
                        kubectl apply -f k8s/services/
                        kubectl apply -f k8s/ingress.yaml
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    def services = ['frontend', 'auth-service', 'project-service', 'task-service']

                    // Wait for the pods to be ready
                    sh """
                        #!/bin/bash
                        for app in ${services.join(' ')}; do
                            kubectl get pods -l app=\$app -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' || exit 1
                        done
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    def services = ['frontend', 'auth-service', 'project-service', 'task-service']

                    services.each { service ->
                        sh """
                            docker rmi ${env.ECR_REGISTRY}/${service}:${env.BUILD_VERSION} || true
                            docker rmi ${env.ECR_REGISTRY}/${service}:latest || true
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