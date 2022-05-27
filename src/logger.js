/*
 * logger winston preconfigurated. It is activated only if the var environment PROXY-TRACKER_LOG = 'true'
 */

/* global process */

const log_file_name = 'log_proxy-tracker_error_in_return_proxy.log';
const dirname = './log/';
const ENV_NAME = 'PROXY_TRACKER_LOG';
const value_that_activate_log = 'true';

const winston = require('winston');
require('winston-daily-rotate-file');

const transport = function(env){
  if(env === value_that_activate_log)
    return [new winston.transports.DailyRotateFile({
        filename: log_file_name,
        dirname: dirname,
        maxSize: '1m',
        maxFiles: 1,
        datePattern:'YYYY'
    })];
  else return [];
};

const logger = winston.createLogger({
  level: 'error',
  transports: transport(process.env[ENV_NAME])
});
module.exports = logger;

