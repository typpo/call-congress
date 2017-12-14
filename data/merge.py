import csv
import json

from collections import defaultdict

state_cd_to_zips = defaultdict(lambda: defaultdict(list))
with open('./raw/zip_to_cd.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        state_cd_to_zips[row['state_abbr']][row['cd']].append(row['zcta'])

zip_to_legislator = defaultdict(list)
with open('./raw/legislators.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not row['district']:
            continue
        zipcodes = state_cd_to_zips[row['state']][row['district']]
        for zipcode in zipcodes:
            zip_to_legislator[zipcode].append({
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'full_name': '%s %s' % (row['first_name'], row['last_name']),
                'phone': row['phone'],
            })

with open('zip_to_reps.json', 'w') as f:
    f.write(json.dumps(zip_to_legislator, indent=2))
