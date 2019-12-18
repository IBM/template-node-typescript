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

def buildAgentName(String jobName, String buildNumber) {
    if (jobName.length() > 55) {
        jobName = jobName.substring(0, 55);
    }

    return "a.${jobName}${buildNumber}".replace('_', '-').replace('/', '-').replace('-.', '.');
}

def buildLabel = buildAgentName(env.JOB_NAME, env.BUILD_NUMBER);
def namespace = env.NAMESPACE ?: "dev"
def cloudName = env.CLOUD_NAME == "openshift" ? "openshift" : "kubernetes"
def workingDir = "/home/jenkins/agent"
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
      image: docker.io/garagecatalyst/ibmcloud-dev:1.0.8
      tty: true
      command: ["/bin/bash"]
      workingDir: ${workingDir}
      envFrom:
        - configMapRef:
            name: ibmcloud-config
        - secretRef:
            name: ibmcloud-apikey
        - configMapRef:
            name: artifactory-config
            optional: true
        - secretRef:
            name: artifactory-access
            optional: true
      env:
        - name: CHART_NAME
          value: template-node-typescript
        - name: CHART_ROOT
          value: chart
        - name: TMP_DIR
          value: .tmp
        - name: HOME
          value: /home/devops
        - name: ENVIRONMENT_NAME
          value: ${env.NAMESPACE}
        - name: BUILD_NUMBER
          value: ${env.BUILD_NUMBER}
    - name: trigger-cd
      image: docker.io/garagecatalyst/ibmcloud-dev:1.0.8
      tty: true
      command: ["/bin/bash"]
      workingDir: ${workingDir}
      env:
        - name: HOME
          value: /home/devops
      envFrom:
        - secretRef:
            name: gitops-cd-secret
            optional: true
