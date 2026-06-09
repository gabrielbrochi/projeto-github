const winston = require('winston');
const expressWinston = require('express-winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Diretório de logs
const diretorioLogs = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(diretorioLogs)) {
  fs.mkdirSync(diretorioLogs, { recursive: true });
}

// Logger principal para uso manual (registrar eventos de segurança)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(diretorioLogs, 'seguranca.log') }),
    new winston.transports.Console()
  ]
});

// Middleware express-winston para logar requisições HTTP automaticamente
const loggerRequisicoes = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: path.join(diretorioLogs, 'requisicoes.log') })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  meta: true,
  expressFormat: true
});

// Middleware morgan para log de acesso no console
const morganMiddleware = morgan('dev');

module.exports = { logger, loggerRequisicoes, morganMiddleware };
