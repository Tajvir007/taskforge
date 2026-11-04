
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'taskforge'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    node --version
                    npm --version
                    docker --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t taskforge:${BUILD_NUMBER} .'
            }
        }
    }

    post {
        success {
            echo 'TaskForge CI pipeline completed successfully.'
        }

        failure {
            echo 'TaskForge CI pipeline failed. Check the stage logs.'
        }

        always {
            echo "Jenkins build result: ${currentBuild.currentResult}"
        }
    }
}
