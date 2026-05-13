import { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplets, Activity, Wallet, CreditCard, ChevronRight, User, LogOut, AlertTriangle, BarChart as BarChartIcon, FileText, Settings, Users, History, UserPlus, Bell, Check, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './index.css';

const getApiBase = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'http://localhost:5000/api';
  }
  return 'https://wasco-billing-nbph.onrender.com/api';
};
const API_BASE = getApiBase();

// --- MOCK DATA FOR FALLBACK ---
const MOCK_USERS = {
  'admin': { id: 1, role: 'Admin', account_number: null },
  'manager': { id: 2, role: 'Manager', account_number: null },
  'wasco001': { id: 3, role: 'Customer', account_number: 'WASCO-001' },
  'wasco002': { id: 4, role: 'Customer', account_number: 'WASCO-002' }
};

const MOCK_BILLS = [
  { account_number: 'WASCO-001', billing_month: '2026-04', units_used: 250, total_amount: 2195.00, due_date: '2026-04-30T00:00:00Z', payment_status: 'Unpaid' },
  { account_number: 'WASCO-002', billing_month: '2026-04', units_used: 50, total_amount: 395.00, due_date: '2026-04-30T00:00:00Z', payment_status: 'Paid' },
  { account_number: 'WASCO-003', billing_month: '2026-04', units_used: 200, total_amount: 1755.00, due_date: '2026-04-30T00:00:00Z', payment_status: 'Unpaid' }
];

const MOCK_USAGE_REPORTS = [
  { reading_date: '2026-04-01', billing_month: '2026-04', units_used: 500, total_units: 500 },
  { reading_date: '2026-03-01', billing_month: '2026-03', units_used: 450, total_units: 450 },
  { reading_date: '2026-02-01', billing_month: '2026-02', units_used: 420, total_units: 420 },
  { reading_date: '2026-01-01', billing_month: '2026-01', units_used: 390, total_units: 390 },
  { reading_date: '2025-12-01', billing_month: '2025-12', units_used: 410, total_units: 410 },
];

const MOCK_LEAKAGES = [
  { report_id: 999, report_date: '2026-04-20T00:00:00Z', account_number: 'WASCO-004', location: 'Maseru West, near the mall', description: 'Pipe burst on main road', status: 'Pending' }
];

const MOCK_RATES = [
  { rate_id: 1, tier_name: 'Residential', minimum_units: 0, maximum_units: 999999, rate_per_unit: 5.50 },
  { rate_id: 2, tier_name: 'Business', minimum_units: 0, maximum_units: 999999, rate_per_unit: 7.00 },
  { rate_id: 3, tier_name: 'Industrial', minimum_units: 0, maximum_units: 999999, rate_per_unit: 9.00 }
];

let MOCK_CUSTOMERS = [
  { account_number: 'WASCO-001', first_name: 'John', last_name: 'Doe', names: 'John Doe', address: '123 Main St', district: 'Maseru', customer_type: 'Residential' },
  { account_number: 'WASCO-002', first_name: 'Jane', last_name: 'Smith', names: 'Jane Smith', address: '456 Oak Rd', district: 'Leribe', customer_type: 'Commercial' },
];

const MOCK_PAYMENTS = [
  { payment_id: 1, account_number: 'WASCO-002', bill_month: '2026-03', amount_paid: 350.00, payment_date: '2026-03-25T00:00:00Z', payment_method: 'Online', reference_number: 'REF-100234' }
];

const MOCK_DISTRICT_REPORTS = [
  { district: 'Maseru', total_units: 1200, total_revenue: 15000 },
  { district: 'Leribe', total_units: 800, total_revenue: 9500 },
  { district: 'Berea', total_units: 600, total_revenue: 7200 },
  { district: 'Mafeteng', total_units: 450, total_revenue: 5100 }
];

