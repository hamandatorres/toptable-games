const { logSecurityEvent, SECURITY_EVENTS, logger } = require('../middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');

// In-memory store for real-time metrics (in production, use Redis)
let securityMetrics = {
  dailyStats: {
    totalLogins: 0,
    failedLogins: 0,
    successfulLogins: 0,
    passwordResets: 0,
    rateLimitHits: 0,
    suspiciousActivity: 0
  },
  recentEvents: [],
  ipStats: {},
  userStats: {},
  lastReset: new Date().toDateString()
};

// Reset daily stats if it's a new day
const resetDailyStatsIfNeeded = () => {
  const today = new Date().toDateString();
  if (securityMetrics.lastReset !== today) {
    securityMetrics.dailyStats = {
      totalLogins: 0,
      failedLogins: 0,
      successfulLogins: 0,
      passwordResets: 0,
      rateLimitHits: 0,
      suspiciousActivity: 0
    };
    securityMetrics.lastReset = today;
  }
};

// Update security metrics
const updateSecurityMetrics = (eventType, details = {}) => {
  resetDailyStatsIfNeeded();
  
  const { ip, userId, username } = details;
  
  // Update daily stats
  switch (eventType) {
    case SECURITY_EVENTS.LOGIN_SUCCESS:
      securityMetrics.dailyStats.totalLogins++;
      securityMetrics.dailyStats.successfulLogins++;
      break;
    case SECURITY_EVENTS.LOGIN_FAILURE:
      securityMetrics.dailyStats.totalLogins++;
      securityMetrics.dailyStats.failedLogins++;
      break;
    case SECURITY_EVENTS.PASSWORD_RESET_REQUEST:
    case SECURITY_EVENTS.PASSWORD_RESET_SUCCESS:
      securityMetrics.dailyStats.passwordResets++;
      break;
    case SECURITY_EVENTS.RATE_LIMIT_EXCEEDED:
      securityMetrics.dailyStats.rateLimitHits++;
      break;
    case SECURITY_EVENTS.SUSPICIOUS_ACTIVITY:
    case SECURITY_EVENTS.XSS_ATTEMPT:
    case SECURITY_EVENTS.SQL_INJECTION_ATTEMPT:
      securityMetrics.dailyStats.suspiciousActivity++;
      break;
  }
  
  // Update IP stats
  if (ip) {
    if (!securityMetrics.ipStats[ip]) {
      securityMetrics.ipStats[ip] = {
        totalRequests: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        lastSeen: new Date(),
        isBlocked: false
      };
    }
    securityMetrics.ipStats[ip].totalRequests++;
    securityMetrics.ipStats[ip].lastSeen = new Date();
    
    if (eventType === SECURITY_EVENTS.LOGIN_FAILURE) {
      securityMetrics.ipStats[ip].failedLogins++;
    }
    if ([SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, SECURITY_EVENTS.XSS_ATTEMPT, SECURITY_EVENTS.SQL_INJECTION_ATTEMPT].includes(eventType)) {
      securityMetrics.ipStats[ip].suspiciousActivity++;
    }
  }
  
  // Update user stats
  if (userId && username) {
    if (!securityMetrics.userStats[userId]) {
      securityMetrics.userStats[userId] = {
        username,
        totalLogins: 0,
        failedLogins: 0,
        lastLogin: null,
        suspiciousActivity: 0
      };
    }
    
    if (eventType === SECURITY_EVENTS.LOGIN_SUCCESS) {
      securityMetrics.userStats[userId].totalLogins++;
      securityMetrics.userStats[userId].lastLogin = new Date();
    }
    if (eventType === SECURITY_EVENTS.LOGIN_FAILURE) {
      securityMetrics.userStats[userId].failedLogins++;
    }
    if ([SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, SECURITY_EVENTS.XSS_ATTEMPT, SECURITY_EVENTS.SQL_INJECTION_ATTEMPT].includes(eventType)) {
      securityMetrics.userStats[userId].suspiciousActivity++;
    }
  }
  
  // Add to recent events (keep last 50)
  securityMetrics.recentEvents.unshift({
    eventType,
    timestamp: new Date(),
    details
  });
  if (securityMetrics.recentEvents.length > 50) {
    securityMetrics.recentEvents = securityMetrics.recentEvents.slice(0, 50);
  }
};

// Log security event with metrics update
const logSecurityEventWithMetrics = (eventType, details = {}) => {
  logSecurityEvent(eventType, details);
  updateSecurityMetrics(eventType, details);
};

