<p align="center">
    <a href="http://kitura.io/">
        <img src="https://landscape.cncf.io/logos/ibm-member.svg" height="100" alt="IBM Cloud">
    </a>
</p>

<p align="center">
    <a href="https://cloud.ibm.com">
    <img src="https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg" alt="IBM Cloud">
    </a>
    <img src="https://img.shields.io/badge/platform-node-lightgrey.svg?style=flat" alt="platform">
    <img src="https://img.shields.io/badge/license-Apache2-blue.svg?style=flat" alt="Apache 2">
</p>

# TypeScript Microservice or Backend for Frontend with Node.js

This Starter Kit Template can be the foundation of a TypeScript Node.js Microservice or Backend for Frontend.


## Features

The starter kit provides the following features:

- Built with [TypeScript](https://www.typescriptlang.org/)
- [nestjs](https://nestjs.com/) framework
- TDD environment with [Jest](https://jestjs.io/)
- Pact testing [Pact](https://docs.pact.io/)

#### Native Application Development

Install the latest [Node.js](https://nodejs.org/en/download/) 18+ LTS version.

After you have created a new git repo from this git template, remember to rename the project.
Edit `package.json` and change the default name to the name you used to create the template.

Once the Node toolchain has been installed, you can download the project dependencies with:

```shell
npm ci
npm run build
npm run start
```

### Deploying 

Make sure you are logged into the IBM Cloud using the IBM Cloud CLI and have access 
to your development cluster.

```shell
curl -sL https://cli.cloudnativetoolkit.dev/install.sh | sh
ibmcloud login -a cloud.ibm.com -r <region> -g <resource group>
ibmcloud ks cluster-config --cluster <cluster-name>
kubectl get pods

```

Use the Cloud Native Toolkit CLI to register the GIT Repo with CI environment 
```shell
oc pipeline 
```

## More Details

For more details on how to use this Starter Kit Template please review the [Cloud Native Toolkit Developer Guide](https://develop.cloudnativetoolkit.dev/)

## Next Steps

* Learn more about augmenting your Node.js applications on IBM Cloud with the [Node Programming Guide](https://cloud.ibm.com/docs/node?topic=nodejs-getting-started).

## License

This sample application is licensed under the Apache License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1](https://developercertificate.org/) and the [Apache License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache License FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)



