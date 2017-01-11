# Call Your Congresspeople

![Travis CI](https://travis-ci.org/StayWokeOrg/general-congress-hotline.svg?branch=master)

This app uses [Twilio](https://www.twilio.com/) to connect people with their senators and representatives.

You can read more about it here: http://www.ianww.com/blog/2016/06/15/call-your-congressperson-with-one-phone-number-1-844-usa-4522/

## Getting started running locally:

- Clone this repository and type `npm install`.
- Set up your `.env` file.  For a dummy `.env`, run `cp example_dot_env .env`
- Run `node cyc_entry.js` to start the server.

## Run with a specific configuration

By default, the app uses the configuration specified in `config/default.js`.

You can set this configuration in your `.env` file:

```
CONFIG=./config/my_config.js
```

Or you can override this on the command line:

```
CONFIG=./config/my_config.js node cyc_entry.js
```

## How It Works

Call Congress uses the caller's ZIP code in conjunction with the [Sunlight Congress API](https://sunlightlabs.github.io/congress/) to connect the caller directly to their federal representatives.

- Caller calls in to the central number handling all redirects
- Caller is instructed as to what will happen after having called this number
- Caller is prompted for their Zip Code, followed by the pound (#) sign. They're given 10 seconds to complete, or are disconnected
- Caller is informed that they'll be connected to their senators and representatives one-after-another. If they want to skip a call, they can press star (*).
- Once the caller has gone through all their senators and representatives, they are informed that their session is ended.
- App disconnects.

![Call Flowchart](https://raw.githubusercontent.com/StayWokeOrg/general-congress-hotline/master/spec/call-flowchart.png)

### If a caller enters a bad Zip Code

- Caller is informed that no representatives were able to be found for their zip code, and they should try calling again.
- App disconnects.

## Contributing

Contributions welcomed and encouraged! Here's how you should contribute to this repository:

- Fork the repo into your own repository.
- Open an issue in this (the original) repository describing the feature you intend to work on. Ex: "Add support for calling City Representatives"
- Check out a new branch in your own fork for this feature. Ex: `call-city-reps`
- Do your work on that branch.
- When your changes are ready to be merged, open a pull request from your fork's branch to this repo's `master` branch.
- In the comments of your Pull Request, point out which issue you've resolved and how.


### Example of things to do:

- Better options for return callers (eg. remembering zip code).
- Support for local numbers (city, state representatives).
- Collect info on what user is calling about? (eg. ask user to make a statement)


## License (MIT)

```
Copyright (C) 2016 by Ian Webster (http://www.ianww.com)

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
