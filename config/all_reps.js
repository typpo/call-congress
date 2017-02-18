// Configuration for the default call congress hotline, hosted at
// 1-844-USA-0234.

module.exports = {
  audio: {
    switchboard: {
      introAudio: 'audio/general/state_and_federal.mp3',
      options: {
        '1': {
          action: 'call_house_and_senate',
        },
        '2': {
          action: 'call_state_legislators',
        },
      },
    },

    // Backup in case Twilio follows old route during transition.
    introAndPromptForZip: 'audio/v2/zip_prompt.mp3',

    pleaseEnterZip: 'audio/general/enter_your_zip.mp3',
    errorEncountered: 'audio/v2/error.mp3',
    aboutToStart: 'audio/v2/instructions.mp3',
    nextCallBeginning: 'audio/v2/nextbeginning.mp3',
    done: 'audio/v2/done.mp3',

    senator: 'audio/v2/senator.mp3',
    representative: 'audio/v2/representative.mp3',
  },

  audioOptions: {
    addPromptForZipCode: true,
  },

  target: {
    sortFn: (a, b) => {
      // Sort function between two sunlight person objects.
      if (a.chamber === 'senate') {
        return -1;
      }
      return 1;
    },
  },
};
