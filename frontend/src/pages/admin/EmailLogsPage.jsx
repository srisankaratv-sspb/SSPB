import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Mail, RefreshCw } from 'lucide-react';

export const EmailLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getEmailLogs();
      if (res.success && res.data) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      const res = await adminService.retryEmail(id);
      if (res.success) {
        alert('Email re-transmission triggered.');
        fetchLogs();
      }
    } catch (err) {
      alert('Retry failed: ' + err.message);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.8rem', margin: 0 }}>
            Brevo Transactional Email Logs
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
            Monitor automated receipt delivery, admin alerts, and retry transient errors.
          </p>
        </div>

        <Button variant="alt" onClick={fetchLogs}>
          <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh
        </Button>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Recipient</th>
                <th>Template</th>
                <th>Subject</th>
                <th>Brevo Message ID</th>
                <th>Status</th>
                <th>Retries</th>
                <th>Sent At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    Loading email transmission logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    No transactional emails logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      {log.orderNumber ? (
                        <a href={`/admin/orders/${log.orderId}`} style={{ color: 'var(--head)', fontWeight: 600 }}>
                          {log.orderNumber}
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <div><strong>{log.recipientName}</strong></div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{log.recipientEmail}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{log.templateType}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.subject}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.brevoMessageId || 'Pending'}</td>
                    <td><Badge status={log.status} /></td>
                    <td>{log.retryCount}</td>
                    <td>{log.sentAt ? new Date(log.sentAt).toLocaleString('en-IN') : '—'}</td>
                    <td>
                      <Button
                        variant="alt"
                        onClick={() => handleRetry(log._id)}
                        loading={retryingId === log._id}
                        style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                      >
                        Resend
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailLogsPage;
