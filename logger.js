const winston = require('winston');

const formatDate = () => new Date().toISOString();

const logger = winston.createLogger({
  level:  'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: formatDate }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    ...( [new winston.transports.Console()] )
  ]
});

module.exports = logger;