#!/bin/bash -e

CONFIG=./config/all_reps.js pm2 start index.js --name 'callcongress'
