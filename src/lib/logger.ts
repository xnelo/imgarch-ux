    import winston from 'winston';

    const { combine, timestamp, json, colorize, uncolorize, simple, errors } = winston.format;

    const logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Adjust log level based on environment
      format: combine(
        errors({ stack: true }),
        timestamp(),
        process.env.NODE_ENV !== 'production' ? colorize() : uncolorize(), // Add colors in development
        process.env.NODE_ENV !== 'production' ? simple() : json()
      ),
      transports: [
        new winston.transports.Console(), // Log to console
        // Add file transport for persistent logs in production
        // new winston.transports.File({ filename: 'app.log' }),
      ],
    });

    export default logger;