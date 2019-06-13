def buildLabel = "agent.${env.JOB_NAME}.${env.BUILD_NUMBER}".replace('-', '_').replace('/', '_')
podTemplate(
   label: buildLabel,
   containers: [
      containerTemplate(
         name: 'node',
         image: 'node:11-stretch',
         ttyEnabled: true,
         command: '/bin/bash',
         workingDir: '/home/jenkins',
         envVars: [
            envVar(key: 'DOCKER_CONFIG', value: '/home/jenkins/.docker/'),
            secretEnvVar(key: 'GIT_URL', secretName: 'template-node-typescript', secretKey: 'url'),
         ],
      ),
      containerTemplate(
         name: 'ibmcloud',
         image: 'garagecatalyst/ibmcloud-dev:1.0.1-root',
         ttyEnabled: true,
         command: '/bin/bash',
         workingDir: '/home/jenkins',
         envVars: [
            envVar(key: 'DOCKER_CONFIG', value: '/home/jenkins/.docker/'),
            secretEnvVar(key: 'APIKEY', secretName: 'ibmcloud-apikey', secretKey: 'password'),
            envVar(key: 'RESOURCE_GROUP', value: 'catalyst-team'),
            envVar(key: 'REGISTRY_URL', value: 'us.icr.io'),
            envVar(key: 'REGISTRY_NAMESPACE', value: 'catalyst-ns'),
            envVar(key: 'REGION', value: 'us-south'),
            envVar(key: 'CLUSTER_NAME', value: 'catalyst'),
            envVar(key: 'HOME', value: '/root'), // needed for the ibmcloud cli to find plugins
         ],
      ),
   ],
   volumes: [
      hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')
   ],
   serviceAccount: 'jenkins'
) {
    node(buildLabel) {
        container(name: 'node', shell: '/bin/bash') {
            checkout scm
            stage('Setup') {
                sh '''
                    # Export project name and version to ./env-config
                    npm run --silent generate-exports | tee ./env-config
                '''
            }
            stage('Build') {
                sh '''
                    npm install
                    npm run build
                '''
            }
            stage('Test') {
                sh '''
                    npm test
                '''
            }
            stage('Verify pact') {
                sh '''
                    npm run pactVerify
                '''
            }
        }
        container(name: 'ibmcloud', shell: '/bin/bash') {
            stage('Build image') {
                sh '''
                    . ./env-config

                    npm i -g @garage-catalyst/ibm-garage-cloud-cli
                
                    echo "Building image: ${IMAGE_NAME}:${IMAGE_VERSION}-${IMAGE_BUILD_NUMBER}"
                    igc build --image ${IMAGE_NAME} --ver ${IMAGE_VERSION} --buildNumber ${IMAGE_BUILD_NUMBER}
                '''
            }
            stage('Deploy to CI env') {
                sh '''
                    . ./env-config
                    
                    ENVIRONMENT_NAME=ci

                    npm i -g @garage-catalyst/ibm-garage-cloud-cli
                
                    echo "Deploying image: ${IMAGE_NAME}:${IMAGE_VERSION}-${IMAGE_BUILD_NUMBER}"
                    igc deploy --debug --image $IMAGE_NAME --ver $IMAGE_VERSION --buildNumber $IMAGE_BUILD_NUMBER --namespace $ENVIRONMENT_NAME
                '''
            }
        }
    }
}

