const logger = require('../logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack, path: req.path, method: req.method, ip: req.ip });

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
};

module.exports = errorHandler;
