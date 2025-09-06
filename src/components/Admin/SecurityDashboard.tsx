import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ThreatLevel {
  level: string;
  color: string;
  description: string;
}

interface DailyStats {
  totalLogins: number;
  failedLogins: number;
  successfulLogins: number;
  passwordResets: number;
  rateLimitHits: number;
  suspiciousActivity: number;
}

interface SecurityEvent {
  eventType: string;
  timestamp: string;
  details: {
    ip?: string;
    userId?: number;
    username?: string;
    extraData?: Record<string, string | number | boolean>;
  };
}

interface SuspiciousIP {
  ip: string;
  totalRequests: number;
  failedLogins: number;
  suspiciousActivity: number;
  lastSeen: string;
  isBlocked: boolean;
}

interface SecurityDashboardData {
  overview: {
    threatLevel: ThreatLevel;
    dailyStats: DailyStats;
    totalIPs: number;
    activeUsers: number;
    timestamp: string;
  };
  recentEvents: SecurityEvent[];
  suspiciousIPs: SuspiciousIP[];
  charts: {
    loginSuccessRate: number;
    hourlyActivity: Array<{ hour: string; activity: number }>;
    topFailureReasons: Array<{ reason: string; count: number }>;
  };
}

const SecurityDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await axios.get<SecurityDashboardData>('/api/security/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch security dashboard:', err);
      setError('Failed to load security dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async (ip: string) => {
    try {
      await axios.post(`/api/security/block-ip/${ip}`);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to block IP:', err);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      await axios.post(`/api/security/unblock-ip/${ip}`);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to unblock IP:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('FAILURE') || eventType.includes('SUSPICIOUS') || eventType.includes('XSS') || eventType.includes('SQL_INJECTION')) {
      return '#dc3545'; // Red
    }
    if (eventType.includes('RATE_LIMIT')) {
      return '#ffc107'; // Yellow
    }
    if (eventType.includes('SUCCESS')) {
      return '#28a745'; // Green
    }
    return '#6c757d'; // Gray
  };

  if (loading) {
    return (
      <div className="security-dashboard loading" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        <span className="sr-only">Loading security dashboard...</span>
        <p>Loading security dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="security-dashboard error" role="alert">
        <h2>Security Dashboard Error</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="security-dashboard no-data">
        <p>No security data available</p>
      </div>
    );
  }

  const { overview, recentEvents, suspiciousIPs, charts } = dashboardData;

  return (
    <div className="security-dashboard" role="main">
      <header className="dashboard-header">
        <h1>Security Monitoring Dashboard</h1>
        <div className="dashboard-controls">
          <label htmlFor="refresh-interval">
            Refresh Interval:
            <select
              id="refresh-interval"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </label>
          <button onClick={fetchDashboardData} className="btn btn-secondary">
            Refresh Now
          </button>
        </div>
      </header>

      <div className="dashboard-overview">
        <div className="metric-card threat-level">
          <h3>Threat Level</h3>
          <div 
            className="threat-indicator"
            style={{ 
              backgroundColor: overview.threatLevel.color,
              color: 'white',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <strong>{overview.threatLevel.level}</strong>
            <p>{overview.threatLevel.description}</p>
          </div>
        </div>

        <div className="metric-card">
          <h3>Daily Statistics</h3>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">{overview.dailyStats.totalLogins}</span>
              <span className="stat-label">Total Logins</span>
            </div>
            <div className="stat">
              <span className="stat-value">{overview.dailyStats.successfulLogins}</span>
              <span className="stat-label">Successful</span>
            </div>
            <div className="stat">
              <span className="stat-value">{overview.dailyStats.failedLogins}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat">
              <span className="stat-value">{overview.dailyStats.suspiciousActivity}</span>
              <span className="stat-label">Suspicious</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Login Success Rate</h3>
          <div className="progress-circle">
            <div 
              className="progress-bar"
              style={{
                background: `conic-gradient(#28a745 ${charts.loginSuccessRate * 3.6}deg, #e9ecef 0deg)`
              }}
            >
              <span className="progress-text">{charts.loginSuccessRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Recent Security Events</h2>
          <div className="events-list">
            {recentEvents.length === 0 ? (
              <p>No recent security events</p>
            ) : (
              recentEvents.map((event, index) => (
                <div 
                  key={index} 
                  className="event-item"
                  style={{ borderLeft: `4px solid ${getEventTypeColor(event.eventType)}` }}
                >
                  <div className="event-header">
                    <span className="event-type">{event.eventType.replace(/_/g, ' ')}</span>
                    <span className="event-time">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <div className="event-details">
                    {event.details.ip && <span>IP: {event.details.ip}</span>}
                    {event.details.username && <span>User: {event.details.username}</span>}
                    {event.details.extraData && (
                      <span>Details: {JSON.stringify(event.details.extraData)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Suspicious IP Addresses</h2>
          <div className="ip-list">
            {suspiciousIPs.length === 0 ? (
              <p>No suspicious IP addresses detected</p>
            ) : (
              suspiciousIPs.map((ipData, index) => (
                <div key={index} className="ip-item">
                  <div className="ip-info">
                    <strong>{ipData.ip}</strong>
                    <div className="ip-stats">
                      <span>Requests: {ipData.totalRequests}</span>
                      <span>Failed Logins: {ipData.failedLogins}</span>
                      <span>Suspicious: {ipData.suspiciousActivity}</span>
                      <span>Last Seen: {formatTimestamp(ipData.lastSeen)}</span>
                    </div>
                  </div>
                  <div className="ip-actions">
                    {ipData.isBlocked ? (
                      <>
                        <span className="blocked-indicator">BLOCKED</span>
                        <button 
                          onClick={() => handleUnblockIP(ipData.ip)}
                          className="btn btn-success btn-sm"
                        >
                          Unblock
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleBlockIP(ipData.ip)}
                        className="btn btn-danger btn-sm"
                      >
                        Block
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Top Failure Reasons</h2>
          <div className="failure-reasons">
            {charts.topFailureReasons.map((reason, index) => (
              <div key={index} className="reason-item">
                <span className="reason-text">{reason.reason}</span>
                <div className="reason-bar">
                  <div 
                    className="reason-fill"
                    style={{ 
                      width: `${(reason.count / Math.max(...charts.topFailureReasons.map(r => r.count))) * 100}%` 
                    }}
                  ></div>
                  <span className="reason-count">{reason.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>Last updated: {formatTimestamp(overview.timestamp)}</p>
        <p>Active monitoring: {overview.totalIPs} IPs tracked, {overview.activeUsers} active users</p>
      </footer>
    </div>
  );
};

export default SecurityDashboard;
