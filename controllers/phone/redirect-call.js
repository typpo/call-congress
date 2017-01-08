var debug = require('debug')('call-congress:phone:redirect-call');
var twilio = require('twilio');
var getCongressPeople = require('./get-congress-people');

exports.redirectCallTest = function (req, res) {
    req.body = req.query;
    return redirectCall(req, res);
}

function redirectCall(req, res) {
    debug('Redirect call', req.body);
    var userZip = req.body.Digits || req.body.FromZip;

    getCongressPeople(userZip).then(function (people) {
        debug('Calling congresspeople', userZip);
        var call = new twilio.TwimlResponse();
        if (!people || people.length < 1) {
            call.play('audio/v2/error.mp3');
            call.hangup();
        } else {
            call.play('audio/v2/instructions.mp3');
            people.sort(function (a, b) {
                if (a.chamber == 'senate')
                    return -1;
                return 1;
            }).forEach(function (person, idx) {
                if (idx > 0) {
                    call.play('audio/v2/nextbeginning.mp3');
                }

                var name = person.first_name + ' ' + person.last_name;
                var phone = person.phone;
                if (person.chamber == 'senate') {
                    call.play('audio/v2/senator.mp3');
                } else {
                    call.play('audio/v2/representative.mp3');
                }
                call.say({ voice: 'woman' }, name);
                call.dial({ hangupOnStar: true }, phone);
            });
            call.play('audio/v2/done.mp3');
        }

        res.type('text/xml');
        res.status(200);
        res.send(call.toString());
    });
}

exports.redirectCall = redirectCall;