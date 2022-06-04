const LazyError = require('laziest-error');
const errors = new LazyError(TypeError);

errors.name_for_in_handler_isnt_string = 'The name of FOR must to be a string or array of string';

const check = require('errformance')('dev');

module.exports = {errors, check};
