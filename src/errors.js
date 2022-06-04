const LazyError = require('laziest-error');
const errors = new LazyError(TypeError);

const check = require('errformance')('dev');

module.exports = {errors, check};
