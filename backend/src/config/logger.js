const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Diretório de logs na raiz do backend
const diretorioLogs = path.join(__dirname, '..', '..', 'logs');

// Formato personalizado: timestamp + nível + mensagem + metadados JSON
const formatoPersonalizado = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadados }) => {
    const meta = Object.keys(metadados).length ? ` ${JSON.stringify(metadados)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${meta}`;
  })
);

// Transport com rotação diária
const transporteRotativo = new DailyRotateFile({
  filename: path.join(diretorioLogs, 'seguranca-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  zippedArchive: false,
  format: formatoPersonalizado
});

// Instância do logger
const logger = winston.createLogger({
  level: 'info',
  format: formatoPersonalizado,
  transports: [transporteRotativo]
});

// Em ambiente de desenvolvimento, também exibir no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: formatoPersonalizado
  }));
}

module.exports = logger;
