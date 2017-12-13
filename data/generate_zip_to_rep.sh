#!/bin/bash -e

pushd `dirname $0` &>/dev/null

mkdir -p raw

wget -O raw/zip_to_cd.csv 'https://raw.githubusercontent.com/OpenSourceActivismTech/us_zipcodes_congress/master/zccd.csv'
wget -O raw/zip_to_cd_hud.csv 'https://raw.githubusercontent.com/OpenSourceActivismTech/us_zipcodes_congress/master/zccd_hud.csv'
wget -O raw/legislators.csv 'https://theunitedstates.io/congress-legislators/legislators-current.csv'
python merge.py

popd &>/dev/null
