import pandas as pd
from twilio.rest import TwilioRestClient
from datetime import datetime

account_sid = ''
auth_token = ''
phone_number = '+18446737478'
client = TwilioRestClient(account_sid, auth_token)

inbound_calls = []
outbound_calls = []
durations = []

started_after = datetime.strptime('2017/1/11 00:01', '%Y/%m/%d %H:%M')
print(started_after)
calls = client.calls.iter(started_after=started_after)
for call in calls:
    if call.direction == 'inbound': inbound_calls.append(call)
    if call.direction == 'outbound-dial': outbound_calls.append(call)

print(len(inbound_calls))
print(len(outbound_calls))
print(round(float(len(outbound_calls))/(float(len(inbound_calls)))),3)[0]