const MOCK_SEGMENT_DATA = [
  { segment: 'Residential', total_units: 2500, total_revenue: 13750 },
  { segment: 'Business', total_units: 1500, total_revenue: 10500 },
  { segment: 'Industrial', total_units: 3000, total_revenue: 27000 },
  { segment: 'Other', total_units: 500, total_revenue: 2500 }
];
// ------------------------------

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'public', 'customer', 'admin', 'manager'
  
  // Theme & Layout State
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  // Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCustomerType, setRegCustomerType] = useState('Residential');

  // Data States
  const [bills, setBills] = useState([]);
  const [usageReports, setUsageReports] = useState([]);
  const [leakages, setLeakages] = useState([]);
  const [rates, setRates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balances, setBalances] = useState([]); // From view_customer_balances
  const [payingBill, setPayingBill] = useState(null); // Track bill currently being paid
  const [selectedPayMethod, setSelectedPayMethod] = useState('M-Pesa');
  const [forensicLogs, setForensicLogs] = useState([
    { id: 1, type: 'SYSTEM', msg: 'Core Kernel initialized successfully', time: new Date().toLocaleTimeString() },
    { id: 2, type: 'DB', msg: 'MySQL Connection Pool: 2/2 Active', time: new Date().toLocaleTimeString() },
    { id: 3, type: 'AUTH', msg: 'Security firewall active', time: new Date().toLocaleTimeString() }
  ]);
  const [leakageStats, setLeakageStats] = useState([]); // From view_leakage_summary
  const [usageGranularity, setUsageGranularity] = useState('Monthly'); // 'Daily', 'Monthly', 'Yearly'
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('Urgent Alert');
  const [districtReports, setDistrictReports] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [segmentMetric, setSegmentMetric] = useState('total_units'); // 'total_units' or 'total_revenue'
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [toasts, setToasts] = useState([]); // {id, message, type}

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Forms State
  const [leakageLocation, setLeakageLocation] = useState('');
  const [leakageDesc, setLeakageDesc] = useState('');
  const [leakageMsg, setLeakageMsg] = useState('');
  const [paymentMsg, setPaymentMsg] = useState('');

  // Search & Filter State
  const [customerSearch, setCustomerSearch] = useState('');
  const [billSearch, setBillSearch] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('All');
  const [calculationMonth, setCalculationMonth] = useState('March 2026');
  const [billToPrint, setBillToPrint] = useState(null);

  // Rates Management State
  const [newTierName, setNewTierName] = useState('');
  const [newMinUnits, setNewMinUnits] = useState('');
  const [newMaxUnits, setNewMaxUnits] = useState('');
  const [newRate, setNewRate] = useState('');
  const [showRateForm, setShowRateForm] = useState(false);

  // Customer Management & Manual Usage State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [manualUsage, setManualUsage] = useState({ month: 'March 2026', date: new Date().toISOString().split('T')[0], units: '' });
  const [usageMsg, setUsageMsg] = useState('');

  useEffect(() => {
    // Initial health check to see if we should start in offline mode
    const checkHealth = async () => {
      try {
        await axios.get(`${API_BASE}/rates`);
        setIsOffline(false);
      } catch (e) {
        setIsOffline(true);
      }
    };
    checkHealth();
  }, []);
  const [insightTimeframe, setInsightTimeframe] = useState('Monthly'); // 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    username: '', password: '', first_name: '', last_name: '',
    email: '', address: '', district: '', phone: '', customer_type: 'Residential'
  });
  const [editingRate, setEditingRate] = useState(null);

  const addAuditLog = (type, msg) => {
    setForensicLogs(prev => [{ id: Date.now(), type, msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    addAuditLog('AUTH', `Login attempt initiated for: ${username}`);
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      if (res.data.success) {
        setIsOffline(false);
        setUser(res.data.user);
        addAuditLog('AUTH', `User ${username} authenticated. Level: ${res.data.user.role}`);
        navigateUser(res.data.user);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        addAuditLog('SECURITY', `Access Denied: Invalid password for ${username}`);
        setLoginError('Invalid username or password.');
      } else {
        addAuditLog('SYSTEM', 'Backend offline. Activating Sandbox mode.');
        setIsOffline(true);
        const mockUser = MOCK_USERS[username.toLowerCase()];
        if (mockUser) {
          setUser(mockUser);
          addAuditLog('AUTH', `Sandbox Session started for: ${username}`);
          navigateUser(mockUser);
        } else {
          setLoginError('Server unreachable. Try mock credentials (admin, manager).');
        }
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Client-side validation
    if (!username || !password || !regFirstName || !regLastName || !regAddress || !regDistrict) {
      setRegisterError('All fields marked with * are required.');
      return;
    }
    // Simple email validation if provided
    if (regEmail && !/^[\w.-]+@[\w.-]+\.\w+$/.test(regEmail)) {
      setRegisterError('Please enter a valid email address.');
      return;
    }
    setRegisterError('');
    try {
      const res = await axios.post(`${API_BASE}/register`, {
        username,
        password,
        first_name: regFirstName,
        last_name: regLastName,
        email: regEmail,
        address: regAddress,
        district: regDistrict,
        phone: regPhone,
        customer_type: regCustomerType
      });
      if (res.data.success) {
        setRegisterSuccess('Registration successful! You can now log in.');
        setView('login');
      }
    } catch (err) {
      if (err.response) {
        // Server responded with an error (e.g., 400, 409, 500)
        setRegisterError(err.response.data.error || 'Server error occurred during registration.');
      } else {
        // Network error or server unreachable
        console.warn('Backend unavailable, using mock register.');
        const newAcc = `WASCO-${Math.floor(1000 + Math.random() * 9000)}`;
        MOCK_USERS[username.toLowerCase()] = { id: Object.keys(MOCK_USERS).length + 1, role: 'Customer', account_number: newAcc };
        MOCK_CUSTOMERS.push({ account_number: newAcc, first_name: regFirstName, last_name: regLastName, email: regEmail, address: regAddress, district: regDistrict, customer_type: 'Residential' });
        setRegisterSuccess('Registration successful! (Mocked offline). You can now log in.');
        setView('login');
        setIsOffline(true);
      }
    }
  };

  const navigateUser = (u) => {
    if (u.role.toLowerCase() === 'admin') setView('admin');
    else if (u.role.toLowerCase() === 'manager') setView('manager');
    else setView('customer');
    fetchData(u.role.toLowerCase(), u.account_number);
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setUsername('');
    setPassword('');
    setLoginSuccess('');
    setLoginError('');
  };

  const fetchData = async (role, account_number = null) => {
    setLoading(true);
    try {
      const [billsRes, ratesRes] = await Promise.all([
        axios.get(`${API_BASE}/bills`),
        axios.get(`${API_BASE}/rates`)
      ]);
      setBills(billsRes.data);
      setRates(ratesRes.data);
      setIsOffline(false);

      if (role === 'admin' || role === 'manager') {
        const [usageRes, leakRes, custRes, payRes, distRes, segRes] = await Promise.all([
          axios.get(`${API_BASE}/usage`),
          axios.get(`${API_BASE}/leakages`),
          axios.get(`${API_BASE}/customers`),
          axios.get(`${API_BASE}/payments`),
          axios.get(`${API_BASE}/reports/districts`),
          axios.get(`${API_BASE}/reports/segments`)
        ]);
        setUsageReports(usageRes.data);
        setLeakages(leakRes.data);
        setCustomers(custRes.data);
        setPayments(payRes.data);
        setSegmentData(segRes.data);
        setDistrictReports(distRes.data);

        // Fetch View-based insights (Non-critical)
        try {
          const [balRes, lStatRes] = await Promise.all([
            axios.get(`${API_BASE}/views/balances`),
            axios.get(`${API_BASE}/views/leakage-stats`)
          ]);
          setBalances(balRes.data);
          setLeakageStats(lStatRes.data);
        } catch (e) { console.warn('Analytical views unavailable'); }
      }

      if (role === 'customer') {
        try {
          const [payRes, notifRes, leakRes] = await Promise.all([
            axios.get(`${API_BASE}/payments?account=${account_number}`),
            axios.get(`${API_BASE}/notifications?account=${account_number}`),
            axios.get(`${API_BASE}/leakages`)
          ]);
          setPayments(payRes.data);
          setNotifications(notifRes.data);
          setLeakages(leakRes.data);
        } catch (e) {
          console.warn('Customer specific data failed to load');
        }
      }
      if (role === 'admin') {
        try {
          const res = await axios.get(`${API_BASE}/admin/audit-logs`);
          setAuditLogs(res.data);
        } catch (err) { console.error('Error fetching audit logs:', err); }
      }
    } catch (err) {
      console.warn('Backend unavailable, using mock data.');
      setIsOffline(true);
      
      // Only use mock data if the state is currently empty to avoid overwriting real data (the "flash" bug)
      if (bills.length === 0) setBills(MOCK_BILLS);
      if (rates.length === 0) setRates(MOCK_RATES);
      
      if (role === 'admin' || role === 'manager') {
        if (usageReports.length === 0) setUsageReports(MOCK_USAGE_REPORTS);
        if (leakages.length === 0) setLeakages(MOCK_LEAKAGES);
        if (customers.length === 0) setCustomers(MOCK_CUSTOMERS);
        if (segmentData.length === 0) setSegmentData(MOCK_SEGMENT_DATA);
      }
      if (role === 'customer') {
        if (payments.length === 0) setPayments(MOCK_PAYMENTS.filter(p => p.account_number === account_number));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicData = async () => {
    setView('public');
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/rates`);
      setRates(res.data);
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
      setRates(MOCK_RATES);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (bill_id, account_number, billing_month, amount, method) => {
    try {
      const res = await axios.post(`${API_BASE}/pay`, { bill_id, account_number, billing_month, amount, payment_method: method });
      setPaymentMsg(`Payment successful via ${method}! Ref: ${res.data.reference}`);
      setTimeout(() => setPaymentMsg(''), 5000);
      setPayingBill(null);
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      console.warn('Backend unavailable, using mock payment.');
      const ref = `REF-MOCK-${Math.floor(Math.random() * 10000)}`;
      setPaymentMsg(`Payment successful via ${method}! Ref: ${ref}`);
      setTimeout(() => setPaymentMsg(''), 5000);
      setPayingBill(null);

      setBills(bills.map(b =>
        (b.account_number === account_number && b.billing_month === billing_month)
          ? { ...b, payment_status: 'Paid' } : b
      ));
      setPayments([{
        payment_date: new Date().toISOString(),
        account_number,
        bill_month: billing_month,
        payment_method: method,
        reference_number: ref,
        amount_paid: amount
      }, ...payments]);
    }
  };

  const handleReportLeakage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/leakage`, {
        account_number: user.account_number,
        location: leakageLocation,
        description: leakageDesc
      });
      setLeakageMsg('Leakage reported successfully!');
      setLeakageLocation('');
      setLeakageDesc('');
      setTimeout(() => setLeakageMsg(''), 5000);
      
      // Fetch the updated list of leakages so the new "Pending" report shows immediately
      const leakRes = await axios.get(`${API_BASE}/leakages`);
      setLeakages(leakRes.data);
    } catch (err) {
      console.warn('Backend unavailable, using mock leakage report.');
      setLeakageMsg('Leakage reported successfully! (Mocked offline)');
      setLeakageLocation('');
      setLeakageDesc('');
      setTimeout(() => setLeakageMsg(''), 5000);

      setLeakages([...leakages, {
        report_date: new Date().toISOString(),
        account_number: user.account_number,
        location: leakageLocation,
        description: leakageDesc,
        status: 'Pending'
      }]);
    }
  };

  const handleCalculateBills = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/calculate-bills`, { month: calculationMonth });
      alert(res.data.message);
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      console.error('Calculation error:', err);
      alert('Failed to calculate bills. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const res = await axios.put(`${API_BASE}/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    setIsBroadcasting(true);
    try {
      const res = await axios.post(`${API_BASE}/notifications/broadcast`, {
        message: broadcastMsg,
        type: broadcastType
      });
      if (res.data.success) {
        addToast(res.data.message);
        setBroadcastMsg('');
        const auditRes = await axios.get(`${API_BASE}/admin/audit-logs`);
        setAuditLogs(auditRes.data);
      }
    } catch (err) {
      console.error('Broadcast error:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleUpdateLeakageStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_BASE}/leakages/${id}`, { status });
      if (res.data.success) {
        const leakRes = await axios.get(`${API_BASE}/leakages`);
        setLeakages(leakRes.data);
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/customers/${user.account_number}`, {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        district: user.district,
        customer_type: user.customer_type
      });
      if (res.data.success) {
        addToast('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const myLeakages = leakages.filter(l => l.account_number === user?.account_number);

  const handleUpdateLeakage = async (id, status) => {
    if (!id) {
      alert('Cannot update: leakage ID is missing. Try refreshing the data.');
      fetchData(user.role.toLowerCase(), user.account_number);
      return;
    }
    try {
      await axios.put(`${API_BASE}/leakages/${id}`, { status });
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      console.error('Update leakage error:', err);
      alert('Failed to update leakage status.');
    }
  };

  const handleAddRate = async (e) => {
    e.preventDefault();
    const rateData = {
      tier_name: newTierName,
      minimum_units: parseInt(newMinUnits),
      maximum_units: parseInt(newMaxUnits),
      rate_per_unit: parseFloat(newRate)
    };
    try {
      await axios.post(`${API_BASE}/rates`, rateData);
      setNewTierName(''); setNewMinUnits(''); setNewMaxUnits(''); setNewRate('');
      setShowRateForm(false);
      if (user) fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      console.warn('Backend unavailable, adding rate locally.');
      const mockRate = { ...rateData, rate_id: Date.now() };
      setRates([...rates, mockRate]);
      setNewTierName(''); setNewMinUnits(''); setNewMaxUnits(''); setNewRate('');
      setShowRateForm(false);
    }
  };

  const handleDeleteRate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rate tier?')) return;
    try {
      await axios.delete(`${API_BASE}/rates/${id}`);
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      console.warn('Backend unavailable, deleting rate locally.');
      setRates(rates.filter(r => r.rate_id !== id));
    }
  };

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    const rateData = {
      tier_name: newTierName,
      minimum_units: parseInt(newMinUnits),
      maximum_units: parseInt(newMaxUnits),
      rate_per_unit: parseFloat(newRate)
    };
    try {
      await axios.put(`${API_BASE}/rates/${editingRate.rate_id}`, rateData);
      setEditingRate(null);
      setNewTierName(''); setNewMinUnits(''); setNewMaxUnits(''); setNewRate('');
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`âš ï¸ FAILED TO SAVE TO SERVER: ${errorMsg}\n\nYour changes are only temporary and will be lost on refresh because you are currently in OFFLINE MOCK MODE.`);
      setRates(rates.map(r => r.rate_id === editingRate.rate_id ? { ...r, ...rateData } : r));
      setEditingRate(null);
      setNewTierName(''); setNewMinUnits(''); setNewMaxUnits(''); setNewRate('');
    }
  };

  const startEditCustomer = (c) => {
    setEditingCustomer(c);
    setEditFirstName(c.first_name);
    setEditLastName(c.last_name);
    setEditAddress(c.address);
    setEditDistrict(c.district);
    setEditPhone(c.phone_number || '');
    setEditEmail(c.email || '');
  };

  const startEditRate = (r) => {
    setEditingRate(r);
    setNewTierName(r.tier_name);
    setNewMinUnits(r.minimum_units);
    setNewMaxUnits(r.maximum_units);
    setNewRate(r.rate_per_unit);
    setShowRateForm(true);
  };

  const handlePrint = (bill) => {
    setBillToPrint(bill);
    setTimeout(() => {
      window.print();
      setTimeout(() => setBillToPrint(null), 1000);
    }, 100);
  };

  const handleManualUsage = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !manualUsage.units) return;
    try {
      const res = await axios.post(`${API_BASE}/usage`, {
        account_number: selectedCustomer,
        billing_month: manualUsage.month,
        reading_date: manualUsage.date,
        units_used: parseInt(manualUsage.units)
      });
      setUsageMsg(res.data.message || 'Usage recorded and bill generated!');
      setTimeout(() => setUsageMsg(''), 5000);
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      alert(`Failed to record usage: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const custData = {
      username: newCustomer.username,
      password: newCustomer.password,
      first_name: newCustomer.first_name,
      last_name: newCustomer.last_name,
      email: newCustomer.email,
      address: newCustomer.address,
      district: newCustomer.district,
      phone: newCustomer.phone,
      customer_type: newCustomer.customer_type
    };
    try {
      await axios.post(`${API_BASE}/customers`, custData);
      setNewCustomer({ username: '', password: '', first_name: '', last_name: '', email: '', address: '', district: '', phone: '', customer_type: 'Residential' });
      alert('Customer added successfully!');
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      if (err.response) {
        alert(`Failed to add customer: ${err.response.data.error || err.message}`);
      } else {
        console.warn('Backend unavailable, adding customer locally.');
        const mockCust = {
          account_number: `WASCO-MOCK-${Math.floor(Math.random() * 1000)}`,
          first_name: custData.first_name,
          last_name: custData.last_name,
          customer_type: custData.customer_type,
          address: custData.address,
          district: custData.district
        };
        setCustomers([...customers, mockCust]);
        setNewCustomer({ username: '', password: '', first_name: '', last_name: '', email: '', address: '', district: '', phone: '', customer_type: 'Residential' });
      }
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    const custData = {
      first_name: editingCustomer.first_name,
      last_name: editingCustomer.last_name,
      email: editingCustomer.email,
      address: editingCustomer.address,
      district: editingCustomer.district,
      phone: editingCustomer.phone_number || editingCustomer.phone || '',
      customer_type: editingCustomer.customer_type
    };
    try {
      await axios.put(`${API_BASE}/customers/${editingCustomer.account_number}`, custData);
      setEditingCustomer(null);
      alert('Customer updated successfully!');
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      if (err.response) {
        alert(`Failed to update customer: ${err.response.data.error || err.message}`);
      } else {
        console.warn('Backend unavailable, updating customer locally.');
        setCustomers(customers.map(c => c.account_number === editingCustomer.account_number ? { ...c, ...editingCustomer } : c));
        setEditingCustomer(null);
      }
    }
  };

  const handleDeleteCustomer = async (account_number) => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also remove their user account.')) return;
    try {
      await axios.delete(`${API_BASE}/customers/${account_number}`);
      alert('Customer deleted successfully!');
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      if (err.response) {
        alert(`Failed to delete customer: ${err.response.data.error || err.message}`);
      } else {
        console.warn('Backend unavailable, deleting customer locally.');
        setCustomers(customers.filter(c => c.account_number !== account_number));
      }
    }
  };

  // --- VIEWS RENDERING ---

  if (view === 'landing') {
    return (
      <div className="landing-wrapper" style={{ background: 'var(--bg-color)', overflow: 'hidden' }}>
        <div className="bg-blobs">
          <div className="blob blob-1" style={{ width: '800px', height: '800px', opacity: 0.4 }}></div>
          <div className="blob blob-2" style={{ width: '600px', height: '600px', opacity: 0.3 }}></div>
          <div className="blob blob-3" style={{ width: '700px', height: '700px', opacity: 0.3 }}></div>
        </div>

        <div className="landing-content" style={{ padding: '0 5vw', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }}>
          <div className="hero-text-side animate-in">
            <header style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.6rem', borderRadius: '14px', color: 'white', display: 'flex' }}>
                <Droplets size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em' }}>WASCO <span style={{ fontWeight: 400, opacity: 0.6 }}>Portal</span></h2>
            </header>

            <div className="hero-eyebrow" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '30px', height: '2px', background: 'var(--primary)' }}></div>
              LE SOTHO'S PREMIER WATER UTILITY
            </div>
            
            <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', lineHeight: 0.95, marginBottom: '2rem', letterSpacing: '-0.04em' }}>
              Purity in <span style={{ color: 'var(--primary)', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Drop</span>, Smart in Every Step.
            </h1>
            
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem' }}>
              Manage your utility accounts with Lesotho's most advanced digital platform. Real-time tracking, secure payments, and instant incident reporting at your fingertips.
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: '1.5rem' }}>
              <button className="btn btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: '18px', fontWeight: 700 }} onClick={() => setView('login')}>
                Enter Portal <ChevronRight size={20} />
              </button>
              <button className="btn" onClick={fetchPublicData} style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: '18px', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)', fontWeight: 600 }}>
                View Service Rates
              </button>
            </div>

            <div className="hero-stats" style={{ display: 'flex', gap: '3rem', marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
              <div><h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>100k+</h3><p style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Users</p></div>
              <div><h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>10</h3><p style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Districts Covered</p></div>
              <div><h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>24/7</h3><p style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support & Monitoring</p></div>
            </div>
          </div>

          <div className="hero-visual-side animate-in" style={{ animationDelay: '0.2s', position: 'relative' }}>
            <div className="glass-card" style={{ padding: '3rem', borderRadius: '40px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 40px 100px rgba(14,165,233,0.15)' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-20px', background: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 20px 40px rgba(16,185,129,0.3)', fontWeight: 700, fontSize: '0.9rem' }}>
                <Activity size={18} /> LIVE MONITORING ACTIVE
              </div>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Network Efficiency</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { label: 'Water Pressure', value: '98.4%', color: 'var(--primary)' },
                    { label: 'Network Stability', value: '99.9%', color: 'var(--secondary)' },
                    { label: 'Purification Level', value: '100%', color: 'var(--accent)' }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex-between mb-2">
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', opacity: 0.7 }}>{stat.label}</span>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: stat.color }}>{stat.value}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: stat.value, background: stat.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div className="flex-between mb-4">
                  <h4 style={{ fontSize: '0.9rem' }}>Recent Incident Alerts</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>View Map â†’</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.6rem', borderRadius: '12px' }}><AlertTriangle size={18} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Pipe Maintenance - Maseru West</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Estimated resolution in 2 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={24} className="text-primary" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>M-PESA ENABLED</div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Instant Bill Pay</div>
              </div>
            </div>
          </div>
        </div>

        <footer style={{ position: 'absolute', bottom: '2rem', left: '5vw', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          Â© 2026 Water and Sewerage Company (WASCO) Â· Lesotho Private Sector Platform
        </footer>
      </div>
    );
  }
  if (view === 'login') {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="bg-blobs">
          <div className="blob blob-1" style={{ opacity: 0.6 }}></div>
          <div className="blob blob-2" style={{ opacity: 0.4 }}></div>
          <div className="blob blob-3" style={{ opacity: 0.5 }}></div>
        </div>

        <div className="glass-card animate-in" style={{ width: '100%', maxWidth: '440px', padding: '3.5rem', borderRadius: '32px', background: 'rgba(255,255,255,0.5)', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '24px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 1.5rem', boxShadow: '0 15px 35px var(--primary-glow)',
              transform: 'rotate(-5deg)'
            }}>
              <Droplets size={38} color="white" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome Back</h2>
            <p className="text-muted" style={{ fontSize: '1rem' }}>Enter your credentials to access your WASCO workspace</p>
          </div>

          {loginError && (
            <div style={{ 
              color: 'var(--error)', marginBottom: '1.5rem', fontWeight: 600, 
              padding: '0.8rem 1.2rem', background: 'rgba(239,68,68,0.08)', 
              borderRadius: '14px', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.1)' 
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Username</label>
              <input type="text" placeholder="e.g. john_doe" value={username} onChange={e => setUsername(e.target.value)} required className="input-field" style={{ height: '56px', borderRadius: '16px', fontSize: '1rem' }} />
            </div>
            <div className="input-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <input type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" style={{ height: '56px', borderRadius: '16px', fontSize: '1rem' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '56px', fontSize: '1.1rem', borderRadius: '16px', marginTop: '1rem', fontWeight: 700 }}>
              Sign In <ChevronRight size={20} />
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <p className="text-muted small">Don't have an account yet?</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button onClick={() => setView('register')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>Create Account</button>
              <button onClick={fetchPublicData} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Public Rates</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="app-container" style={{ maxWidth: '560px', margin: '4vh auto' }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="glass-card">
          <div className="text-center mb-6">
            <UserPlus size={48} className="logo-icon mb-4" style={{ margin: '0 auto 1rem' }} />
            <h2>Customer Registration</h2>
            <p className="text-muted">Create an account to manage your water bills</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Row 1: Username + Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Desired Username</label>
                <input type="text" placeholder="e.g. john_doe" value={username} onChange={e => setUsername(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Password</label>
                <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
              </div>
            </div>

            {/* Row 2: First Name + Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>First Name</label>
                <input type="text" placeholder="First Name" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Last Name</label>
                <input type="text" placeholder="Last Name" value={regLastName} onChange={e => setRegLastName(e.target.value)} required className="input-field" />
              </div>
            </div>

            {/* Row 3: Email (full width) */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
              <input type="email" placeholder="e.g. john@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="input-field" />
            </div>

            {/* Row 4: Address (full width) */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Physical Address</label>
              <input type="text" placeholder="e.g. Plot 123, Maseru West" value={regAddress} onChange={e => setRegAddress(e.target.value)} required className="input-field" />
            </div>

            {/* Row 5: District + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>District</label>
                <input type="text" placeholder="e.g. Maseru" value={regDistrict} onChange={e => setRegDistrict(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Phone Number</label>
                <input type="text" placeholder="e.g. 5812 3456" value={regPhone} onChange={e => setRegPhone(e.target.value)} required className="input-field" />
              </div>
            </div>

            {/* Row 6: Account Category (full width) */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Account Category</label>
              <select value={regCustomerType} onChange={e => setRegCustomerType(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                <option value="Residential">ðŸ  Residential</option>
                <option value="Business">ðŸ¢ Business</option>
                <option value="Industrial">ðŸ­ Industrial</option>
              </select>
            </div>

            {registerError && <div style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.07)', borderRadius: '8px' }}>{registerError}</div>}
            {registerSuccess && <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 0.75rem', background: 'rgba(16,185,129,0.07)', borderRadius: '8px' }}>{registerSuccess}</div>}

            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '1rem', borderRadius: '12px', justifyContent: 'center', marginTop: '0.5rem' }}>
              Register Account
            </button>
          </form>

          <div className="text-center" style={{ marginTop: '1.25rem' }}>
            <button onClick={() => setView('login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>Already have an account? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</span></button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'public') {
    return (
      <div className="app-container" style={{ padding: '3rem 5vw' }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2" style={{ opacity: 0.3 }}></div>
          <div className="blob blob-3"></div>
        </div>
        
        <header className="flex-between mb-12 animate-in">
          <div className="logo">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.5rem', borderRadius: '12px', color: 'white', display: 'flex' }}>
              <Droplets size={24} />
            </div>
            <h1>WASCO <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Public Services</span></h1>
          </div>
          <button className="btn btn-primary" onClick={() => setView('login')} style={{ padding: '0.8rem 2rem', borderRadius: '14px', fontWeight: 700 }}>
            <User size={18} /> Access Portal
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card" style={{ padding: '2.5rem', borderLeft: '5px solid var(--primary)' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Our Commitment</h2>
            <p className="text-muted mb-8" style={{ fontSize: '1.1rem' }}>WASCO is dedicated to providing sustainable water and sewerage services to the nation of Lesotho, ensuring health, prosperity, and environmental integrity.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Droplets size={24} />
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>Potable Water</h4>
                <p className="small">High-quality piped water compliant with international standards.</p>
              </div>
              <div>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Activity size={24} />
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>Sanitation</h4>
                <p className="small">Efficient wastewater management for urban and peri-urban centers.</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', borderLeft: '5px solid var(--secondary)' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Current Billing Rates</h2>
            <p className="text-muted mb-6">Transparent pricing based on monthly consumption tiers. Rates are subject to periodic review by the LEWA.</p>
            
            <div className="table-container" style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.3)', borderRadius: '20px' }}>
              <table>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '1.25rem' }}>Service Category</th>
                    <th>Usage (Units)</th>
                    <th className="text-right" style={{ paddingRight: '1.5rem' }}>Rate (LSL)</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(r => (
                    <tr key={r.rate_id}>
                      <td style={{ padding: '1.25rem' }}><strong>{r.tier_name}</strong></td>
                      <td>
                        <span className="badge primary" style={{ background: 'rgba(14, 165, 233, 0.05)', border: 'none' }}>
                          {r.minimum_units} - {r.maximum_units > 900000 ? 'Unlimited' : r.maximum_units}
                        </span>
                      </td>
                      <td className="text-right" style={{ paddingRight: '1.5rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{parseFloat(r.rate_per_unit).toFixed(2)}</span>
                        <span className="small text-muted" style={{ marginLeft: '4px' }}>/ unit</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="glass-card text-center p-12 animate-in" style={{ animationDelay: '0.2s', background: 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(99,102,241,0.05))' }}>
          <h2 style={{ marginBottom: '1rem' }}>Need Assistance?</h2>
          <p className="text-muted mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>Our dedicated support team is available to help you with any queries regarding your billing, service connections, or incident reporting.</p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="badge primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}><FileText size={18} /> Customer Care: 800 22 000</div>
            <div className="badge secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}><Bell size={18} /> Emergency Hotline: 5221 0000</div>
          </div>
        </div>
      </div>
    );
  }

  const filterBills = (billList) => {
    return billList.filter(b => {
      const matchesSearch = b.account_number.toLowerCase().includes(billSearch.toLowerCase()) ||
        b.billing_month.toLowerCase().includes(billSearch.toLowerCase());
      const matchesStatus = billStatusFilter === 'All' || b.payment_status === billStatusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const displayedBills = view === 'customer' ? filterBills(bills.filter(b => b.account_number === user.account_number)) : filterBills(bills);

  const filteredCustomers = customers.filter(c =>
    (c.account_number || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.first_name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.last_name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.names || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Summative Aggregations for Manager
  const currentMonthUnits = usageReports.length > 0 ? (usageReports[0].total_units || usageReports[0].units_used || 0) : 0;
  const currentQuarterUnits = usageReports.slice(0, 3).reduce((acc, curr) => acc + (curr.total_units || curr.units_used || 0), 0);
  const currentYearUnits = usageReports.reduce((acc, curr) => acc + (curr.total_units || curr.units_used || 0), 0);

  const getUsageTrendsData = () => {
    if (!usageReports || usageReports.length === 0) return [];
    const grouped = {};
    const monthOrder = { 'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12 };
    
    usageReports.forEach(r => {
      let key = (r.billing_month || 'Unknown').trim();
      if (insightTimeframe === 'Daily' && r.reading_date) {
        key = new Date(r.reading_date).toLocaleDateString();
      } else if (insightTimeframe === 'Weekly' && r.reading_date) {
        const d = new Date(r.reading_date);
        const wk = new Date(d);
        wk.setDate(wk.getDate() - wk.getDay());
        key = `Wk ${wk.toISOString().split('T')[0]}`;
      } else if (insightTimeframe === 'Quarterly' && r.reading_date) {
        const d = new Date(r.reading_date);
        key = `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
      } else if (insightTimeframe === 'Yearly' && r.reading_date) {
        key = new Date(r.reading_date).getFullYear().toString();
      }
      grouped[key] = (grouped[key] || 0) + (r.units_used || 0);
    });

    return Object.keys(grouped).sort((a, b) => {
      const partsA = a.split(' ');
      const partsB = b.split(' ');
      if (partsA.length === 2 && monthOrder[partsA[0]]) {
        if (partsA[1] !== partsB[1]) return partsA[1] - partsB[1];
        return monthOrder[partsA[0]] - monthOrder[partsB[0]];
      }
      return a.localeCompare(b);
    }).map(k => ({ period: k, total_units: grouped[k] }));
  };

  const topNavJSX = (
    <header className="top-nav" style={{ margin: '0 0 2rem 0', maxWidth: '100%' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)', fontFamily: 'Outfit' }}>
          {activeTab === 'dashboard' ? 'Dashboard Overview' : 
           activeTab === 'users' ? 'Customer Management' : 
           activeTab === 'audit' ? 'System Audit Log' : 
           activeTab === 'intelligence' ? 'Network Intelligence' :
           activeTab === 'history' ? 'Billing History' : 
           activeTab === 'reports' ? 'Incident Reports' : 
           activeTab === 'rates' ? 'Rates & Billing' : 'Portal'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="search-box" style={{
          display: 'flex', alignItems: 'center', background: 'var(--surface-solid)',
          borderRadius: '16px', padding: '0.5rem 1.25rem', border: '1px solid var(--border-color)',
        }}>
          <Activity size={18} className="text-muted" style={{ marginRight: '10px' }} />
          <input
            type="text" placeholder="Search Account..." value={billSearch} onChange={e => setBillSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '180px', fontWeight: 500 }}
          />
        </div>

        {user.role?.toLowerCase() === 'customer' && (
          <div style={{ position: 'relative' }}>
            <button className="btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} style={{ background: 'var(--surface-solid)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
              <Bell size={20} />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="glass-card dropdown-panel animate-in" style={{
                position: 'absolute', top: '60px', right: '0', width: '360px', zIndex: 2000,
                padding: '1.5rem', maxHeight: '450px', overflowY: 'auto'
              }}>
                <div className="flex-between mb-3">
                  <h4 style={{ margin: 0 }}>Notifications</h4>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-muted small">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.notification_id}
                      onClick={() => {
                        if (!n.is_read) handleMarkRead(n.notification_id);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem',
                        background: n.is_read ? 'transparent' : 'rgba(14, 165, 233, 0.08)', borderRadius: '8px',
                        borderLeft: n.is_read ? 'none' : '3px solid var(--primary)', cursor: 'pointer'
                      }}
                    >
                      <p style={{ margin: '0', fontWeight: n.is_read ? 'normal' : '600', fontSize: '0.85rem' }}>{n.notification_type}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <button className="btn" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '0.5rem', borderRadius: '50%', border: 'none', boxShadow: '0 4px 10px var(--primary-glow)' }}>
            <User size={20} />
          </button>
          {showProfile && (
            <div className="glass-card dropdown-panel animate-in" style={{
              position: 'absolute', top: '60px', right: '0', width: '280px', zIndex: 2000, padding: '1.5rem',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.25rem' }}>{user.first_name ? `${user.first_name} ${user.last_name}` : user.role}</h4>
                <span className="badge primary" style={{ fontSize: '0.7rem' }}>{user.role}</span>
              </div>
              <button className="btn w-full" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <>
      <div className="app-layout">
      {/* TOAST SYSTEM */}
      <div className="toast-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`} style={{ 
            background: t.type === 'success' ? 'var(--success)' : 'var(--error)',
            color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {t.message}
          </div>
        ))}
      </div>

      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* CLASSIC SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Droplets size={32} className="logo-icon" />
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>WASCO</h1>
        </div>

        <div className="sidebar-content">
          <div className="nav-group-label">Core</div>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </div>

          {(view === 'admin' || view === 'manager') && (
            <>
              <div className="nav-group-label">Management</div>
              <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                <Users size={18} /> <span>Customers</span>
              </div>
              <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                <AlertTriangle size={18} /> <span>Incidents</span>
              </div>
            </>
          )}

          {view === 'admin' && (
            <>
              <div className="nav-divider"></div>
              <div className="nav-group-label">Administration</div>
              <div className={`nav-item ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')}>
                <Settings size={18} /> <span>Rates & Billing</span>
              </div>
              <div className={`nav-item ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
                <Activity size={18} /> <span>Manual Reading</span>
              </div>
              <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
                <FileText size={18} /> <span>Audit Log</span>
              </div>
            </>
          )}

          {view === 'manager' && (
            <>
              <div className="nav-divider"></div>
              <div className="nav-group-label">Analytics</div>
              <div className={`nav-item ${activeTab === 'intelligence' ? 'active' : ''}`} onClick={() => setActiveTab('intelligence')}>
                <Activity size={18} /> <span>Intelligence</span>
              </div>
            </>
          )}

          {view === 'customer' && (
            <>
              <div className="nav-group-label">Customer Portal</div>
              <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                <History size={18} /> <span>Billing History</span>
              </div>
              <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                <AlertTriangle size={18} /> <span>Report Leakage</span>
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="theme-switch-wrapper">
            <span className="theme-switch-label">Dark Mode</span>
            <div className="theme-switch" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}></div>
          </div>
          
          <button className="btn w-full" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', justifyContent: 'center' }}>
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {topNavJSX}

        {view === 'manager' && (
          <>
            {activeTab === 'dashboard' && (
              <>
                <div className="flex-between mb-6">
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {user.role?.toLowerCase() === 'admin' && (
                      <button className="btn" onClick={handleCalculateBills} disabled={loading} style={{ background: 'var(--surface-solid)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}><Settings size={16} /> Calculate Bills</button>
                    )}
                    {user.role?.toLowerCase() === 'admin' && (
                      <form onSubmit={handleBroadcast} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="input-field" placeholder="Broadcast message..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} style={{ padding: '0.45rem 1rem', width: '220px' }} />
                        <button type="submit" className="btn btn-primary" disabled={isBroadcasting} style={{ padding: '0.45rem 1rem' }}>{isBroadcasting ? 'Sending...' : 'Broadcast'}</button>
                      </form>
                    )}
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
                    <div className="flex-between mb-4">
                      <h4 className="small text-muted uppercase fw-700">Segmented Contribution</h4>
                      <div className="flex gap-2">
                        <button 
                          className={`btn small ${segmentMetric === 'total_units' ? 'btn-primary' : ''}`} 
                          onClick={() => setSegmentMetric('total_units')}
                          style={{ padding: '2px 8px', fontSize: '10px' }}
                        >Usage</button>
                        <button 
                          className={`btn small ${segmentMetric === 'total_revenue' ? 'btn-primary' : ''}`} 
                          onClick={() => setSegmentMetric('total_revenue')}
                          style={{ padding: '2px 8px', fontSize: '10px' }}
                        >Revenue</button>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie 
                          data={segmentData.map(d => ({ name: d.segment, value: d[segmentMetric] }))} 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value" 
                          nameKey="name" 
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {segmentData.map((entry, index) => (<Cell key={"cell-" + index} fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />))}
                        </Pie>
                        <Tooltip formatter={(value) => segmentMetric === 'total_revenue' ? `LSL ${parseFloat(value).toFixed(2)}` : `${value} kl`} />
                        <Legend verticalAlign="bottom" height={36}/>
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
                          <tr><td>Total Consumption</td><td>{currentMonthUnits} kl</td><td className="text-success">â†“ 4.2%</td><td><span className="badge success">Normal</span></td></tr>
                          <tr><td>Calculated Revenue</td><td>LSL {bills.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0).toFixed(2)}</td><td className="text-success">â†‘ 12.1%</td><td><span className="badge primary">Growing</span></td></tr>
                          <tr><td>Outstanding Balance</td><td>LSL {balances.reduce((acc, b) => acc + parseFloat(b.total_outstanding || 0), 0).toFixed(2)}</td><td className="text-error">â†‘ 5.3%</td><td><span className="badge warning">Action Required</span></td></tr>
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
                            {l.status !== 'Fixed' && user.role?.toLowerCase() === 'admin' ? (
                              <button className="btn btn-primary small" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')}>Mark as Resolved</button>
                            ) : l.status === 'Fixed' ? <span className="text-success"><Check size={16} /> Resolved</span> : <span className="text-muted italic small">In Progress</span>}
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

        {view === 'admin' && (
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

    {activeTab === 'manual' && (
      <div className="glass-card mb-6 animate-in">
        <div className="flex-between mb-6">
          <div>
            <h3 style={{ margin: 0 }}>Usage Recording System</h3>
            <p className="text-muted small">Record manual meter readings and auto-generate bills.</p>
          </div>
          <Activity className="text-primary" size={24} />
        </div>
        
        {usageMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid var(--success)' }}>
            <Check size={18} style={{ marginRight: '0.5rem' }} /> {usageMsg}
          </div>
        )}

        <form onSubmit={handleManualUsage} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="input-group">
            <label className="small text-muted mb-2 block fw-600">Select Customer Account</label>
            <select 
              className="input-field" 
              value={selectedCustomer || ''} 
              onChange={e => setSelectedCustomer(e.target.value)} 
              required
              style={{ height: '50px' }}
            >
              <option value="" disabled>-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.account_number} value={c.account_number}>
                  {c.account_number} - {c.first_name} {c.last_name} ({c.district})
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="small text-muted mb-2 block fw-600">Billing Period / Month</label>
            <input 
              className="input-field" 
              value={manualUsage.month} 
              onChange={e => setManualUsage({ ...manualUsage, month: e.target.value })} 
              placeholder="e.g. April 2026" 
              required 
              style={{ height: '50px' }}
            />
          </div>
          <div className="input-group">
            <label className="small text-muted mb-2 block fw-600">Meter Reading (kl)</label>
            <input 
              type="number" 
              className="input-field" 
              value={manualUsage.units} 
              onChange={e => setManualUsage({ ...manualUsage, units: e.target.value })} 
              placeholder="Enter units used" 
              required 
              style={{ height: '50px' }}
            />
          </div>
          <div className="input-group flex items-end">
            <button type="submit" className="btn btn-primary w-full" style={{ height: '50px' }}>
              Commit & Bill
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-surface-solid rounded-xl border border-dashed border-color">
          <h4 className="text-muted small uppercase mb-2">Instructions</h4>
          <ul className="text-muted small" style={{ paddingLeft: '1.2rem' }}>
            <li>Verify the account number before committing.</li>
            <li>Units should be in Kiloliters (kl).</li>
            <li>Committing will automatically generate a bill and notify the customer.</li>
          </ul>
        </div>
      </div>
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
                      {r.maximum_units > 9000 ? 'Unlimited Usage' : r.minimum_units + ' â€” ' + r.maximum_units + ' Units'}
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

{view === 'customer' && (
  <>
    {activeTab === 'dashboard' && (
      <div className="glass-card">
        <h2 className="mb-4">Welcome, {user.first_name}</h2>
        <div className="stats-grid mb-6">
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">{bills.filter(b => b.account_number === user.account_number && b.payment_status === 'Unpaid').length}</h3><p className="stat-label">Pending Bills</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--error)' }}><Wallet size={22} /></div>
          </div>
          <div className="glass-card flex-between">
            <div><h3 className="stat-value">LSL {balances.find(b => b.account_number === user.account_number)?.total_outstanding || '0.00'}</h3><p className="stat-label">Current Balance</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--primary)' }}><Activity size={22} /></div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'history' && (
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3>Billing & Payment History</h3>
          <History className="text-muted" size={20} />
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Month</th><th>Units (kl)</th><th>Amount (LSL)</th><th>Status</th><th className="text-right">Action</th></tr>
            </thead>
            <tbody>
              {bills.filter(b => b.account_number === user.account_number).map(b => (
                <tr key={b.bill_id}>
                  <td><strong>{b.billing_month}</strong></td>
                  <td>{b.units_used}</td>
                  <td className="fw-700">LSL {parseFloat(b.total_amount).toFixed(2)}</td>
                  <td><span className={`badge ${b.payment_status === 'Paid' ? 'success' : 'unpaid'}`}>{b.payment_status}</span></td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {b.payment_status !== 'Paid' && <button className="btn btn-primary small" onClick={() => setPayingBill(b)}>Pay Now</button>}
                      <button className="btn small" style={{ background: 'var(--surface-hover)' }} onClick={() => handlePrint(b)}><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {activeTab === 'reports' && (
      <div className="glass-card">
        <div className="flex-between mb-6">
          <h3>Report a Leakage or Incident</h3>
          <AlertTriangle className="text-warning" size={20} />
        </div>
        {leakageMsg && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontWeight: 600 }}>{leakageMsg}</div>}
        <form onSubmit={handleReportLeakage} className="grid grid-cols-1 gap-4">
          <div className="input-group">
            <label className="small text-muted mb-1 block">Physical Location / Landmark</label>
            <input className="input-field" placeholder="e.g. Near Plot 45, Maseru West" value={leakageLocation} onChange={e => setLeakageLocation(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="small text-muted mb-1 block">Description of Incident</label>
            <textarea className="input-field" style={{ minHeight: '120px' }} placeholder="Please describe the issue in detail..." value={leakageDesc} onChange={e => setLeakageDesc(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '50px' }}>Submit Report</button>
        </form>

        <div className="mt-8">
          <h4 className="mb-4">My Recent Reports</h4>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {myLeakages.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-muted">No reports filed yet.</td></tr>
                ) : (
                  myLeakages.map(l => (
                    <tr key={l.report_id || Math.random()}>
                      <td className="small">{new Date(l.report_date).toLocaleDateString()}</td>
                      <td>{l.location}</td>
                      <td><span className={`badge ${l.status === 'Fixed' ? 'success' : 'warning'}`}>{l.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </>
)}

</main>
</div>

{/* PAYMENT METHOD SELECTOR MODAL */}
{payingBill && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
    backdropFilter: 'blur(8px)', zIndex: 3000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
  }}>
    <div className="glass-card fadeIn" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
      <h2 className="text-center mb-2">Secure Payment</h2>
      <p className="text-center text-muted small mb-6">Settling bill for <strong>{payingBill.billing_month}</strong> â€” Amount: <strong>LSL {parseFloat(payingBill.total_amount).toFixed(2)}</strong></p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="mb-6">
        {[
          { id: 'M-Pesa', label: 'Vodacom M-Pesa', icon: 'ðŸ“±', color: '#e60000' },
          { id: 'EcoCash', label: 'Econet EcoCash', icon: 'ðŸ’Ž', color: '#0054a6' },
          { id: 'Bank Transfer', label: 'Standard Lesotho Bank', icon: 'ðŸ¦', color: '#0033a0' }
        ].map(method => (
          <div 
            key={method.id}
            onClick={() => setSelectedPayMethod(method.id)}
            style={{
              padding: '1.25rem', borderRadius: '16px', cursor: 'pointer',
              border: `2px solid ${selectedPayMethod === method.id ? method.color : 'rgba(0,0,0,0.05)'}`,
              background: selectedPayMethod === method.id ? `${method.color}08` : 'white',
              display: 'flex', alignItems: 'center', gap: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>{method.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: selectedPayMethod === method.id ? method.color : 'var(--text-main)' }}>{method.label}</div>
              <div className="small text-muted">Instant processing</div>
            </div>
            {selectedPayMethod === method.id && <Check size={20} style={{ color: method.color }} />}
          </div>
        ))}
      </div>

      <div className="flex-between gap-4">
        <button className="btn" style={{ flex: 1, justifyContent: 'center', background: 'rgba(0,0,0,0.05)' }} onClick={() => setPayingBill(null)}>Cancel</button>
        <button 
          className="btn btn-primary" 
          style={{ flex: 2, justifyContent: 'center', height: '50px', fontSize: '1rem' }}
          onClick={() => handlePay(payingBill.bill_id, payingBill.account_number, payingBill.billing_month, payingBill.total_amount, selectedPayMethod)}
        >
          Confirm LSL {parseFloat(payingBill.total_amount).toFixed(2)}
        </button>
      </div>
      <p className="text-center small text-muted mt-6" style={{ fontSize: '0.7rem' }}>
        <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        Payments are simulated for demonstration purposes.
      </p>
    </div>
  </div>
)}

{/* Printable Bill Component */}
{billToPrint && (
  <div className="bill-print-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'white', padding: '2rem' }}>
    <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
      <Droplets size={48} style={{ color: '#0ea5e9', marginBottom: '0.5rem' }} />
      <h1 style={{ margin: 0, fontSize: '2rem' }}>WASCO OFFICIAL BILL</h1>
      <p className="text-muted">Water and Sewerage Company (PTY) LTD</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
      <div>
        <h3>Customer Details</h3>
        <p><strong>Account Number:</strong> {billToPrint.account_number}</p>
        <p><strong>Billing Month:</strong> {billToPrint.billing_month}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <h3>Bill Summary</h3>
        <p><strong>Status:</strong> {billToPrint.payment_status}</p>
        <p><strong>Due Date:</strong> {new Date(billToPrint.due_date).toLocaleDateString()}</p>
      </div>
    </div>
    <table style={{ width: '100%', marginBottom: '2rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ddd' }}>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Description</th>
          <th style={{ textAlign: 'right', padding: '0.5rem' }}>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '0.5rem' }}>Water Consumption</td>
          <td style={{ textAlign: 'right', padding: '0.5rem' }}>{billToPrint.units_used} Units</td>
        </tr>
        <tr style={{ fontWeight: 'bold', fontSize: '1.25rem', borderTop: '2px solid #000' }}>
          <td style={{ padding: '1rem 0.5rem' }}>TOTAL AMOUNT DUE</td>
          <td style={{ textAlign: 'right', padding: '1rem 0.5rem' }}>LSL {parseFloat(billToPrint.total_amount).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div style={{ marginTop: '4rem', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
      <p>This is a computer generated bill and does not require a signature.</p>
      <p>Please pay by the due date to avoid service interruption.</p>
    </div>
  </div>
)}
    </>
  );
}
