const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const managerView = `
        {view === 'manager' && (
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

            {activeTab === 'users' && (
              <>
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
        )}
`;

const sidebarAndMain = `
          {(view === 'admin' || view === 'manager') && (
            <div className={\`nav-item \${activeTab === 'users' ? 'active' : ''}\`} onClick={() => setActiveTab('users')}>
              <Users size={18} /> <span>Customers</span>
            </div>
          )}
          {view === 'admin' && (
            <div className={\`nav-item \${activeTab === 'rates' ? 'active' : ''}\`} onClick={() => setActiveTab('rates')}>
              <Settings size={18} /> <span>Rates & Billing</span>
            </div>
          )}
          {(view === 'admin' || view === 'manager') && (
            <div className={\`nav-item \${activeTab === 'reports' ? 'active' : ''}\`} onClick={() => setActiveTab('reports')}>
              <AlertTriangle size={18} /> <span>Incidents</span>
            </div>
          )}
          {view === 'admin' && (
            <div className={\`nav-item \${activeTab === 'audit' ? 'active' : ''}\`} onClick={() => setActiveTab('audit')}>
              <FileText size={18} /> <span>Audit Log</span>
            </div>
          )}
          {view === 'manager' && (
            <div className={\`nav-item \${activeTab === 'intelligence' ? 'active' : ''}\`} onClick={() => setActiveTab('intelligence')}>
              <Activity size={18} /> <span>Intelligence</span>
            </div>
          )}
          {view === 'customer' && (
            <>
              <div className={\`nav-item \${activeTab === 'history' ? 'active' : ''}\`} onClick={() => setActiveTab('history')}>
                <History size={18} /> <span>Billing History</span>
              </div>
              <div className={\`nav-item \${activeTab === 'reports' ? 'active' : ''}\`} onClick={() => setActiveTab('reports')}>
                <AlertTriangle size={18} /> <span>Report Leakage</span>
              </div>
            </>
          )}
        </div>

        <button className="btn" onClick={handleLogout} style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', justifyContent: 'center' }}>
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </aside>

      <main className="main-content">
        {topNavJSX}
`;

// Find where the sidebar nav items start and portals start
content = content.replace(/\\{\\(view === 'admin' \\|\\| view === 'manager'\\) && \\(\\s*<div className=\\{\\`nav-item \\$\\{activeTab === 'users' \\? 'active' : ''\\}\\`\\} onClick=\\{\\(\\) => setActiveTab\\('users'\\)\\}>\\s*<Users size=\\{18\\} \\/> <span>Customers<\\/span>\\s*<\\/div>\\s*\\)\\}\\s*\\{view === 'admin' && \\(/, sidebarAndMain + managerView + '\\n        {view === \\'admin\\' && (');

// Close the main and app-layout tags at the end
content = content.replace(/\\}\\)\\s*<\\/div>\\s*\\);\\s*\\}/, '})\\n      </main>\\n    </div>\\n  );\\n}');

fs.writeFileSync('frontend/src/App.jsx', content);
