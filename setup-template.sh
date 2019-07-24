#!/usr/bin/env bash

template_project_name="template-node-typescript"

# console echo colors
#  \033[1;31m red
#  \033[1;32m green
#  \033[1;33m amber
#  \033[1;34m blue
#  \033[1;35m purple
#  \033[1;36m light blue
#  \033[1;37m grey
#  \033[1;38m black

echo -e "\033[1;34mSet up application from template:\033[0m\n"

#########################################
#            User input                 #
#########################################

### project name
project_name_default=${PWD##*/}
echo -e -n "  project name (\033[1;38m${project_name_default}\033[0m): "

read project_name

if [[ -z "$project_name" ]]; then
    project_name=${project_name_default}
fi

template_origin=$(git remote get-url template_origin 2> /dev/null)
current_origin=$(git remote get-url origin 2> /dev/null)

### scenarios
# 1. template_origin is not empty: template_origin->default_template_origin, current_origin->default_origin
# 2. current_origin matches {template_project_name} and template_origin is empty: current_origin->default_template_origin, ''->default_origin
# 3. current_origin does not match {template_project_name}: current_origin->default_origin, ''->default_template_origin

if [[ -n "${template_origin}" ]]; then
    default_template_origin="${template_origin}"
    default_origin="${current_origin}"
elif [[ $(echo "${current_origin}" | sed "s/.*\(${template_project_name}\).*/\1/g") == "${template_project_name}" ]]; then
    default_template_origin="${current_origin}"
    default_origin=""
else
    default_template_origin=""
    default_origin="${current_origin}"
fi


### project repo (new origin)
echo -e -n "  project repo url (\033[1;38m${default_origin}\033[0m): "

read project_repo

if [[ -z "${project_repo}" ]]; then
    project_repo="${default_origin}"
fi

### template repo (new origin)
echo -e -n "  template repo url (\033[1;38m${default_template_origin}\033[0m): "

read template_repo

if [[ -z "${template_repo}" ]]; then
    template_repo="${default_template_origin}"
fi

echo ""

#########################################
#           Process input               #
#########################################

### project name
echo -e "    \033[1;37mSetting project name:\033[0m ${project_name}"

# update rootProject.name value in settings.gradle
sed -i -e "s/rootProject.name.*/rootProject.name = '${project_name}'/g" ./settings.gradle
rm ./settings.gradle-*

sed -i -r "s/  \"name\":.*/  \"name\": \"${project_name}\",/g" ./package.json
rm ./package.json-*

# generate new README.md
cp README.md TEMPLATE.md
echo "# ${project_name}" > README.md


### project repo

echo -e "    \033[1;37mSetting template_origin url:\033[0m ${template_repo}"

echo "${template_repo}" > ./.template_origin

if [[ -z "$project_repo" && -n "$current_origin" ]]; then
    echo -e "    \033[1;37mRemoving origin url\033[0m"
    git remote remove origin

    sed -i -r "s~    \"url\":.*~    \"url\": \"\",~g" ./package.json
    rm ./package.json-*

elif [[ -n "$project_repo" ]]; then
    echo -e "    \033[1;37mSetting origin url:\033[0m ${project_repo}"
    if [[ -z "$current_origin" ]]; then
        git remote add origin "${project_repo}"
    else
        git remote set-url origin "${project_repo}"
    fi

    sed -i -r "s~    \"url\":.*~    \"url\": \"${project_repo}\"~g" ./package.json
    rm ./package.json-*

    if [[ -f ./PIPELINE-template.md ]]; then
        # Convert an ssh url to https. If it is already an https url then it will be left alone.
        project_repo_url=$(echo ${project_repo} | sed "s~git@\(.*\):\(.*\)~https://\1/\2~g")

        sed "s~REPO_URL~${project_repo_url}~g" ./PIPELINE-template.md > ./PIPELINE.md
    fi
fi

echo ""
