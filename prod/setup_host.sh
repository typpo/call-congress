#!/bin/sh
# Setup on Ubuntu or debian machines

pushd ~

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get -y install nginx mosh unattended-upgrades git-core nodejs htop

npm install -g yarn pm2

git clone https://github.com/StayWokeOrg/general-congress-hotline.git
cd general-congress-hotline

yarn install

popd

echo "Done."
