const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. MANAGER VIEW
// Replace `{view === 'manager' && ( <> ... </> )}`
// The manager view has: Dashboard stuff, and Network intelligence stuff.
let newManager = `{view === 'manager' && (
  <>
    {activeTab === 'dashboard' && (
      <>
        <div className="flex-between mb-6">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleCalculateBills} disabled={loading} style={{ background: 'var(--surface-solid)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}><Settings size={16} /> Calculate Bills</button>
            <form onSubmit={handleBroadcast} style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input-field" placeholder="Broadcast message..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} style={{ padding: '0.45rem 1rem', width: '220px' }} />
              <button type="submit" className="btn btn-primary" disabled={isBroadcasting} style={{ padding: '0.45rem 1rem' }}>{isBroadcasting ? 'Sending...' : 'Broadcast'}</button>
            </form>
          </div>
        </div>

        <div className="stats-grid mb-6">
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">{customers.length}</h3><p className="stat-label">Total Customers</p></div>
            <div className="stat-icon-wrap"><Users size={22} /></div>
          </div>
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">{leakages.filter(l => l.status === 'Pending').length}</h3><p className="stat-label">Pending Incidents</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--warning)' }}><AlertTriangle size={22} /></div>
          </div>
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">LSL {(payments.reduce((acc, p) => acc + parseFloat(p.amount_paid), 0) / 1000).toFixed(1)}k</h3><p className="stat-label">Revenue Collected</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--success)' }}><Wallet size={22} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <div className="flex-between mb-4">
              <h4 className="small text-muted uppercase fw-700">Usage Analytics Dashboard</h4>
              <select className="input-field" value={insightTimeframe} onChange={(e) => setInsightTimeframe(e.target.value)} style={{ width: '120px', padding: '0.2rem', fontSize: '0.75rem' }}>
                <option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Yearly">Yearly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={getUsageTrendsData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="total_units" fill="var(--primary)" name="Units (kl)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4">
            <h4 className="mb-4 small text-muted uppercase fw-700">Segmented Contribution</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={segmentData.map(d => ({ name: d.segment, value: d.total_units }))} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name" label>
                  {segmentData.map((entry, index) => (<Cell key={"cell-" + index} fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-grid mb-6">
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <div className="stat-header mb-4">
              <h3>Branch Operational Summary</h3>
              <Activity className="text-muted" />
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Metric Scope</th><th>Current Period</th><th>Variance</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Total Consumption</td><td>{currentMonthUnits} kl</td><td className="text-success">↓ 4.2%</td><td><span className="badge success">Normal</span></td></tr>
                  <tr><td>Calculated Revenue</td><td>LSL {bills.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0).toFixed(2)}</td><td className="text-success">↑ 12.1%</td><td><span className="badge primary">Growing</span></td></tr>
                  <tr><td>Outstanding Balance</td><td>LSL {balances.reduce((acc, b) => acc + parseFloat(b.total_outstanding || 0), 0).toFixed(2)}</td><td className="text-error">↑ 5.3%</td><td><span className="badge warning">Action Required</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    )}

    {activeTab === 'intelligence' && (
      <div className="glass-card" style={{ borderLeft: '4px solid var(--secondary)', background: 'rgba(99, 102, 241, 0.03)' }}>
        <div className="stat-header mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--secondary)', color: 'white', padding: '0.5rem', borderRadius: '12px' }}>
              <Activity size={20} />
            </div>
            <h3>Network Intelligence & Risk Analysis</h3>
          </div>
          <div className="badge secondary">PROACTIVE_MODE</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="mb-4 small text-muted uppercase">District Risk Heatmap</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { district: 'Maseru', risk: 'High', score: 82, color: 'var(--error)' },
                { district: 'Leribe', risk: 'Moderate', score: 45, color: 'var(--warning)' },
                { district: 'Berea', risk: 'Low', score: 18, color: 'var(--success)' },
                { district: 'Mafeteng', risk: 'Stable', score: 12, color: 'var(--primary)' }
              ].map(d => (
                <div key={d.district} style={{ padding: '1rem', background: 'var(--surface-solid)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                  <div className="flex-between mb-2">
                    <span style={{ fontWeight: 700 }}>{d.district}</span>
                    <span className="badge" style={{ background: d.color + '15', color: d.color }}>{d.risk}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: d.score + '%', height: '100%', background: d.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '20px', border: '1px dashed var(--secondary)' }}>
            <h4 className="mb-3">Predictive Pipe-Health Analysis</h4>
            <p className="small text-muted mb-6">Algorithm detecting anomalous usage spikes vs. report frequency.</p>
            
            <div style={{ padding: '1rem', background: 'var(--secondary)', color: 'white', borderRadius: '16px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} />
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>BURST PREDICTION: MASERU WEST</span>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>92% confidence of subterranean leak near Plot 552 based on 14% pressure variance.</p>
            </div>

            <div className="small" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="flex-between"><span>Infrastructure Integrity</span><span className="fw-700">76%</span></div>
              <div className="flex-between"><span>Sensor Confidence</span><span className="fw-700">99.8%</span></div>
              <div className="flex-between"><span>Maintenance ROI</span><span className="fw-700">+22.4%</span></div>
            </div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'customers' && (
      <>
        {/* We can re-use the customers component from Admin, but for Manager they also have manual usage entry. */}
        <div className="glass-card mb-6">
          <div className="flex-between mb-6">
            <h3>Usage Recording System</h3>
            <Activity className="text-muted" size={20} />
          </div>
          {usageMsg && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontWeight: 600 }}>{usageMsg}</div>}
          <form onSubmit={handleManualUsage} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="input-group">
              <label className="small text-muted mb-1 block">Select Account</label>
              <select className="input-field" value={selectedCustomer || ''} onChange={e => setSelectedCustomer(e.target.value)} required>
                <option value="" disabled>-- Choose --</option>
                {customers.map(c => <option key={c.account_number} value={c.account_number}>{c.account_number} - {c.first_name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Billing Cycle</label>
              <input className="input-field" value={manualUsage.month} onChange={e => setManualUsage({ ...manualUsage, month: e.target.value })} placeholder="e.g. March 2026" required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Usage Volume (kl)</label>
              <input type="number" className="input-field" value={manualUsage.units} onChange={e => setManualUsage({ ...manualUsage, units: e.target.value })} placeholder="Units" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '48px', marginTop: 'auto' }}>Commit Entry</button>
          </form>
        </div>

        <div className="glass-card mb-6">
          <div className="flex-between mb-4">
            <h3>Customer Management</h3>
            <Users className="text-muted" size={20} />
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Account Number</th><th>Full Name</th><th>Customer Type</th></tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.account_number}>
                    <td><span className="badge primary" style={{ fontFamily: 'monospace' }}>{c.account_number}</span></td>
                    <td className="fw-600">{c.first_name} {c.last_name}</td>
                    <td><span className="badge" style={{ background: 'var(--surface-hover)' }}>{c.customer_type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}

    {activeTab === 'reports' && (
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3>Incident Management Hub</h3>
          <AlertTriangle className="text-warning" size={20} />
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Incident ID</th><th>Date Logged</th><th>Location</th><th>Status</th><th>Resolution</th></tr></thead>
            <tbody>
              {leakages.map(l => (
                <tr key={l.report_id}>
                  <td><strong>#L-{l.report_id}</strong></td>
                  <td className="small text-muted">{new Date(l.report_date).toLocaleDateString()}</td>
                  <td>{l.location}</td>
                  <td><span className={"badge " + (l.status === 'Fixed' ? 'success' : 'warning')}>{l.status}</span></td>
                  <td>
                    {l.status !== 'Fixed' ? (
                      <button className="btn btn-primary small" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')}>Mark as Resolved</button>
                    ) : <span className="text-success"><Check size={16} /> Resolved</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
)}`;

