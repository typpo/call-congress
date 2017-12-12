const zipToReps = require('./zip_to_reps.json');

module.exports = function zipToRepsLookup(zip) {
  // Takes a zip, returns a list of representatives.
  return zipToReps[zip + ''] || [];
}
