
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
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

    
    }

    post {
        success {
            echo 'TaskForge CI pipeline completed successfully.'
        }

        failure {
            echo 'TaskForge CI pipeline failed. Check the stage logs.'
        }

        always {
            echo "Jenkins Pipeline execution completed."
        }
    }
}
