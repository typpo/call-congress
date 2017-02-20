import csv
import operator
import os

from collections import defaultdict
from datetime import datetime

from twilio.rest import TwilioRestClient

FAILED_STATUSES = set(['busy', 'no-answer', 'ringing', 'failed', 'canceled'])

account_sid = os.environ['TWILIO_ACCOUNT_SID']
auth_token = os.environ['TWILIO_AUTH_TOKEN']
phone = '+18446737478'
client = TwilioRestClient(account_sid, auth_token)

inbound_calls = []
outbound_calls = []
durations = []
nonzero_durations = []
failed_calls = []
to = []

started_after = datetime.strptime('2016/01/01 00:00', '%Y/%m/%d %H:%M')
print(started_after)
total = 0
c = 0
calls = client.calls.iter()

with open('logs2.csv', 'w') as csvfile:
    fieldnames = ['from', 'to', 'status', 'duration', 'direction']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for call in calls:
        duration = int(call.duration)
        if call.direction == 'inbound':
            inbound_calls.append(call)
        if call.direction == 'outbound-dial':
            outbound_calls.append(call)
            durations.append(duration)
            if duration > 0:
                nonzero_durations.append(duration)
            to.append(call.to_formatted)

            if call.status in FAILED_STATUSES:
                failed_calls.append(call)

        writer.writerow({
            'from': call.from_formatted,
            'to': call.to_formatted,
            'status': call.status,
            'duration': duration,
            'direction': call.direction,
        })

        total += 1
        c += 1
        if c > 100:
            print total, '...'
            c = 0

print('busy/failed', len(failed_calls))
print('inbound', len(inbound_calls))
print('outbound', len(outbound_calls))
print('in/out ratio', round(float(len(outbound_calls))/(float(len(inbound_calls)))),3)[0]
print('total duration', sum(durations))
print('average duration', float(sum(durations))/max(1, len(durations)))
print('total nonzero duration', sum(nonzero_durations))
print('average nonzero duration', float(sum(nonzero_durations))/max(1, len(nonzero_durations)))
print('num reps', len(set(to)))

freq = defaultdict(int)
for phone in to:
    freq[phone] += 1

print('frequencies')
print(sorted(freq.items(), key=operator.itemgetter(1)))