"""
) {
    node(buildLabel) {
        container(name: 'node', shell: '/bin/bash') {
            checkout scm
            stage('Setup') {
                sh '''#!/bin/bash
                    # Export project name (lowercase), version, and build number to ./env-config
                    IMAGE_NAME=$(basename -s .git `git config --get remote.origin.url` | tr '[:upper:]' '[:lower:]' | sed "s/_/-/g")

                    echo "IMAGE_NAME=${IMAGE_NAME}" > ./env-config
                    npm run env | grep "^npm_package_version" | sed "s/npm_package_version/IMAGE_VERSION/g" >> ./env-config
                    echo "BUILD_NUMBER=${BUILD_NUMBER}" >> ./env-config

                    cat ./env-config
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
            stage('Publish pacts') {
                sh '''#!/bin/bash
                    npm run pact:publish
                '''
            }
            stage('Verify pact') {
                sh '''#!/bin/bash
                    npm run pact:verify
                '''
            }
            stage('Sonar scan') {
                sh '''#!/bin/bash

                if [[ -z "${SONARQUBE_URL}" ]]; then
                  echo "Skipping Sonar Qube step as Sonar Qube not installed or configured"
                  exit 0
                fi

                npm run sonarqube:scan
                '''
            }
        }
        container(name: 'ibmcloud', shell: '/bin/bash') {
            stage('Build image') {
                sh '''#!/bin/bash

                    . ./env-config

                    echo -e "=========================================================================================="
                    echo -e "BUILDING CONTAINER IMAGE: ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}"
                    ibmcloud cr build -t ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION} .
                    if [[ $? -ne 0 ]]; then
                      exit 1
                    fi

                    if [[ -n "${BUILD_NUMBER}" ]]; then
                        echo -e "BUILDING CONTAINER IMAGE: ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}-${BUILD_NUMBER}"
                        ibmcloud cr image-tag ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION} ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}-${BUILD_NUMBER}
                    fi
                '''
            }
            stage('Deploy to DEV env') {
                sh '''#!/bin/bash
                    echo "Deploying to ${ENVIRONMENT_NAME}"

                    . ./env-config

                    if [[ "${CHART_NAME}" != "${IMAGE_NAME}" ]]; then
                      cp -R "${CHART_ROOT}/${CHART_NAME}" "${CHART_ROOT}/${IMAGE_NAME}"
                      cat "${CHART_ROOT}/${CHART_NAME}/Chart.yaml" | \
                          yq w - name "${IMAGE_NAME}" > "${CHART_ROOT}/${IMAGE_NAME}/Chart.yaml"
                    fi
                    
                    CHART_PATH="${CHART_ROOT}/${IMAGE_NAME}"

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
                    if [[ $? -ne 0 ]]; then
                      exit 1
                    fi
                    
                    IMAGE_REPOSITORY="${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}"
                    PIPELINE_IMAGE_URL="${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}"
                    
                    # Update helm chart with repository and tag values
                    cat ${CHART_PATH}/values.yaml | \
                        yq w - nameOverride "${IMAGE_NAME}" | \
                        yq w - fullnameOverride "${IMAGE_NAME}" | \
                        yq w - image.repository "${IMAGE_REPOSITORY}" | \
                        yq w - image.tag "${IMAGE_VERSION}" > ./values.yaml.tmp
                    cp ./values.yaml.tmp ${CHART_PATH}/values.yaml
                    cat ${CHART_PATH}/values.yaml

                    # Using 'upgrade --install" for rolling updates. Note that subsequent updates will occur in the same namespace the release is currently deployed in, ignoring the explicit--namespace argument".
                    helm template ${CHART_PATH} \
                        --name ${RELEASE_NAME} \
                        --namespace ${ENVIRONMENT_NAME} \
                        --set ingress.tlsSecretName="${TLS_SECRET_NAME}" \
                        --set ingress.subdomain="${INGRESS_SUBDOMAIN}" > ./release.yaml
                    
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
            stage('Package Helm Chart') {
                sh '''#!/bin/bash

                if [[ -z "${ARTIFACTORY_ENCRPT}" ]]; then
                  echo "Skipping Artifactory step as Artifactory is not installed or configured"
                  exit 0
                fi

                . ./env-config

                if [[ -n "${BUILD_NUMBER}" ]]; then
                  IMAGE_BUILD_VERSION="${IMAGE_VERSION}-${BUILD_NUMBER}"
                fi

                if [[ -z "${ARTIFACTORY_ENCRPT}" ]]; then
                    echo "Encrption key not available for Jenkins pipeline, please add it to the artifactory-access"
                    exit 1
                fi

                # Check if a Generic Local Repo has been created and retrieve the URL for it
                export URL=$(curl -u${ARTIFACTORY_USER}:${ARTIFACTORY_PASSWORD} -X GET "${ARTIFACTORY_URL}/artifactory/api/repositories?type=LOCAL" | jq '.[0].url' | tr -d \\")
                echo ${URL}

                # Check if the URL is valid and we can continue
                if [ -n "${URL}" ]; then
                    echo "Successfully read Repo ${URL}"
                else
                    echo "No Repository Created"
                    exit 1;
                fi;

                # Package Helm Chart
                helm package --version ${IMAGE_BUILD_VERSION} ${CHART_ROOT}/${IMAGE_NAME}

                # Get the index and re index it with current Helm Chart
                curl -u${ARTIFACTORY_USER}:${ARTIFACTORY_ENCRPT} -O "${URL}/${REGISTRY_NAMESPACE}/index.yaml"

                if [[ $(cat index.yaml | jq '.errors[0].status') != "404" ]]; then
                    # Merge the chart index with the current index.yaml held in Artifactory
                    echo "Merging Chart into index.yaml for Chart Repository"
                    helm repo index . --url ${URL}/${REGISTRY_NAMESPACE} --merge index.yaml
                else
                    # Dont Merge this is first time one is being created
                    echo "Creating a new index.yaml for Chart Repository"
                    rm index.yaml
                    helm repo index . --url ${URL}/${REGISTRY_NAMESPACE}
                fi;

                # Persist the Helm Chart in Artifactory for us by ArgoCD
                curl -u${ARTIFACTORY_USER}:${ARTIFACTORY_ENCRPT} -i -vvv -T ${IMAGE_NAME}-${IMAGE_BUILD_VERSION}.tgz "${URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}-${IMAGE_BUILD_VERSION}.tgz"

                # Persist the Helm Chart in Artifactory for us by ArgoCD
                curl -u${ARTIFACTORY_USER}:${ARTIFACTORY_ENCRPT} -i -vvv -T index.yaml "${URL}/${REGISTRY_NAMESPACE}/index.yaml"

            '''
            }
        }
        container(name: 'trigger-cd', shell: '/bin/bash') {
            stage('Trigger CD Pipeline') {
                sh '''#!/bin/bash
                    if [[ -z "${url}" ]]; then
                        echo "'url' not set. Not triggering CD pipeline"
                        exit 0
                    fi
                    if [[ -z "${host}" ]]; then
                        echo "'host' not set. Not triggering CD pipeline"
                        exit 0
                    fi

                    if [[ -z "${branch}" ]]; then
                        branch="master"
                    fi

                    . ./env-config

                    if [[ -n "${BUILD_NUMBER}" ]]; then
                      IMAGE_BUILD_VERSION="${IMAGE_VERSION}-${BUILD_NUMBER}"
                    fi

                    # This email is not used and is not valid, you can ignore but git requires it
                    git config --global user.email "jenkins@ibmcloud.com"
                    git config --global user.name "Jenkins Pipeline"

                    GIT_URL="https://${username}:${password}@${host}/${org}/${repo}"

                    git clone -b ${branch} ${GIT_URL} gitops_cd
                    cd gitops_cd

                    echo "Requirements before update"
                    cat "./${IMAGE_NAME}/requirements.yaml"

                    npm i -g @garage-catalyst/ibm-garage-cloud-cli
                    igc yq w ./${IMAGE_NAME}/requirements.yaml "dependencies[?(@.name == '${IMAGE_NAME}')].version" ${IMAGE_BUILD_VERSION} -i

                    echo "Requirements after update"
                    cat "./${IMAGE_NAME}/requirements.yaml"

                    git add -u
                    git commit -m "Updates ${IMAGE_NAME} to ${IMAGE_BUILD_VERSION}"
                    git push -v
                '''
            }
        }
    }
}

