module.exports = {
  debug: true,
  // debugNumber: '18008675309',

  audio: {
    switchboard: {
      intro: 'audio/resist/switchboard.mp3',
      options: {
        '1': 'audio/sessions/intro.mp3',
        '2': 'audio/aca/intro.mp3',
      },
    },

    introAndPromptForZip: 'audio/v2/zip_prompt.mp3',
    errorEncountered: 'audio/v2/error.mp3',
    aboutToStart: 'audio/v2/instructions.mp3',
    nextCallBeginning: 'audio/v2/nextbeginning.mp3',
    done: 'audio/v2/done.mp3',

    senator: 'audio/v2/senator.mp3',
    representative: 'audio/v2/representative.mp3',
  },

  audioOptions: {
    addPromptForZipCode: false,
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
