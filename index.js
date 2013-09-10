module.exports = process.env.transmute_COV
  ? require('./lib-cov/transmute')
  : require('./lib/transmute');
