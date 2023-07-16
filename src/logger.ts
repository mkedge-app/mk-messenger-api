import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format as dateFnsFormat, utcToZonedTime } from 'date-fns-tz';

const timezone = 'America/Manaus';

const customFormat = winston.format.printf(({ timestamp, level, message }) => {
  const localTimestamp = utcToZonedTime(new Date(timestamp), timezone);
  const formattedTimestamp = dateFnsFormat(localTimestamp, 'yyyy-MM-dd HH:mm:ss');

  return `${formattedTimestamp} ${level}: ${message}`;
});

class Logger {
  private loggerTransports: winston.transport[];
  private logger!: winston.Logger;

  constructor() {
    this.loggerTransports = [];
    this.createTransports();
    this.createLogger();
  }

  private createTransports() {
    if (process.env.NODE_ENV === 'development') {
      // Output logs to the console during development
      this.loggerTransports.push(new winston.transports.Console());
    } else if (process.env.NODE_ENV === 'production') {
      // Use rotating log files in production
      const transport = new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: winston.format.combine(
          winston.format.timestamp(),
          customFormat
        ),
      });

      this.loggerTransports.push(transport);
    }
  }

  private createLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: this.loggerTransports,
      exceptionHandlers: [new winston.transports.Console()],
      exitOnError: false,
    });
  }

  public getLogger(): winston.Logger {
    return this.logger;
  }
}

// Exportando uma instância da classe para ser utilizada em outros módulos
const loggerInstance = new Logger();
export default loggerInstance.getLogger();
