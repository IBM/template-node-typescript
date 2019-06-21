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
            envVar(key: 'APIURL', value: 'https://cloud.ibm.com'),
            secretEnvVar(key: 'APIKEY', secretName: 'ibmcloud-apikey', secretKey: 'password'),
            secretEnvVar(key: 'RESOURCE_GROUP', secretName: 'ibmcloud-apikey', secretKey: 'resource_group'),
            secretEnvVar(key: 'REGISTRY_URL', secretName: 'ibmcloud-apikey', secretKey: 'registry_url'),
            secretEnvVar(key: 'REGISTRY_NAMESPACE', secretName: 'ibmcloud-apikey', secretKey: 'registry_namespace'),
            secretEnvVar(key: 'REGION', secretName: 'ibmcloud-apikey', secretKey: 'region'),
            secretEnvVar(key: 'CLUSTER_NAME', secretName: 'ibmcloud-apikey', secretKey: 'cluster_name'),
            envVar(key: 'CHART_NAME', value: 'template-node-typescript'),
            envVar(key: 'CHART_ROOT', value: 'chart'),
            envVar(key: 'TMP_DIR', value: '.tmp'),
            envVar(key: 'BUILD_NUMBER', value: "${env.BUILD_NUMBER}"),
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
                sh '''#!/bin/bash
                    # Export project name, version, and build number to ./env-config
                    npm run env | grep "^npm_package_name" | sed "s/npm_package_name/IMAGE_NAME/g"  > ./env-config
                    npm run env | grep "^npm_package_version" | sed "s/npm_package_version/IMAGE_VERSION/g" >> ./env-config
                '''
            }
            stage('Build') {
                sh '''#!/bin/bash
                    npm install
                    npm run build
                '''
            }
            stage('Test') {
                sh '''#!/bin/bash
                    npm test
                '''
            }
            stage('Verify pact') {
                sh '''#!/bin/bash
                    npm run pact:verify
                '''
            }
        }
        container(name: 'ibmcloud', shell: '/bin/bash') {
            stage('Verify environment') {
                sh '''#!/bin/bash
                    . ./env-config

                    if [[ -z "${APIKEY}" ]]; then
                      echo "APIKEY is required"
                      exit 1
                    fi
                    
                    if [[ -z "${RESOURCE_GROUP}" ]]; then
                      echo "RESOURCE_GROUP is required"
                      exit 1
                    fi
                    
                    if [[ -z "${REGION}" ]]; then
                      echo "REGION is required"
                      exit 1
                    fi
                    
                    if [[ -z "${REGISTRY_NAMESPACE}" ]]; then
                      echo "REGISTRY_NAMESPACE is required"
                      exit 1
                    fi
                    
                    if [[ -z "${REGISTRY_URL}" ]]; then
                      echo "REGISTRY_URL is required"
                      exit 1
                    fi
                    
                    if [[ -z "${IMAGE_NAME}" ]]; then
                      echo "IMAGE_NAME is required"
                      exit 1
                    fi
                    
                    if [[ -z "${IMAGE_VERSION}" ]]; then
                      echo "IMAGE_VERSION is required"
                      exit 1
                    fi
                '''
            }
            stage('Build image') {
                sh '''#!/bin/bash
                    . ./env-config

                    ibmcloud login -a ${APIURL} --apikey ${APIKEY} -r ${REGION} -g ${RESOURCE_GROUP}
                    
                    echo "Checking registry namespace: ${REGISTRY_NAMESPACE}"
                    NS=$( ibmcloud cr namespaces | grep ${REGISTRY_NAMESPACE} ||: )
                    if [[ -z "${NS}" ]]; then
                        echo -e "Registry namespace ${REGISTRY_NAMESPACE} not found, creating it."
                        ibmcloud cr namespace-add ${REGISTRY_NAMESPACE}
                    else
                        echo -e "Registry namespace ${REGISTRY_NAMESPACE} found."
                    fi

                    echo -e "Existing images in registry"
                    ibmcloud cr images --restrict "${REGISTRY_NAMESPACE}/${IMAGE_NAME}"
                    
                    echo -e "=========================================================================================="
                    echo -e "BUILDING CONTAINER IMAGE: ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}"
                    set -x
                    ibmcloud cr build -t ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION} .
                    if [[ -n "${BUILD_NUMBER}" ]]; then
                        echo -e "BUILDING CONTAINER IMAGE: ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}-${BUILD_NUMBER}"
                        ibmcloud cr build -t ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}-${BUILD_NUMBER} .
                    fi
                    
                    echo -e "Available images in registry"
                    ibmcloud cr images --restrict ${REGISTRY_NAMESPACE}/${IMAGE_NAME}
                '''
            }
            stage('Deploy to DEV env') {
                sh '''#!/bin/bash
                    . ./env-config
                    
                    ENVIRONMENT_NAME=dev

                    CHART_PATH="${CHART_ROOT}/${CHART_NAME}"

                    mkdir -p ${TMP_DIR}
                    ibmcloud -version

                    ibmcloud login -a ${APIURL} --apikey ${APIKEY} -g ${RESOURCE_GROUP} -r ${REGION}
                    
                    # Turn off check-version so it doesn't spit out extra info during cluster-config
                    ibmcloud config --check-version=false
                    ibmcloud cs cluster-config --cluster ${CLUSTER_NAME} --export > ${TMP_DIR}/.kubeconfig

                    . ${TMP_DIR}/.kubeconfig

                    echo "KUBECONFIG=${KUBECONFIG}"

                    echo "Defining RELEASE_NAME by prefixing image (app) name with namespace if not 'default' as Helm needs unique release names across namespaces"
                    if [[ "${ENVIRONMENT_NAME}" != "default" ]]; then
                      RELEASE_NAME="${IMAGE_NAME}-${ENVIRONMENT_NAME}"
                    else
                      RELEASE_NAME="${IMAGE_NAME}"
                    fi
                    echo "RELEASE_NAME: $RELEASE_NAME"

                    if [[ -n "${BUILD_NUMBER}" ]]; then
                      IMAGE_VERSION="${IMAGE_VERSION}-${BUILD_NUMBER}"
                    fi

                    if [[ $(kubectl get secrets -n default | grep icr | wc -l) -eq 0 ]]; then
                        ibmcloud ks cluster-pull-secret-apply --cluster ${CLUSTER_NAME}
                    fi

                    kubectl get namespace ${ENVIRONMENT_NAME}
                    if [[ $? -ne 0 ]]; then
                      kubectl create namespace ${ENVIRONMENT_NAME}
                    fi
                    
                    # Check to see if image pull secrets exist in the namespace
                    if [[ $(kubectl get secrets -n ${ENVIRONMENT_NAME} | grep icr | wc -l) -eq 0 ]]; then
                        echo "Creating image pull secrets in namespace ${ENVIRONMENT_NAME}"
                        kubectl get secrets -n default | grep icr | sed "s/\\([A-Za-z-]*\\) *.*/\\1/g" | while read default_secret; do
                            echo "Copying secret: $default_secret"
                            kubectl get secret ${default_secret} -o yaml | sed "s/default/${ENVIRONMENT_NAME}/g" | kubectl -n ${ENVIRONMENT_NAME} create -f -
                        done
                    fi
                    
                    echo "INITIALIZING helm with upgrade"
                    helm init --upgrade 1> /dev/null 2> /dev/null
                    
                    echo "CHECKING CHART (lint)"
                    helm lint ${CHART_PATH}
                    
                    IMAGE_REPOSITORY="${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}"
                    PIPELINE_IMAGE_URL="${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}"

                    # Using 'upgrade --install" for rolling updates. Note that subsequent updates will occur in the same namespace the release is currently deployed in, ignoring the explicit--namespace argument".
                    echo -e "Dry run into: ${CLUSTER_NAME}/${ENVIRONMENT_NAME}."
                    helm upgrade --install --debug --dry-run ${RELEASE_NAME} ${CHART_PATH} \
                        --set image.repository=${IMAGE_REPOSITORY},image.tag=${IMAGE_VERSION},image.secretName="${ENVIRONMENT_NAME}-us-icr-io",cluster_name="${CLUSTER_NAME}",region="${REGION}",namespace="${ENVIRONMENT_NAME}",host="${IMAGE_NAME}" \
                        --namespace ${ENVIRONMENT_NAME}
                    
                    echo -e "Deploying into: ${CLUSTER_NAME}/${ENVIRONMENT_NAME}."
                    helm upgrade --install ${RELEASE_NAME} ${CHART_PATH} \
                        --set image.repository=${IMAGE_REPOSITORY},image.tag=${IMAGE_VERSION},image.secretName="${ENVIRONMENT_NAME}-us-icr-io",cluster_name="${CLUSTER_NAME}",region="${REGION}",namespace="${ENVIRONMENT_NAME}",host="${IMAGE_NAME}" \
                        --namespace ${ENVIRONMENT_NAME}

                    # ${SCRIPT_ROOT}/deploy-checkstatus.sh ${ENVIRONMENT_NAME} ${IMAGE_NAME} ${IMAGE_REPOSITORY} ${IMAGE_VERSION}
                '''
            }
        }
    }
}

