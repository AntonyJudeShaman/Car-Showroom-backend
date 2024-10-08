const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    winston.format.json(),
  ),
  defaultMeta: { timestamp: new Date() },
  transports: [
    new winston.transports.File({ filename: 'Logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'Logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'Logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  );
}

module.exports = logger;
