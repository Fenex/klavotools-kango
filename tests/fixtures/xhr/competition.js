/**
 * A function which returns a simplified server's response with the
 * "gamelist" data (includes a single rate competition or default game).
 * @param {Object} options Parameters of the response
 * @return {Object}
 */
module.exports = function (options) {
  var defaultOptions = {
    status: 200,
    id: 1337,
    competition: '100500',
    rate: undefined,
    beginTime: 300,
    currentTime: 0,
  };
  if (typeof options === 'object') {
    for (var key in defaultOptions) {
      if (!options.hasOwnProperty(key)) {
        options[key] = defaultOptions[key];
      }
    }
  } else {
    options = defaultOptions;
  }
  var game = {
    id: options.id,
    begintime: options.beginTime,
    params: {
      competition: options.competition,
      regular_competition: options.rate,
    },
  };
  return {
    status: options.status,
    response: {
      time: options.currentTime,
      gamelist: [game],
    },
  };
}
