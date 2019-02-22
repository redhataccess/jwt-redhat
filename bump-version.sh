#!/bin/bash

if  [ "$1" = "" ] ; then
    echo "Please supply a version"
    exit
fi

git checkout master &&
git pull upstream master &&
git reset --hard upstream/master &&
yarn install --check-files &&
yarn version --no-git-tag-version --new-version=$1 &&
yarn build &&
git add package.json yarn.lock dist/ &&
git commit -m "Publish version $1" &&
git tag $1 &&
git push upstream master &&
git push upstream $1 &&
npm publish