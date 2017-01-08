# Call Your Congresspeople

This app uses [Twilio](https://www.twilio.com/) to connect people with their senators and representatives.

You can read more about it here: http://www.ianww.com/blog/2016/06/15/call-your-congressperson-with-one-phone-number-1-844-usa-4522/

## Getting started running locally:

- Clone this repository and type `npm install`.
- Set up your `.env` file.  For a dummy `.env`, run `cp example_dot_env .env`
- Run `node cyc_entry.js` to start the server.

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
- Remove leftover dependencies from boilerplate that are unnecessary (eg. flash, validator).
- Collect info on what user is calling about? (eg. ask user to make a statement)


## License (MIT)

```
Copyright (C) 2016 by Ian Webster (http://www.ianww.com)

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
