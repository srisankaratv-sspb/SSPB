import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { ShieldAlert, Search, RefreshCw, ChevronLeft, ChevronRight, Eye, User, Globe, Clock, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (resourceType) params.resourceType = resourceType;

      const res = await adminService.getAuditLogs(params);
      if (res.data?.success && res.data.data) {
        setLogs(res.data.data.logs || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, resourceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('REFUND') || action.includes('DELETE')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (action.includes('UPDATE') || action.includes('STATUS')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (action.includes('CREATE') || action.includes('CONFIRM')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-admin-maroon flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-admin-gold" />
            Security & Audit Logs
          </h1>
          <p className="text-sm text-admin-muted mt-1">
            Immutable log of all administrative actions, status updates, settings changes, and refunds.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="admin-btn-secondary inline-flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
            <input
              type="text"
              placeholder="Search by admin email, action name, or resource ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-full"
            />
          </div>
          <button type="submit" className="admin-btn-primary px-4 text-sm">
            Search
          </button>
        </form>

        <div className="w-full md:w-auto flex items-center gap-2">
          <label className="text-xs font-semibold text-admin-muted whitespace-nowrap">Resource:</label>
          <select
            className="admin-input text-sm py-2"
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Resources</option>
            <option value="ORDER">Orders</option>
            <option value="PAYMENT">Payments</option>
            <option value="PRODUCT">Products</option>
            <option value="SETTING">Settings</option>
            <option value="ADMIN_USER">Admin Users</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-cream border-b border-admin-border text-xs font-semibold text-admin-muted uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-admin-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-admin-gold mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-admin-muted">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-admin-cream/50 transition-colors">
                    <td className="py-3 px-4 text-xs text-admin-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-admin-gold" />
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-admin-maroon">
                        <User className="w-3.5 h-3.5 text-admin-muted" />
                        <span>{log.adminEmail || 'System Process'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <span className="font-semibold text-admin-dark">{log.resourceType}</span>
                        {log.resourceId && (
                          <span className="block font-mono text-[11px] text-admin-muted truncate max-w-[140px]" title={log.resourceId}>
                            {log.resourceId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-admin-muted">
                      <div className="flex items-center gap-1 font-mono">
                        <Globe className="w-3 h-3" />
                        {log.ipAddress || '127.0.0.1'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="admin-btn-secondary p-1.5 text-xs inline-flex items-center gap-1"
                        title="View payload changes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-admin-border flex items-center justify-between text-xs text-admin-muted">
          <div>
            Showing {logs.length} of {pagination.total} recorded events
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded border border-admin-border hover:bg-admin-cream disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {pagination.pages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.pages || 1))}
              disabled={page >= (pagination.pages || 1) || loading}
              className="p-1.5 rounded border border-admin-border hover:bg-admin-cream disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-admin-border overflow-hidden">
            <div className="p-4 bg-admin-maroon text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2 text-admin-gold">
                <FileText className="w-5 h-5" />
                Audit Event: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs bg-admin-cream p-3 rounded border border-admin-border">
                <div>
                  <span className="text-admin-muted block">Administrator:</span>
                  <span className="font-semibold text-admin-maroon">{selectedLog.adminEmail}</span>
                </div>
                <div>
                  <span className="text-admin-muted block">Timestamp:</span>
                  <span className="font-semibold">{new Date(selectedLog.createdAt).toISOString()}</span>
                </div>
                <div>
                  <span className="text-admin-muted block">Resource:</span>
                  <span className="font-mono">{selectedLog.resourceType} : {selectedLog.resourceId}</span>
                </div>
                <div>
                  <span className="text-admin-muted block">Origin IP:</span>
                  <span className="font-mono">{selectedLog.ipAddress || 'N/A'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  Recorded Changes / Request Payload
                </h4>
                <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded-md overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.changes || {}, null, 2)}
                </pre>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <h4 className="text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                    Client User Agent
                  </h4>
                  <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-700 break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-admin-cream border-t border-admin-border flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="admin-btn-primary px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
