// ===== Error Handling Middleware =====

function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    res.status(statusCode).json({
        error: message,
        ...(stack && { stack }),
        ...(err.errors && { errors: err.errors })
    });
}

function notFoundHandler(req, res, next) {
    res.status(404).json({ error: 'Not found' });
}

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

class AppError extends Error {
    constructor(message, statusCode = 500, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, errors);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Not found') {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 422, errors);
    }
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError
};
