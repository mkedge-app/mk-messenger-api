import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * An empty array to hold the logger transports.
 */
const loggerTransports = [];

/**
 * Checking the environment variable NODE_ENV to determine which logger transport to use.
 * If the environment is development, the logger will output to the console.
 * If the environment is production, the logger will output to a rotating log file.
 */
if (process.env.NODE_ENV === 'development') {
  loggerTransports.push(new winston.transports.Console());
} else if (process.env.NODE_ENV === 'production') {
  const transport = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
  });

  loggerTransports.push(transport); // Adding the transport to save logs to rotating files
}

/**
 * Creating a new logger instance with the specified level, format, and transports.
 */
const logger = winston.createLogger({
  level: 'info', // Minimum log level to be recorded
  format: winston.format.simple(), // Log format
  transports: loggerTransports, // Adding the configured transports
});

/**
 * Exporting the logger instance as the default export of this module.
 */
export default logger;
