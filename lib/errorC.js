const winston = require('winston');
const logger = new winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
  transports: [new winston.transports.Console()]
});

class ParameterError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParameterError";
    logger.error({error_msg: message});
  }
}

class ToDevelop extends Error {
  constructor(message){
    super(''.concat('questa funzione/parte deve essere sviluppata',message?': '.concat(message):''));
    this.name = "ToDevelop";
    logger.error(message);
  }
}

class NotHere extends Error {
  constructor(message){
    super(''.concat('Il flusso non doveva passare per qui',message?': '.concat(message):''));
    this.name = "NotHere";
    logger.error(message);
  }
}

class ToTest extends Error {
 constructor(message){
    super(''.concat('Questa parte va prima testata',message?': '.concat(message):''));
    this.name = "ToTest";
    logger.error(message);
  }
}

class EnvNotFound extends Error {
  constructor(message){
    super(''.concat('EnvNotFound',message?': '.concat(message):''));
    this.name = "EnvNotFound";
    logger.error(message);
  }
}


module.exports = {ParameterError, ToDevelop, NotHere, ToTest, EnvNotFound};