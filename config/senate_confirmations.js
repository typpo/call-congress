const priority = require('./senate_confirmations_priority');

module.exports = {
  audio: {
    introAndPromptForZip: 'audio/v2/zip_prompt.mp3',
    errorEncountered: 'audio/v2/error.mp3',
    aboutToStart: 'audio/v2/instructions.mp3',
    nextCallBeginning: 'audio/v2/nextbeginning.mp3',
    done: 'audio/v2/done.mp3',

    senator: 'audio/v2/senator.mp3',
    representative: 'audio/v2/representative.mp3',
  },

  target: {
    senatorsOnly: true,
    sortFn: (a, b) => {
      // Sort function between two sunlight person objects.
      const idxA = priority.indexOf(`${a.last_name}__${a.state}`);
      const idxB = priority.indexOf(`${b.last_name}__${b.state}`);
      console.log(idxA, idxB);
      if (idxA < 0 && idxB < 0) {
        console.log('foo22323');
        return 0;
      }
      if (idxA < idxB && idxA > -1) {
        console.log('foo');
        return -1;
      }
        console.log('baz');
      return 1;
    },
  },
};
