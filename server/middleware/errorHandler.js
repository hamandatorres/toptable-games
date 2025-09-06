const winston = require('winston');
const path = require('path');

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/security.log'), 
      level: 'warn' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Security event types
const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTRATION_SUCCESS: 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILURE: 'REGISTRATION_FAILURE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE: 'PASSWORD_RESET_FAILURE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_HIJACK_ATTEMPT: 'SESSION_HIJACK_ATTEMPT'
};

// Error types and their corresponding HTTP status codes
const ERROR_MAP = {
  // Authentication errors
  USER_NOT_FOUND: { status: 404, message: 'User not found', severity: 'info' },
  INVALID_PASSWORD: { status: 401, message: 'Invalid credentials', severity: 'warn' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid credentials', severity: 'warn' },
  USER_EXISTS: { status: 409, message: 'User already exists', severity: 'info' },
  ACCOUNT_LOCKED: { status: 423, message: 'Account temporarily locked due to suspicious activity', severity: 'warn' },
  
  // Validation errors
  VALIDATION_ERROR: { status: 400, message: 'Invalid input provided', severity: 'info' },
  WEAK_PASSWORD: { status: 400, message: 'Password does not meet security requirements', severity: 'info' },
  PASSWORD_MISMATCH: { status: 400, message: 'Passwords do not match', severity: 'info' },
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many attempts. Please try again later', severity: 'warn' },
  
  // Token errors
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token', severity: 'warn' },
  TOKEN_EXPIRED: { status: 410, message: 'Token has expired', severity: 'info' },
  TOKEN_NOT_FOUND: { status: 404, message: 'Reset link not found or already used', severity: 'info' },
  
  // Security threats
  XSS_ATTEMPT: { status: 400, message: 'Invalid input detected', severity: 'error' },
  SQL_INJECTION_ATTEMPT: { status: 400, message: 'Invalid input detected', severity: 'error' },
  SUSPICIOUS_ACTIVITY: { status: 403, message: 'Suspicious activity detected', severity: 'error' },
  
  // Server errors
  DATABASE_ERROR: { status: 500, message: 'Database connection error', severity: 'error' },
  SERVER_ERROR: { status: 500, message: 'Internal server error', severity: 'error' },
  EMAIL_ERROR: { status: 500, message: 'Email service unavailable', severity: 'error' }
};

// Log security events
const logSecurityEvent = (eventType, details = {}) => {
  const securityLog = {
    event: eventType,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    userId: details.userId,
    username: details.username,
    sessionId: details.sessionId,
    details: details.extraData || {},
    severity: getSeverityForEvent(eventType)
  };

  logger.log(securityLog.severity, 'Security Event', securityLog);
  
  // Store in database for dashboard (implement if needed)
  if (details.db) {
    storeSecurityEvent(details.db, securityLog).catch(err => {
      logger.error('Failed to store security event in database', err);
    });
  }
};

// Get severity level for security events
const getSeverityForEvent = (eventType) => {
  const highSeverityEvents = [
    SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
    SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
    SECURITY_EVENTS.XSS_ATTEMPT,
    SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
    SECURITY_EVENTS.SESSION_HIJACK_ATTEMPT
  ];
  
  const mediumSeverityEvents = [
    SECURITY_EVENTS.LOGIN_FAILURE,
    SECURITY_EVENTS.REGISTRATION_FAILURE,
    SECURITY_EVENTS.PASSWORD_RESET_FAILURE,
    SECURITY_EVENTS.INVALID_TOKEN
  ];
  
  if (highSeverityEvents.includes(eventType)) return 'error';
  if (mediumSeverityEvents.includes(eventType)) return 'warn';
  return 'info';
};

// Store security event in database
const storeSecurityEvent = async (db, eventData) => {
  try {
    // This would require a security_events table in your database
    // await db.security.logEvent(eventData);
    console.log('Security event logged:', eventData.event);
  } catch (error) {
    logger.error('Database logging failed', error);
  }
};

// Main error handler middleware
const handleAuthError = (error, req, res, next) => {
  const errorCode = error.code || 'SERVER_ERROR';
  const errorInfo = ERROR_MAP[errorCode] || ERROR_MAP.SERVER_ERROR;
  
  // Extract request information
  const requestInfo = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.session?.user?.user_id,
    username: req.session?.user?.username,
    sessionId: req.sessionID,
    method: req.method,
    url: req.originalUrl,
    body: req.method === 'POST' ? sanitizeBody(req.body) : undefined
  };

  // Log the error with context
  const errorLog = {
    error: errorCode,
    message: error.message || errorInfo.message,
    stack: error.stack,
    severity: errorInfo.severity,
    timestamp: new Date().toISOString(),
    request: requestInfo
  };

  logger.log(errorInfo.severity, `Auth Error: ${errorCode}`, errorLog);

  // Log as security event if relevant
  if (isSecurityRelevant(errorCode)) {
    logSecurityEvent(mapErrorToSecurityEvent(errorCode), {
      ...requestInfo,
      extraData: { errorCode, message: error.message }
    });
  }

  // Send appropriate response
  res.status(errorInfo.status).json({
    error: errorCode,
    message: errorInfo.message,
    timestamp: new Date().toISOString()
  });
};

// Check if error is security-relevant
const isSecurityRelevant = (errorCode) => {
  const securityErrors = [
    'INVALID_PASSWORD', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY',
    'XSS_ATTEMPT', 'SQL_INJECTION_ATTEMPT', 'INVALID_TOKEN', 'ACCOUNT_LOCKED'
  ];
  return securityErrors.includes(errorCode);
};

// Map error codes to security events
const mapErrorToSecurityEvent = (errorCode) => {
  const mapping = {
    'INVALID_PASSWORD': SECURITY_EVENTS.LOGIN_FAILURE,
    'RATE_LIMIT_EXCEEDED': SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
    'SUSPICIOUS_ACTIVITY': SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
    'XSS_ATTEMPT': SECURITY_EVENTS.XSS_ATTEMPT,
    'SQL_INJECTION_ATTEMPT': SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
    'INVALID_TOKEN': SECURITY_EVENTS.INVALID_TOKEN
  };
  return mapping[errorCode] || SECURITY_EVENTS.SUSPICIOUS_ACTIVITY;
};

// Sanitize request body for logging (remove sensitive data)
const sanitizeBody = (body) => {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'newPassword', 'confirmPassword', 'hash'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Create application error with code
const createError = (code, message, originalError) => {
  const error = new Error(message || ERROR_MAP[code]?.message || 'Unknown error');
  error.code = code;
  if (originalError) {
    error.originalError = originalError;
    error.stack = originalError.stack;
  }
  return error;
};

// Express error handler
const expressErrorHandler = (err, req, res, next) => {
  // If it's already our custom error, handle it
  if (err.code && ERROR_MAP[err.code]) {
    return handleAuthError(err, req, res, next);
  }
  
  // Handle common Express/Node errors
  if (err.name === 'ValidationError') {
    return handleAuthError(createError('VALIDATION_ERROR', err.message), req, res, next);
  }
  
  if (err.code === 'EBADCSRFTOKEN') {
    return handleAuthError(createError('SUSPICIOUS_ACTIVITY', 'Invalid CSRF token'), req, res, next);
  }
  
  // Default to server error
  handleAuthError(createError('SERVER_ERROR', err.message, err), req, res, next);
};

module.exports = {
  handleAuthError,
  createError,
  expressErrorHandler,
  logSecurityEvent,
  SECURITY_EVENTS,
  ERROR_MAP,
  logger
};
