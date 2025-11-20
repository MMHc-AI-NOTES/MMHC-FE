#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion

_front_end_url="https://frontend.theexpertscloud.com" # This is also available in .env.dev
_remote="*.***.***.***"
_user="ec_root"
_remote_directory_name="frontend"

echo "❗❗❗ Frontend Deployment ❗❗❗"
echo "Local system name: $HOSTNAME"
echo "Local date and time: $(date)"

# Run npm to install the dependencies
nvm use 22

npm i

# Run run build
npm run build:dev

# Copy the .htaccess file to the build directory
cp ./.htaccess ./build/.htaccess

echo "❗❗❗ Sync started ❗❗❗"
# Rsync the build directory to the remote server
rsync -rtu --delete --progress "./build/" $_user@$_remote:/var/www/html/$_remote_directory_name

echo "cmd + click here to open front-end $_front_end_url"