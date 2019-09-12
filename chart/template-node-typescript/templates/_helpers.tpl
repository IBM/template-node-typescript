{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "template-node-typescript.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "template-node-typescript.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := include "template-node-typescript.name" . -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "template-node-typescript.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "template-node-typescript.host" -}}
{{- $chartName := include "template-node-typescript.name" . -}}
{{- $host := default $chartName .Values.ingress.host -}}
{{- $subdomain := default .Values.ingress.subdomain .Values.global.ingressSubdomain -}}
{{- if .Values.ingress.namespaceInHost -}}
{{- printf "%s-%s.%s" $host .Release.Namespace $subdomain -}}
{{- else -}}
{{- printf "%s.%s" $host $subdomain -}}
{{- end -}}
{{- end -}}

{{- define "template-node-typescript.url" -}}
{{- $secretName := include "template-node-typescript.tlsSecretName" . -}}
{{- $host := include "template-node-typescript.host" . -}}
{{- if $secretName -}}
{{- printf "https://%s" $host -}}
{{- else -}}
{{- printf "http://%s" $host -}}
{{- end -}}
{{- end -}}

{{- define "template-node-typescript.protocols" -}}
{{- $secretName := include "template-node-typescript.tlsSecretName" . -}}
{{- if $secretName -}}
{{- printf "%s,%s" "http" "https" -}}
{{- else -}}
{{- printf "%s" "http" -}}
{{- end -}}
{{- end -}}

{{- define "template-node-typescript.tlsSecretName" -}}
{{- $secretName := default .Values.ingress.tlsSecretName .Values.global.tlsSecretName -}}
{{- if $secretName }}
{{- printf "%s" $secretName -}}
{{- else -}}
{{- printf "" -}}
{{- end -}}
{{- end -}}
