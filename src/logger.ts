import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Nível mínimo de log a ser registrado
  format: winston.format.simple(), // Formato do log
  transports: [
    new winston.transports.Console(), // Transporte para exibir logs no console
    new winston.transports.File({ filename: 'logs/application.log', level: 'info' }), // Transporte para salvar logs em arquivo
  ],
});

export default logger;
