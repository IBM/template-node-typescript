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
            secretEnvVar(key: 'RESOURCE_GROUP', secretName: 'ibmcloud-apikey', secretKey: 'resource_group'),
            secretEnvVar(key: 'REGISTRY_URL', secretName: 'ibmcloud-apikey', secretKey: 'registry_url'),
            secretEnvVar(key: 'REGISTRY_NAMESPACE', secretName: 'ibmcloud-apikey', secretKey: 'registry_namespace'),
            secretEnvVar(key: 'REGION', secretName: 'ibmcloud-apikey', secretKey: 'region'),
            secretEnvVar(key: 'CLUSTER_NAME', secretName: 'ibmcloud-apikey', secretKey: 'cluster_name'),
            envVar(key: 'CHART_NAME', value: 'template-node-typescript'),
            envVar(key: 'CHART_ROOT', value: 'chart'),
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
                    npm run pact:verify
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
            stage('Deploy to DEV env') {
                sh '''
                    . ./env-config
                    
                    ENVIRONMENT_NAME=dev

                    npm i -g @garage-catalyst/ibm-garage-cloud-cli
                
                    echo "Deploying image: ${IMAGE_NAME}:${IMAGE_VERSION}-${IMAGE_BUILD_NUMBER}"
                    igc deploy --debug --image $IMAGE_NAME --ver $IMAGE_VERSION --buildNumber $IMAGE_BUILD_NUMBER --namespace $ENVIRONMENT_NAME
                '''
            }
        }
    }
}

