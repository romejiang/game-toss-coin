#!/bin/bash

COPYFILE_DISABLE=1 tar \
  --exclude='node_modules'      \
  --exclude='dist'      \
  --exclude='.DS_Store'      \
  --exclude='._*'            \
  --exclude='.AppleDouble'   \
  --exclude='.Spotlight-V100' \
  --exclude='.Trashes'       \
  --exclude='.fseventsd'     \
  --exclude='.git'  \
  --exclude='phaser01.tar.gz'  \
  --exclude='server.sh'  \
  -czf phaser01.tar.gz .

scp phaser01.tar.gz root@yang:/opt/games/phaser01/

ssh root@yang "cd /opt/games/phaser01 && tar -zxvf phaser01.tar.gz"

rm -rf phaser01.tar.gz
