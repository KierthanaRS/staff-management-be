import winston from "winston";

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});

export const logInfo = (message: string) => logger.info(message);
export const logWarn = (message: string) => logger.warn(message);
export const logError = (message: string | Error) =>
  logger.error(message instanceof Error ? message.stack || message.message : message);

export default logger;