content = content.replace(/\{view === 'manager' && \([\s\S]*?(?=\{\/\* ADMIN VIEW \*\/)/, newManager + '\n\n      ');

// 2. ADMIN VIEW
let newAdmin = `{view === 'admin' && (
  <>
    {activeTab === 'dashboard' && (
      <>
        <div className="stats-grid mb-6">
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">{customers.length}</h3><p className="stat-label">Total Accounts</p></div>
            <div className="stat-icon-wrap"><Users size={22} /></div>
          </div>
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">LSL {(bills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0) / 1000).toFixed(1)}k</h3><p className="stat-label">Total Billed</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--success)' }}><Wallet size={22} /></div>
          </div>
        </div>
      </>
    )}

    {activeTab === 'audit' && (
      <>
        <div className="glass-card mb-6" style={{ background: '#0c1a2e', color: '#00ff41', fontFamily: 'monospace', border: '1px solid #00ff41' }}>
          <div className="flex-between mb-4" style={{ borderBottom: '1px solid #00ff4133', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} />
              <span style={{ fontWeight: 800 }}>CORE_SYSTEM_AUDIT_LOG_V2.0</span>
            </div>
            <span className="badge" style={{ background: '#00ff4133', color: '#00ff41', fontSize: '0.65rem' }}>LIVE_STREAM</span>
          </div>
          <div style={{ height: '180px', overflowY: 'auto', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {forensicLogs.map(log => (
              <div key={log.id}>
                <span style={{ opacity: 0.5 }}>[{log.time}]</span>{' '}
                <span style={{ color: log.type === 'SECURITY' ? '#ff3e3e' : '#0ea5e9', fontWeight: 'bold' }}>{log.type}:</span>{' '}
                {log.msg}
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="stat-header mb-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                <History className="text-primary" size={20} />
              </div>
              <h3>Historical DB Audit Logs</h3>
            </div>
          </div>
          <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>Performed By</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted p-4">No audit logs found.</td></tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id}>
                      <td className="small text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                      <td><span className="badge" style={{ background: 'rgba(0,0,0,0.05)' }}>{log.performed_by}</span></td>
                      <td className="fw-600">{log.action}</td>
                      <td>{log.target}</td>
                      <td className="small text-muted">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}

    {activeTab === 'users' && (
      <div className="glass-card mb-6">
        <div className="flex-between mb-6">
          <h3>Customer Management</h3>
          <div className="search-box">
            <input type="text" placeholder="Search customer..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="input-field" style={{ width: '220px', padding: '0.5rem 1rem' }} />
          </div>
        </div>
        <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Account Number</th><th>Full Name</th><th>Customer Type</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.account_number} style={{ background: editingCustomer?.account_number === c.account_number ? 'rgba(14, 165, 233, 0.05)' : 'transparent' }}>
                  <td><span className="badge primary" style={{ fontFamily: 'monospace' }}>{c.account_number}</span></td>
                  <td className="fw-600">{c.first_name} {c.last_name}</td>
                  <td>
                    <span className={'badge ' + (c.customer_type === 'Industrial' ? 'error' : (c.customer_type === 'Commercial' ? 'warning' : 'success'))} style={{ opacity: 0.8 }}>
                      {c.customer_type}
                    </span>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn small" onClick={() => setEditingCustomer(c)} style={{ background: 'rgba(14, 165, 233, 0.1)' }}><Settings size={14} /></button>
                      <button className="btn small" onClick={() => handleDeleteCustomer(c.account_number)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}><LogOut size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={'mt-8 p-6 ' + (editingCustomer ? 'edit-mode-active' : '')} style={{
          background: editingCustomer ? 'rgba(14, 165, 233, 0.03)' : 'var(--surface-solid)',
          borderRadius: '20px', border: editingCustomer ? '1px solid var(--primary)' : '1px solid var(--border-color)',
        }}>
          <div className="flex-between mb-4">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingCustomer ? <Settings size={18} className="text-primary" /> : <UserPlus size={18} className="text-primary" />}
              {editingCustomer ? 'Editing Account: ' + editingCustomer.account_number : 'Onboard New Customer'}
            </h4>
            {editingCustomer && <button className="badge" onClick={() => setEditingCustomer(null)} style={{ cursor: 'pointer', border: 'none' }}>Cancel Edit</button>}
          </div>
          <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <div className="input-group">
              <label className="small text-muted mb-1 block">First Name</label>
              <input className="input-field" value={editingCustomer ? editingCustomer.first_name : newCustomer.first_name} onChange={e => editingCustomer ? setEditingCustomer({ ...editingCustomer, first_name: e.target.value }) : setNewCustomer({ ...newCustomer, first_name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Last Name</label>
              <input className="input-field" value={editingCustomer ? editingCustomer.last_name : newCustomer.last_name} onChange={e => editingCustomer ? setEditingCustomer({ ...editingCustomer, last_name: e.target.value }) : setNewCustomer({ ...newCustomer, last_name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Email Address</label>
              <input type="email" className="input-field" value={editingCustomer ? editingCustomer.email : newCustomer.email} onChange={e => editingCustomer ? setEditingCustomer({ ...editingCustomer, email: e.target.value }) : setNewCustomer({ ...newCustomer, email: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Category</label>
              <select className="input-field" value={editingCustomer ? editingCustomer.customer_type : newCustomer.customer_type} onChange={e => editingCustomer ? setEditingCustomer({ ...editingCustomer, customer_type: e.target.value }) : setNewCustomer({ ...newCustomer, customer_type: e.target.value })}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="small text-muted mb-1 block">Physical Address</label>
              <input className="input-field" value={editingCustomer ? editingCustomer.address : newCustomer.address} onChange={e => editingCustomer ? setEditingCustomer({ ...editingCustomer, address: e.target.value }) : setNewCustomer({ ...newCustomer, address: e.target.value })} required />
            </div>
            {!editingCustomer && (
              <>
                <div className="input-group">
                  <label className="small text-muted mb-1 block">Portal Username</label>
                  <input className="input-field" value={newCustomer.username} onChange={e => setNewCustomer({ ...newCustomer, username: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="small text-muted mb-1 block">Portal Password</label>
                  <input type="password" className="input-field" value={newCustomer.password} onChange={e => setNewCustomer({ ...newCustomer, password: e.target.value })} required />
                </div>
              </>
            )}
            <button className={'btn ' + (editingCustomer ? 'btn-primary' : 'btn-success')} style={{ gridColumn: 'span 2', marginTop: '1rem', height: '50px', fontSize: '1rem' }}>
              {editingCustomer ? 'Confirm Updates' : 'Onboard Customer'}
            </button>
          </form>
        </div>
      </div>
    )}

    {activeTab === 'rates' && (
      <div className="glass-card mb-6" style={{ borderLeft: '4px solid var(--warning)' }}>
        <div className="stat-header mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
              <CreditCard className="text-warning" size={20} />
            </div>
            <h3>Billing Rate Configuration</h3>
          </div>
        </div>
        <div className="table-container mb-6" style={{ border: '1px solid var(--glass-border)', background: 'var(--surface-solid)' }}>
          <table className="data-table">
            <thead><tr><th>Tier Name / Customer Type</th><th>Usage Scope</th><th>Rate (LSL/Unit)</th><th className="text-right">Management</th></tr></thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.rate_id} style={{ background: editingRate?.rate_id === r.rate_id ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                  <td><strong className="text-main">{r.tier_name}</strong></td>
                  <td>
                    <span className="badge" style={{ 
                      background: r.maximum_units > 9000 ? 'rgba(14, 165, 233, 0.1)' : 'var(--surface-hover)', 
                      color: r.maximum_units > 9000 ? 'var(--primary)' : 'var(--text-main)',
                      border: r.maximum_units > 9000 ? '1px solid rgba(14, 165, 233, 0.2)' : 'none'
                    }}>
                      {r.maximum_units > 9000 ? 'Unlimited Usage' : r.minimum_units + ' — ' + r.maximum_units + ' Units'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{parseFloat(r.rate_per_unit).toFixed(2)}</td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn small" onClick={() => startEditRate(r)} style={{ background: 'rgba(14, 165, 233, 0.1)' }}><Settings size={14} /></button>
                      <button className="btn small" onClick={() => handleDeleteRate(r.rate_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}><LogOut size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={'p-6 ' + (editingRate ? 'edit-mode-active' : '')} style={{
          background: editingRate ? 'rgba(245, 158, 11, 0.03)' : 'var(--surface-solid)',
          borderRadius: '20px', border: editingRate ? '1px solid var(--warning)' : '1px solid transparent',
        }}>
          <div className="flex-between mb-4">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} className="text-warning" />
              {editingRate ? 'Modifying Tier: ' + editingRate.tier_name : 'Define New Rate Tier'}
            </h4>
            {editingRate && <button className="badge" onClick={() => { setEditingRate(null); setNewTierName(''); setNewMinUnits(''); setNewMaxUnits(''); setNewRate(''); }} style={{ cursor: 'pointer', border: 'none' }}>Discard Edit</button>}
          </div>
          <form onSubmit={editingRate ? handleUpdateRate : handleAddRate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <div className="input-group">
              <label className="small text-muted mb-1 block">Tier Label</label>
              <input className="input-field" value={newTierName} onChange={e => setNewTierName(e.target.value)} placeholder="e.g. Tier 1" required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Min Units</label>
              <input type="number" className="input-field" value={newMinUnits} onChange={e => setNewMinUnits(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Max Units</label>
              <input type="number" className="input-field" value={newMaxUnits} onChange={e => setNewMaxUnits(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block">Rate (LSL)</label>
              <input type="number" step="0.01" className="input-field" value={newRate} onChange={e => setNewRate(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 4', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--surface-hover)', padding: '0.5rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <strong>Pro Tip:</strong> For flat customer-type rates (e.g. Residents), set <b>Min Units: 0</b> and <b>Max Units: 999999</b>.
            </div>
            <button className={'btn ' + (editingRate ? 'btn-warning' : 'btn-primary')} style={{ gridColumn: 'span 4', height: '48px' }}>
              {editingRate ? 'Commit Rate Changes' : 'Publish Rate Tier'}
            </button>
          </form>
        </div>
      </div>
    )}
  </>
)}`;

content = content.replace(/\{view === 'admin' && \([\s\S]*?(?=\{\/\* CUSTOMER VIEW \*\/|view === 'customer')/, newAdmin + '\n\n      ');

// 3. CUSTOMER VIEW
let newCustomer = `{view === 'customer' && (
  <>
    {activeTab === 'dashboard' && (
      <>
        {/* WATER HERO GAMIFICATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.1))', animationDelay: '0s' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-solid)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)', position: 'relative'
              }}>
                <div style={{ fontSize: '2.5rem' }}>🏆</div>
                <div style={{ 
                  position: 'absolute', bottom: -5, background: 'var(--success)', 
                  color: 'white', padding: '0.2rem 0.6rem', borderRadius: '99px',
                  fontSize: '0.7rem', fontWeight: 800
                }}>LEVEL 4</div>
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="mb-1" style={{ color: 'var(--success)', fontSize: '1.5rem' }}>You are a Water Hero!</h2>
                <p className="text-muted small">Your usage is <strong>12% lower</strong> than the average in <strong>{user.district || 'your area'}</strong>. Keep up the great conservation work!</p>
                <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, var(--success), var(--primary))' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ background: 'var(--surface-solid)', animationDelay: '0.1s' }}>
            <h4 className="mb-4 small text-muted uppercase fw-700">Conservation Badges</h4>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <div title="Paid on time" style={{ padding: '0.6rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', fontSize: '1.2rem' }}>⚡</div>
              <div title="Saved 100kl" style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', fontSize: '1.2rem' }}>🌱</div>
              <div title="Leakage Reporter" style={{ padding: '0.6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', fontSize: '1.2rem' }}>🛡️</div>
              <div title="Legend Status" style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', fontSize: '1.2rem', opacity: 0.3 }}>👑</div>
            </div>
            <p className="mt-4 text-center small text-muted">Earn <strong>King Status</strong> by paying before the 15th!</p>
          </div>
        </div>

        <div className="stats-grid mb-6">
          <div className="glass-card" style={{ gridColumn: 'span 2', height: '400px' }}>
            <div className="stat-header mb-4"><h3>Usage Trends</h3><Activity className="text-muted" /></div>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={bills.filter(b => b.account_number === user.account_number).reverse().slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="billing_month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--surface-solid)', color: 'var(--text-main)' }} />
                <Bar dataKey="units_used" fill="var(--primary)" name="Units Used" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    )}

    {activeTab === 'reports' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card">
          <div className="stat-header mb-4"><h3>Report a Leakage</h3><AlertTriangle className="text-warning" /></div>
          <form onSubmit={handleReportLeakage} className="grid grid-cols-1 gap-4">
            <input className="input-field" placeholder="Exact Location (e.g. Maseru West Plot 123)" value={leakageLocation} onChange={e => setLeakageLocation(e.target.value)} required />
            <textarea className="input-field" placeholder="Describe the issue... (e.g. Large burst on the main road)" value={leakageDesc} onChange={e => setLeakageDesc(e.target.value)} rows="3" required></textarea>
            <button type="submit" className="btn btn-primary"><AlertTriangle size={16} /> Submit Report</button>
            {leakageMsg && <div style={{ color: 'var(--success)', marginTop: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>{leakageMsg}</div>}
          </form>
        </div>
        <div className="glass-card">
          <div className="stat-header mb-4"><h3>My Incident Reports</h3><History className="text-muted" /></div>
          <div className="table-container" style={{ maxHeight: '250px' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {myLeakages.length === 0 ? <tr><td colSpan="3" className="text-center text-muted">No reports submitted.</td></tr> : myLeakages.map(l => (
                  <tr key={l.report_id}>
                    <td className="small text-muted">{new Date(l.report_date).toLocaleDateString()}</td>
                    <td>{l.location}</td>
                    <td><span className={"badge " + (l.status === 'Fixed' ? 'success' : 'warning')}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'history' && (
      <div className="glass-card mb-6">
        <div className="flex-between mb-4">
          <h3>Recent Billing History</h3>
          <div className="flex" style={{ gap: '0.5rem' }}>
            <select className="input-field" value={billStatusFilter} onChange={(e) => setBillStatusFilter(e.target.value)} style={{ padding: '0.4rem 1rem', width: 'auto' }}>
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        {paymentMsg && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontWeight: 600 }}>{paymentMsg}</div>}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Month</th><th>Units</th><th>Total (LSL)</th><th>Due Date</th><th>Status</th><th className="text-right">Action</th></tr>
            </thead>
            <tbody>
              {displayedBills.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted p-6">No bills found for your search.</td></tr>
              ) : (
                displayedBills.map(b => (
                  <tr key={b.bill_id || b.billing_month + b.account_number}>
                    <td className="fw-600">{b.billing_month}</td>
                    <td>{b.units_used} kl</td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{parseFloat(b.total_amount).toFixed(2)}</td>
                    <td className="small text-muted">{new Date(b.due_date).toLocaleDateString()}</td>
                    <td><span className={"badge " + (b.payment_status === 'Paid' ? 'paid' : 'unpaid')}>{b.payment_status}</span></td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {b.payment_status === 'Unpaid' && (
                          <button className="btn btn-primary small" onClick={() => setPayingBill(b)}>Pay Now</button>
                        )}
                        <button className="btn small" onClick={() => handlePrint(b)} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
)}`;

content = content.replace(/\{view === 'customer' && \([\s\S]*?(?=\{\/\* MODALS \*\/)/, newCustomer + '\n\n      ');

fs.writeFileSync('frontend/src/App.jsx', content);
console.log("Rewrite complete");
