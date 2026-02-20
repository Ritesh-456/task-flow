/**
 * Global Error Handler Middleware
 * Standardizes API responses and catches unhandled exceptions gracefully.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the stack trace for server monitoring

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