// Security dashboard controller
const getSecurityDashboard = async (req, res) => {
  try {
    resetDailyStatsIfNeeded();
    
    // Calculate threat levels
    const threatLevel = calculateThreatLevel();
    
    // Get top suspicious IPs
    const suspiciousIPs = Object.entries(securityMetrics.ipStats)
      .filter(([ip, stats]) => stats.suspiciousActivity > 0 || stats.failedLogins > 5)
      .sort(([, a], [, b]) => (b.suspiciousActivity + b.failedLogins) - (a.suspiciousActivity + a.failedLogins))
      .slice(0, 10)
      .map(([ip, stats]) => ({ ip, ...stats }));
    
    // Get active users
    const activeUsers = Object.entries(securityMetrics.userStats)
      .filter(([, stats]) => stats.lastLogin && new Date() - new Date(stats.lastLogin) < 24 * 60 * 60 * 1000)
      .sort(([, a], [, b]) => new Date(b.lastLogin) - new Date(a.lastLogin))
      .slice(0, 10)
      .map(([userId, stats]) => ({ userId, ...stats }));
    
    // Read recent log entries
    const recentLogs = await getRecentLogEntries();
    
    const dashboardData = {
      overview: {
        threatLevel,
        dailyStats: securityMetrics.dailyStats,
        totalIPs: Object.keys(securityMetrics.ipStats).length,
        activeUsers: activeUsers.length,
        timestamp: new Date()
      },
      recentEvents: securityMetrics.recentEvents.slice(0, 20),
      suspiciousIPs,
      activeUsers,
      recentLogs: recentLogs.slice(0, 20),
      charts: {
        loginSuccessRate: calculateLoginSuccessRate(),
        hourlyActivity: await getHourlyActivity(),
        topFailureReasons: getTopFailureReasons()
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    logger.error('Security dashboard error', error);
    res.status(500).json({ error: 'Failed to load security dashboard' });
  }
};

// Calculate overall threat level
const calculateThreatLevel = () => {
  const { dailyStats } = securityMetrics;
  const totalSuspicious = dailyStats.suspiciousActivity + dailyStats.rateLimitHits;
  const failureRate = dailyStats.totalLogins > 0 ? dailyStats.failedLogins / dailyStats.totalLogins : 0;
  
  if (totalSuspicious > 10 || failureRate > 0.5) {
    return { level: 'HIGH', color: '#dc3545', description: 'Multiple security threats detected' };
  } else if (totalSuspicious > 5 || failureRate > 0.3) {
    return { level: 'MEDIUM', color: '#ffc107', description: 'Some security events detected' };
  } else {
    return { level: 'LOW', color: '#28a745', description: 'Normal security activity' };
  }
};

// Calculate login success rate
const calculateLoginSuccessRate = () => {
  const { totalLogins, successfulLogins } = securityMetrics.dailyStats;
  return totalLogins > 0 ? Math.round((successfulLogins / totalLogins) * 100) : 100;
};

// Get hourly activity (mock data for now)
const getHourlyActivity = async () => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0') + ':00';
    // In production, this would query actual hourly data
    const activity = Math.floor(Math.random() * 10);
    return { hour, activity };
  });
  return hours;
};

// Get top failure reasons
const getTopFailureReasons = () => {
  const reasons = securityMetrics.recentEvents
    .filter(event => event.eventType === SECURITY_EVENTS.LOGIN_FAILURE)
    .reduce((acc, event) => {
      const reason = event.details.reason || 'Invalid credentials';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
    
  return Object.entries(reasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }));
};

// Read recent log entries from files
const getRecentLogEntries = async () => {
  try {
    const logFiles = ['error.log', 'security.log', 'combined.log'];
    const recentLogs = [];
    
    for (const file of logFiles) {
      const logPath = path.join(__dirname, '../logs', file);
      try {
        const content = await fs.readFile(logPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Parse last 10 lines from each log file
        lines.slice(-10).forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            recentLogs.push({ ...logEntry, source: file });
          } catch (e) {
            // Skip malformed log entries
          }
        });
      } catch (fileError) {
        // Log file might not exist yet
      }
    }
    
    return recentLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);
  } catch (error) {
    logger.error('Failed to read log files', error);
    return [];
  }
};

// Get security alerts (high priority events)
const getSecurityAlerts = async (req, res) => {
  try {
    const alerts = securityMetrics.recentEvents
      .filter(event => [
        SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
        SECURITY_EVENTS.XSS_ATTEMPT,
        SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
        SECURITY_EVENTS.RATE_LIMIT_EXCEEDED
      ].includes(event.eventType))
      .slice(0, 20);
    
    res.json({ alerts, count: alerts.length });
  } catch (error) {
    logger.error('Security alerts error', error);
    res.status(500).json({ error: 'Failed to load security alerts' });
  }
};

// Block IP address
const blockIP = async (req, res) => {
  try {
    const { ip } = req.params;
    
    if (!securityMetrics.ipStats[ip]) {
      return res.status(404).json({ error: 'IP address not found' });
    }
    
    securityMetrics.ipStats[ip].isBlocked = true;
    
    logSecurityEventWithMetrics(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.session?.user?.user_id,
      username: req.session?.user?.username,
      extraData: { action: 'IP_BLOCKED', targetIP: ip }
    });
    
    res.json({ message: `IP ${ip} has been blocked` });
  } catch (error) {
    logger.error('Block IP error', error);
    res.status(500).json({ error: 'Failed to block IP' });
  }
};

// Unblock IP address
const unblockIP = async (req, res) => {
  try {
    const { ip } = req.params;
    
    if (!securityMetrics.ipStats[ip]) {
      return res.status(404).json({ error: 'IP address not found' });
    }
    
    securityMetrics.ipStats[ip].isBlocked = false;
    
    logSecurityEventWithMetrics(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.session?.user?.user_id,
      username: req.session?.user?.username,
      extraData: { action: 'IP_UNBLOCKED', targetIP: ip }
    });
    
    res.json({ message: `IP ${ip} has been unblocked` });
  } catch (error) {
    logger.error('Unblock IP error', error);
    res.status(500).json({ error: 'Failed to unblock IP' });
  }
};

// Export metrics for middleware usage
const getMetrics = () => securityMetrics;

// Check if IP is blocked
const isIPBlocked = (ip) => {
  return securityMetrics.ipStats[ip]?.isBlocked || false;
};

module.exports = {
  getSecurityDashboard,
  getSecurityAlerts,
  blockIP,
  unblockIP,
  logSecurityEventWithMetrics,
  updateSecurityMetrics,
  getMetrics,
  isIPBlocked
};
