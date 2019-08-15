/*
 * This is a vanilla Jenkins pipeline that relies on the Jenkins kubernetes plugin to dynamically provision agents for
 * the build containers.
 *
 * The individual containers are defined in the `jenkins-pod-template.yaml` and the containers are referenced by name
 * in the `container()` blocks. The underlying pod definition expects certain kube Secrets and ConfigMap objects to
 * have been created in order for the Pod to run. See `jenkins-pod-template.yaml` for more information.
 * 
 * The cloudName variable is set dynamically based on the existance/value of env.CLOUD_NAME which allows this pipeline
 * to run in both Kubernetes and OpenShift environments.
 */

def buildLabel = "agent.${env.JOB_NAME.substring(0, 23)}.${env.BUILD_NUMBER}".replace('-', '_').replace('/', '_')
def cloudName = env.CLOUD_NAME == "openshift" ? "openshift" : "kubernetes"
def workingDir = env.CLOUD_NAME == "openshift" ? "/home/jenkins" : "/home/jenkins/agent"
podTemplate(
   label: buildLabel,
   cloud: cloudName,
   yaml: """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
    - name: node
      image: node:11-stretch
      tty: true
      command: ["/bin/bash"]
      workingDir: ${workingDir}
      envFrom:
        - configMapRef:
            name: pactbroker-config
            optional: true
        - configMapRef:
            name: sonarqube-config
            optional: true
        - secretRef:
            name: sonarqube-access
            optional: true
      env:
        - name: HOME
          value: ${workingDir}
    - name: ibmcloud
      image: docker.io/garagecatalyst/ibmcloud-dev:1.0.7
      tty: true
      command: ["/bin/bash"]
      workingDir: ${workingDir}
      envFrom:
        - configMapRef:
            name: ibmcloud-config
        - secretRef:
            name: ibmcloud-apikey
      env:
        - name: CHART_NAME
          value: template-node-typescript
        - name: CHART_ROOT
          value: chart
        - name: TMP_DIR
          value: .tmp
        - name: HOME
          value: /home/devops
        - name: BUILD_NUMBER
          value: ${env.BUILD_NUMBER}
"""
) {
    node(buildLabel) {
        container(name: 'node', shell: '/bin/bash') {
            checkout scm
            stage('Setup') {
                sh '''#!/bin/bash
                    set -x
                    # Export project name, version, and build number to ./env-config
                    npm run env | grep "^npm_package_name" | sed "s/npm_package_name/IMAGE_NAME/g"  > ./env-config
                    npm run env | grep "^npm_package_version" | sed "s/npm_package_version/IMAGE_VERSION/g" >> ./env-config
                    echo "BUILD_NUMBER=${BUILD_NUMBER}" >> ./env-config
                '''
            }
            stage('Build') {
                sh '''#!/bin/bash
                    set -x
                    npm install
                    npm run build
                '''
            }
            stage('Test') {
                sh '''#!/bin/bash
                    set -x
                    npm test
                '''
            }
            stage('Publish pacts') {
                sh '''#!/bin/bash
                    set -x
                    npm run pact:publish
                '''
            }
            stage('Verify pact') {
                sh '''#!/bin/bash
                    set -x
                    npm run pact:verify
                '''
            }
            stage('Sonar scan') {
                sh '''#!/bin/bash
                    set -x
                    npm run sonarqube:scan
                '''
            }
        }
        container(name: 'ibmcloud', shell: '/bin/bash') {
            stage('Verify environment') {
                sh '''#!/bin/bash
                    set -x
                    
                    whoami
                    
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
                    set -x
                    
                    . ./env-config

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
                    set -x

                    . ./env-config
                    
                    ENVIRONMENT_NAME=dev

                    CHART_PATH="${CHART_ROOT}/${CHART_NAME}"

                    echo "KUBECONFIG=${KUBECONFIG}"

                    RELEASE_NAME="${IMAGE_NAME}"
                    echo "RELEASE_NAME: $RELEASE_NAME"

                    if [[ -n "${BUILD_NUMBER}" ]]; then
                      IMAGE_VERSION="${IMAGE_VERSION}-${BUILD_NUMBER}"
                    fi
                    
                    echo "INITIALIZING helm with client-only (no Tiller)"
                    helm init --client-only 1> /dev/null 2> /dev/null
                    
                    echo "CHECKING CHART (lint)"
                    helm lint ${CHART_PATH}
                    
                    IMAGE_REPOSITORY="${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}"
                    PIPELINE_IMAGE_URL="${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}"

                    echo "${ENVIRONMENT_NAME}.${INGRESS_SUBDOMAIN}"

                    # Using 'upgrade --install" for rolling updates. Note that subsequent updates will occur in the same namespace the release is currently deployed in, ignoring the explicit--namespace argument".
                    helm template ${CHART_PATH} \
                        --name ${RELEASE_NAME} \
                        --namespace ${ENVIRONMENT_NAME} \
                        --set nameOverride=${IMAGE_NAME} \
                        --set image.repository=${IMAGE_REPOSITORY} \
                        --set image.tag=${IMAGE_VERSION} \
                        --set image.secretName="${ENVIRONMENT_NAME}-us-icr-io" \
                        --set ingress_subdomain="${ENVIRONMENT_NAME}.${INGRESS_SUBDOMAIN}" \
                        --set host="${IMAGE_NAME}" > ./release.yaml
                    
                    echo -e "Generated release yaml for: ${CLUSTER_NAME}/${ENVIRONMENT_NAME}."
                    cat ./release.yaml
                    
                    echo -e "Deploying into: ${CLUSTER_NAME}/${ENVIRONMENT_NAME}."
                    kubectl apply -n ${ENVIRONMENT_NAME} -f ./release.yaml

                    # ${SCRIPT_ROOT}/deploy-checkstatus.sh ${ENVIRONMENT_NAME} ${IMAGE_NAME} ${IMAGE_REPOSITORY} ${IMAGE_VERSION}
                '''
            }
            stage('Health Check') {
                sh '''#!/bin/bash
                    . ./env-config
                    
                    ENVIRONMENT_NAME=dev

                    INGRESS_NAME="${IMAGE_NAME}"
                    INGRESS_HOST=$(kubectl get ingress/${INGRESS_NAME} --namespace ${ENVIRONMENT_NAME} --output=jsonpath='{ .spec.rules[0].host }')
                    PORT='80'

                    # sleep for 10 seconds to allow enough time for the server to start
                    sleep 30

                    if [ $(curl -sL -w "%{http_code}\\n" "http://${INGRESS_HOST}:${PORT}/health" -o /dev/null --connect-timeout 3 --max-time 5 --retry 3 --retry-max-time 30) == "200" ]; then
                        echo "Successfully reached health endpoint: http://${INGRESS_HOST}:${PORT}/health"
                    echo "====================================================================="
                        else
                    echo "Could not reach health endpoint: http://${INGRESS_HOST}:${PORT}/health"
                        exit 1;
                    fi;

                '''
            }
        }
    }
}

