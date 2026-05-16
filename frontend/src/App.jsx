import { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplets, Activity, Wallet, CreditCard, ChevronRight, User, LogOut, AlertTriangle, BarChart as BarChartIcon, FileText, Settings, Users, History, UserPlus, Bell, Check, Sun, Moon, LayoutDashboard, Eye, EyeOff, Fingerprint, Loader2 } from 'lucide-react';
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

  // Landing Page Interactive States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [liveStats, setLiveStats] = useState({ pressure: 98.4, stability: 99.9, purity: 100.0 });
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const heroWords = ['Drop', 'Stream', 'Flow', 'Connection'];

  useEffect(() => {
    if (view !== 'landing') return;
    
    // Live mock data fluctuation
    const interval = setInterval(() => {
      setLiveStats({
        pressure: 98.0 + Math.random(),
        stability: 99.8 + (Math.random() * 0.2),
        purity: 100.0 // never changes
      });
    }, 2000);

    // Hero word cycler
    const wordInterval = setInterval(() => {
      setHeroWordIndex(prev => (prev + 1) % heroWords.length);
    }, 3000);

    return () => { clearInterval(interval); clearInterval(wordInterval); };
  }, [view]);

  const handleMouseMove = (e) => {
    if (view === 'landing') {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // max rotation 20deg
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      setMousePos({ x, y });
    }
  };

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  // Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricScan, setIsBiometricScan] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
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

  // Public Features State
  const [estimatedUsage, setEstimatedUsage] = useState(15);
  const [publicLeakageLoc, setPublicLeakageLoc] = useState('');
  const [publicLeakageDesc, setPublicLeakageDesc] = useState('');
  const [publicLeakageMsg, setPublicLeakageMsg] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);

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

  const calculateBill = (units, tierRates, customerType = 'Residential') => {
    if (!tierRates || tierRates.length === 0) return units * 5.50;
    
    // Try to find a type-specific rate first
    const specificRate = tierRates.find(r => 
      r.tier_name.toLowerCase() === (customerType || 'Residential').toLowerCase() ||
      (customerType?.toLowerCase() === 'residential' && r.tier_name === 'Tier 1') ||
      (customerType?.toLowerCase() === 'business' && r.tier_name === 'Tier 2') ||
      (customerType?.toLowerCase() === 'industrial' && r.tier_name === 'Tier 3')
    );

    if (specificRate) {
      return units * parseFloat(specificRate.rate_per_unit);
    }

    // Fallback to progressive tier calculation
    let remaining = units;
    let total = 0;
    const sortedTiers = [...tierRates].sort((a,b) => a.minimum_units - b.minimum_units);
    
    for (let r of sortedTiers) {
      if (remaining <= 0) break;
      const bandSize = (r.maximum_units || 999999) - r.minimum_units;
      const unitsInBand = Math.min(remaining, bandSize);
      total += unitsInBand * parseFloat(r.rate_per_unit);
      remaining -= unitsInBand;
    }
    return total;
  };

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
    if (e) e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsAuthenticating(true);
    addAuditLog('AUTH', `Login attempt initiated for: ${username || 'biometric'}`);
    
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
        const mockUser = MOCK_USERS[(username || '').toLowerCase()];
        if (mockUser) {
          setUser(mockUser);
          addAuditLog('AUTH', `Sandbox Session started for: ${username || 'mock'}`);
          navigateUser(mockUser);
        } else {
          setLoginError('Server unreachable. Try mock credentials (admin, manager).');
        }
      }
    } finally {
      setIsAuthenticating(false);
      setIsBiometricScan(false);
      setBiometricSuccess(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsBiometricScan(true);
    // Fake biometric scan delay
    setTimeout(() => {
      setBiometricSuccess(true);
      setTimeout(() => {
        // Automatically login as customer "wasco001" for demo purposes
        setUsername('wasco001');
        setPassword('password');
        handleLogin();
      }, 800);
    }, 2000);
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
      <div className="landing-wrapper landing-pro-bg" style={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        {/* Professional Ticker */}
        <div className="telemetry-ticker professional-ticker" style={{ height: '40px' }}>
          <div className="ticker-content" style={{ animationDuration: '80s' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex' }}>
                {[
                  { label: 'System Health', value: '100% Operational' },
                  { label: 'Supply Continuity', value: '99.98%' },
                  { label: 'Water Quality Index', value: 'WHO Standard Compliant' },
                  { label: 'Live Network Pressure', value: '82.4 PSI' },
                  { label: 'Conservation Impact', value: '42.5M Liters Saved' }
                ].map((item, j) => (
                  <div key={j} className="ticker-item" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{item.label}:</span> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pro Nav */}
        <nav className="pro-nav" style={{ position: 'sticky', top: '40px', padding: '1rem 8vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px', color: '#fff' }}>
              <Droplets size={24} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>WASCO</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <span className="text-muted small fw-600 cursor-pointer">SERVICES</span>
            <span className="text-muted small fw-600 cursor-pointer">IMPACT</span>
            <span className="text-muted small fw-600 cursor-pointer">SUPPORT</span>
            <button className="btn-enterprise" onClick={() => setView('login')}>LOG IN</button>
          </div>
        </nav>

        <div style={{ padding: '4rem 8vw', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '6rem', alignItems: 'center' }}>
          <div className="animate-in">
            <div className="stat-pill mb-6 inline-block">
              <span className="text-primary">●</span> TRUSTED BY 2M+ CITIZENS
            </div>
            <h1 className="hero-title-pro" style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '2rem' }}>
              Sustainable Water <br />
              <span style={{ color: 'var(--primary)' }}>Management</span> for a <br />
              Digital Future.
            </h1>
            <p className="text-muted mb-10" style={{ fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '600px' }}>
              Advanced utility infrastructure powered by real-time intelligence. 
              Join Lesotho's transition to smart, transparent, and eco-friendly water resource management.
            </p>

            <div className="flex gap-4">
              <button className="btn-enterprise" onClick={() => setView('login')} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                Access Portal
              </button>
              <button className="btn" onClick={fetchPublicData} style={{ borderRadius: '8px', padding: '1rem 2.5rem', fontWeight: 600 }}>
                Public Transparency
              </button>
            </div>

            <div className="mt-16 flex gap-12">
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>99.9%</div>
                <div className="text-muted small fw-600 uppercase">Availability</div>
              </div>
              <div style={{ width: '1px', background: '#e2e8f0' }}></div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>24/7</div>
                <div className="text-muted small fw-600 uppercase">Monitoring</div>
              </div>
              <div style={{ width: '1px', background: '#e2e8f0' }}></div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>WHO</div>
                <div className="text-muted small fw-600 uppercase">Certified</div>
              </div>
            </div>
          </div>

          <div className="animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="enterprise-card" style={{ position: 'relative', overflow: 'hidden', borderRadius: '32px' }}>
              <img 
                src={`file:///C:/Users/Lenovo/.gemini/antigravity/brain/6ba6f6ba-1169-4d9a-83aa-6905ebcce28c/modern_water_management_hero_1778964392394.png`}
                style={{ width: '100%', height: '550px', objectFit: 'cover' }}
                alt="Corporate Water Management"
              />
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="flex-between mb-4">
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' }}>National Grid Status</div>
                  <span className="badge success">OPTIMAL</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="metric-card">
                    <div className="small text-muted mb-1">Current Pressure</div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>84.2 PSI</div>
                  </div>
                  <div className="metric-card">
                    <div className="small text-muted mb-1">Active Leakages</div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--warning)' }}>03 Fixed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '6rem 8vw', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div className="text-center mb-16">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Enterprise Features</h2>
            <p className="text-muted">Designed for scale, security, and sustainability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Real-time Telemetry', desc: 'Monitor your consumption with precision down to the liter.', icon: <Activity size={32} /> },
              { title: 'Smart Conservation', desc: 'Receive insights and rewards for reducing your water footprint.', icon: <Droplets size={32} /> },
              { title: 'Predictive Billing', desc: 'No surprises. Our AI models predict your bill based on usage patterns.', icon: <LayoutDashboard size={32} /> }
            ].map((feature, i) => (
              <div key={i} className="enterprise-card p-8">
                <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (view === 'login') {
    return (
      <div className="landing-pro-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="enterprise-card animate-in" style={{ width: '100%', maxWidth: '480px', padding: '4rem', borderRadius: '40px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="text-center mb-12">
            <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '16px', borderRadius: '20px', color: '#fff', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)' }}>
              <Droplets size={40} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Portal Access</h1>
            <p className="text-muted">Enter your enterprise credentials to manage your utility infrastructure.</p>
          </div>

          {loginError && (
            <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
              <AlertTriangle size={18} /> {loginError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', background: '#f1f5f9', padding: '0.5rem', borderRadius: '16px' }}>
            <button 
              className={`flex-1 py-3 rounded-xl fw-700 transition-all ${!isBiometricScan ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              onClick={() => setIsBiometricScan(false)}
            >Secure Password</button>
            <button 
              className={`flex-1 py-3 rounded-xl fw-700 transition-all ${isBiometricScan ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              onClick={handleBiometricAuth}
            >Passkey Scan</button>
          </div>

          {!isBiometricScan ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="input-group">
                <label className="small fw-700 text-muted mb-2 block uppercase tracking-wider">Account Identity</label>
                <div className="relative">
                  <input className="input-field" style={{ height: '60px', paddingLeft: '3.5rem' }} placeholder="Username or Account ID" value={username} onChange={e => setUsername(e.target.value)} required />
                  <User size={20} className="text-muted" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="small fw-700 text-muted mb-2 block uppercase tracking-wider">Secure Password</label>
                <div className="relative">
                  <input className="input-field" type={showPassword ? "text" : "password"} style={{ height: '60px', paddingLeft: '3.5rem' }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  <ShieldCheck size={20} className="text-muted" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-enterprise w-full" style={{ height: '60px', fontSize: '1.1rem' }} disabled={isAuthenticating}>
                {isAuthenticating ? 'VERIFYING...' : 'SIGN IN TO PORTAL'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: biometricSuccess ? 'rgba(5, 150, 105, 0.1)' : 'rgba(37, 99, 235, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${biometricSuccess ? 'var(--success)' : 'var(--primary)'}`, marginBottom: '2rem' }}>
                <Fingerprint size={64} className={biometricSuccess ? 'text-success' : 'text-primary'} />
              </div>
              <p className="fw-700 text-slate-700 mb-8">{biometricSuccess ? 'Access Granted' : 'Awaiting Biometric Authentication...'}</p>
              <button className="btn" onClick={() => setIsBiometricScan(false)} style={{ background: '#f1f5f9' }}>Back to Password</button>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-muted small mb-4">Request assistance or public data</p>
            <div className="flex justify-center gap-6">
              <button className="text-primary fw-700 small" onClick={() => setView('register')}>Apply for Service</button>
              <button className="text-slate-500 fw-700 small" onClick={fetchPublicData}>Global Rates</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="app-container" style={{ maxWidth: '600px', margin: '4vh auto' }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div className="cyber-grid opacity-20"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div style={{ display: 'inline-flex', background: 'rgba(14,165,233,0.1)', padding: '1rem', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(14,165,233,0.2)' }}>
                <Fingerprint size={48} className="text-primary pulse-icon" />
              </div>
              <h2 className="font-mono">INITIALIZE CONNECTION</h2>
              <p className="text-muted small">Establish your identity within the WASCO network</p>
            </div>

            <div className="flex-between mb-8" style={{ background: 'var(--surface-hover)', borderRadius: '99px', padding: '0.25rem' }}>
              {[1, 2, 3].map(step => (
                <div key={step} onClick={() => setOnboardingStep(step)} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: '99px', background: onboardingStep === step ? 'var(--primary)' : 'transparent', color: onboardingStep === step ? '#fff' : 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s' }}>
                  STEP 0{step}
                </div>
              ))}
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {onboardingStep === 1 && (
                <div className="animate-in grid gap-4">
                  <div className="input-group">
                    <label className="font-mono small text-primary mb-2 block">NETWORK_ID (Username)</label>
                    <input type="text" placeholder="e.g. john_doe" value={username} onChange={e => setUsername(e.target.value)} required className="input-field font-mono" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div className="input-group">
                    <label className="font-mono small text-primary mb-2 block">ACCESS_KEY (Password)</label>
                    <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className="input-field font-mono" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <button type="button" onClick={() => setOnboardingStep(2)} className="btn btn-primary mt-4" style={{ height: '55px', fontFamily: 'monospace', letterSpacing: '2px' }}>PROCEED &gt;&gt;</button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="animate-in grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="font-mono small text-primary mb-2 block">FIRST_NAME</label>
                      <input type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} required className="input-field" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="input-group">
                      <label className="font-mono small text-primary mb-2 block">LAST_NAME</label>
                      <input type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} required className="input-field" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="font-mono small text-primary mb-2 block">COMMS_LINK (Email)</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="input-field" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div className="input-group">
                    <label className="font-mono small text-primary mb-2 block">COMMS_LINK_2 (Phone)</label>
                    <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} required className="input-field" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <button type="button" onClick={() => setOnboardingStep(3)} className="btn btn-primary mt-4" style={{ height: '55px', fontFamily: 'monospace', letterSpacing: '2px' }}>PROCEED &gt;&gt;</button>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="animate-in grid gap-4">
                  <div className="input-group">
                    <label className="font-mono small text-primary mb-2 block">GEOLOCATION_TAG (Address)</label>
                    <input type="text" placeholder="Plot 123..." value={regAddress} onChange={e => setRegAddress(e.target.value)} required className="input-field" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="font-mono small text-primary mb-2 block">ZONE (District)</label>
                      <input type="text" value={regDistrict} onChange={e => setRegDistrict(e.target.value)} required className="input-field" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="input-group">
                      <label className="font-mono small text-primary mb-2 block">CLASSIFICATION</label>
                      <select value={regCustomerType} onChange={e => setRegCustomerType(e.target.value)} className="input-field font-mono" style={{ height: '55px', background: 'rgba(0,0,0,0.2)' }}>
                        <option value="Residential">RESIDENTIAL</option>
                        <option value="Business">BUSINESS</option>
                        <option value="Industrial">INDUSTRIAL</option>
                      </select>
                    </div>
                  </div>
                  
                  {registerError && <div className="text-error font-mono text-center p-3" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{registerError}</div>}
                  {registerSuccess && <div className="text-success font-mono text-center p-3" style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>{registerSuccess}</div>}

                  <button type="submit" className="btn mt-4" style={{ height: '60px', background: 'var(--success)', color: '#000', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>ESTABLISH LINK</button>
                </div>
              )}
            </form>

            <div className="text-center mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setView('login')} className="font-mono text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
                [ ABORT_AND_RETURN_TO_LOGIN ]
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'public') {
    const calculateEstimatedBill = () => {
      return calculateBill(estimatedUsage, rates, 'Residential').toFixed(2);
    };

    return (
      <div className="app-container" style={{ padding: '3rem 5vw' }}>
        <div className="bg-blobs"><div className="blob blob-1"></div><div className="blob blob-3"></div></div>
        
        <header className="flex-between mb-12 animate-in glass-card" style={{ padding: '1rem 2rem', borderRadius: '100px' }}>
          <div className="logo flex items-center gap-3">
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', color: '#fff', boxShadow: '0 0 15px var(--primary)' }}>
              <Activity size={24} className="pulse-icon" />
            </div>
            <h2 className="font-mono m-0">WASCO_PUBLIC_NODE</h2>
          </div>
          <div className="flex gap-4">
            <button className="btn glass-btn font-mono" onClick={() => setView('register')}>[ REGISTER ]</button>
            <button className="btn btn-primary font-mono" onClick={() => setView('login')}>[ SECURE_LOGIN ]</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Bill Estimator */}
          <div className="glass-card hud-panel" style={{ borderTop: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div className="cyber-grid opacity-20"></div>
            <div className="relative z-10">
              <h3 className="font-mono mb-2 flex items-center gap-2"><BarChartIcon size={20} className="text-primary"/> PREDICTIVE_BILL_ESTIMATOR</h3>
              <p className="text-muted small mb-8">Calculate projected monthly water tariffs based on live WASCO utility rates.</p>
              
              <div className="mb-8">
                <div className="flex-between mb-4">
                  <span className="font-mono text-primary font-bold">PROJECTED_USAGE:</span>
                  <span className="font-mono text-2xl text-white">{estimatedUsage} <span className="text-sm text-muted">kl</span></span>
                </div>
                <input 
                  type="range" 
                  min="0" max="200" step="1" 
                  value={estimatedUsage} 
                  onChange={e => setEstimatedUsage(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div className="flex-between text-xs text-muted font-mono mt-2">
                  <span>0 kl</span><span>100 kl</span><span>200 kl</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), transparent)', border: '1px solid rgba(14,165,233,0.3)' }}>
                <div className="font-mono text-muted text-sm mb-2">ESTIMATED_MONTHLY_TARIFF</div>
                <div className="font-mono text-4xl fw-800 text-primary" style={{ textShadow: '0 0 20px rgba(14,165,233,0.5)' }}>LSL {calculateEstimatedBill()}</div>
              </div>
            </div>
          </div>

          {/* Service Map */}
          <div className="glass-card hud-panel" style={{ borderTop: '4px solid var(--success)', position: 'relative', overflow: 'hidden' }}>
            <div className="radar-sweep" style={{ opacity: 0.1, background: 'conic-gradient(from 0deg, transparent 70%, var(--success) 100%)' }}></div>
            <div className="relative z-10">
              <h3 className="font-mono mb-2 flex items-center gap-2"><Activity size={20} className="text-success"/> LIVE_NETWORK_STATUS</h3>
              <p className="text-muted small mb-8">Real-time telemetry of regional water distribution pressure grids.</p>
              
              <div className="grid gap-4">
                {['Maseru West', 'Leribe Central', 'Berea South', 'Mafeteng'].map((zone, i) => (
                  <div key={zone} className="flex-between p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', borderLeft: i === 0 ? '4px solid var(--warning)' : '4px solid var(--success)' }}>
                    <div className="font-mono font-bold text-white">{zone}</div>
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-xs text-muted text-right">
                        <div>PRESSURE: {i === 0 ? '72%' : '98%'}</div>
                        <div>PURITY: 99.9%</div>
                      </div>
                      <span className={`badge font-mono ${i === 0 ? 'warning' : 'success'}`}>{i === 0 ? 'MAINTENANCE' : 'OPTIMAL'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Anonymous Incident Reporter */}
        <div className="glass-card hud-panel animate-in" style={{ animationDelay: '0.2s', borderTop: '4px solid var(--error)', position: 'relative', overflow: 'hidden' }}>
           <div className="warning-stripe" style={{ opacity: 0.2 }}></div>
           <div className="relative z-10 max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-full mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
                <AlertTriangle size={32} className="pulse-icon" />
              </div>
              <h3 className="font-mono mb-2">ANONYMOUS_FAULT_REPORTER</h3>
              <p className="text-muted small mb-8">Report burst pipes, massive leakages, or contaminated water directly to the regional command center without an account.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); setPublicLeakageMsg('INCIDENT LOGGED IN COMMAND CENTER. DISPATCH PENDING.'); setTimeout(() => setPublicLeakageMsg(''), 4000); }} className="text-left grid gap-4">
                <div className="input-group">
                  <label className="font-mono small text-error mb-2 block">GEOLOCATION_COORDINATES (Location Address)</label>
                  <input type="text" value={publicLeakageLoc} onChange={e => setPublicLeakageLoc(e.target.value)} required placeholder="e.g. Near Pioneer Mall intersection" className="input-field font-mono" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)' }} />
                </div>
                <div className="input-group">
                  <label className="font-mono small text-error mb-2 block">VISUAL_ANALYSIS (Description)</label>
                  <textarea value={publicLeakageDesc} onChange={e => setPublicLeakageDesc(e.target.value)} required placeholder="Describe the severity of the fault..." className="input-field font-mono" rows="3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)' }}></textarea>
                </div>
                
                {publicLeakageMsg && <div className="p-3 text-center font-mono text-error font-bold" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{publicLeakageMsg}</div>}
                
                <button type="submit" className="btn w-full mt-2 font-mono text-xl" style={{ height: '60px', background: 'var(--error)', color: '#fff', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>[ TRANSMIT_ALERT ]</button>
              </form>
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
           activeTab === 'green' ? 'Green Impact Module' :
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
                  <ShieldCheck size={18} /> <span>Control Center</span>
                </div>
                <div className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
                  <Cpu size={18} /> <span>Asset Health</span>
                </div>
                <div className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                  <Users size={18} /> <span>Account Management</span>
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
              <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={18} /> <span>Executive Overview</span>
              </div>
              <div className={`nav-item ${activeTab === 'green' ? 'active' : ''}`} onClick={() => setActiveTab('green')}>
                <Leaf size={18} /> <span>Green Impact</span>
              </div>
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

        {(view === 'admin' || view === 'manager') && (
          <div className="animate-in">
            {activeTab === 'dashboard' && (
              <div className="animate-in">
                <div className="flex-between mb-8">
                  <div>
                    <h2 className="hero-title-pro" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Executive Control Center</h2>
                    <p className="text-muted">High-level operational overview of the national water distribution network.</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="btn" style={{ border: '1px solid #e2e8f0', background: '#fff' }}><FileText size={18} /> EXPORT_REPORTS</button>
                    <button className="btn-enterprise"><Activity size={18} /> LIVE_SYNC</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="enterprise-card p-6">
                    <div className="text-muted small fw-600 mb-2 uppercase">System Revenue (MTD)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>LSL 1.2M</div>
                    <div className="text-success small fw-700 mt-1">↑ 8.4% vs last period</div>
                  </div>
                  <div className="enterprise-card p-6">
                    <div className="text-muted small fw-600 mb-2 uppercase">Operational Efficiency</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>94.2%</div>
                    <div className="text-success small fw-700 mt-1">OPTIMAL RANGE</div>
                  </div>
                  <div className="enterprise-card p-6">
                    <div className="text-muted small fw-600 mb-2 uppercase">Active Incidents</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{leakages.filter(l => l.status !== 'Fixed').length}</div>
                    <div className="text-warning small fw-700 mt-1">3 DISPATCHED</div>
                  </div>
                  <div className="enterprise-card p-6">
                    <div className="text-muted small fw-600 mb-2 uppercase">Grid Stability</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>99.98%</div>
                    <div className="text-success small fw-700 mt-1">HIGH_STABILITY</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="enterprise-card p-8">
                    <h3 style={{ marginBottom: '1.5rem' }}>Regional Performance Matrix</h3>
                    <div className="space-y-6">
                      {['Maseru East', 'Leribe North', 'Berea Central', 'Mafeteng South'].map((region, i) => (
                        <div key={region}>
                          <div className="flex-between mb-2">
                            <span className="small fw-700">{region}</span>
                            <span className="small text-muted">{[85, 92, 78, 64][i]}% Load</span>
                          </div>
                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: [85, 92, 78, 64][i] + '%', height: '100%', background: 'var(--primary)' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="enterprise-card p-8">
                    <h3 style={{ marginBottom: '1.5rem' }}>System Health Log</h3>
                    <div className="space-y-4">
                      {[
                        { msg: 'Pressure Delta detected in Zone 4 (Maseru West)', type: 'warning' },
                        { msg: 'Monthly billing cycle batch #42 completed successfully', type: 'success' },
                        { msg: 'Maintenance required: Alpha Pump Station B2', type: 'error' }
                      ].map((log, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${log.type === 'error' ? 'bg-red-50 border-red-100' : log.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                          <div className="flex gap-3 items-center">
                            <div style={{ color: `var(--${log.type})` }}>
                              {log.type === 'error' ? <AlertTriangle size={18} /> : log.type === 'warning' ? <Activity size={18} /> : <ShieldCheck size={18} />}
                            </div>
                            <span className={`small fw-600 ${log.type === 'error' ? 'text-red-700' : log.type === 'warning' ? 'text-amber-700' : 'text-emerald-700'}`}>{log.msg}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="enterprise-card p-8">
                    <div className="flex-between mb-6">
                      <h3 style={{ margin: 0 }}>Usage Trends</h3>
                      <select className="input-field" value={insightTimeframe} onChange={(e) => setInsightTimeframe(e.target.value)} style={{ width: '120px', padding: '0.2rem' }}>
                        <option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getUsageTrendsData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="total_units" fill="var(--primary)" name="Units (kl)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="enterprise-card p-8">
                    <div className="flex-between mb-6">
                      <h3 style={{ margin: 0 }}>Segmented Contribution</h3>
                      <div className="flex gap-2">
                        <button className={`btn small ${segmentMetric === 'total_units' ? 'btn-enterprise' : ''}`} onClick={() => setSegmentMetric('total_units')} style={{ fontSize: '10px' }}>USAGE</button>
                        <button className={`btn small ${segmentMetric === 'total_revenue' ? 'btn-enterprise' : ''}`} onClick={() => setSegmentMetric('total_revenue')} style={{ fontSize: '10px' }}>REVENUE</button>
                      </div>
                    </div>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div className="text-muted small fw-700 uppercase">Total</div>
                        <div className="fw-800" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                          {segmentMetric === 'total_revenue' ? `LSL ${Math.round(segmentData.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0) / 1000)}k` : `${Math.round(segmentData.reduce((acc, curr) => acc + (curr.total_units || 0), 0) / 1000)}k kl`}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={segmentData.map(d => ({ name: d.segment, value: d[segmentMetric] }))} innerRadius={75} outerRadius={95} paddingAngle={8} dataKey="value" nameKey="name">
                            {segmentData.map((entry, index) => (<Cell key={"cell-" + index} fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} stroke="#fff" strokeWidth={2} />))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="animate-in">
                <div className="flex-between mb-8">
                  <div>
                    <h2 className="hero-title-pro" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Infrastructure Asset Health</h2>
                    <p className="text-muted">AI-driven predictive maintenance and asset lifecycle monitoring.</p>
                  </div>
                  <button className="btn-enterprise"><Settings size={18} /> SCHEDULE_AUDIT</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { name: 'Pump Station Alpha', health: 98.4, status: 'Optimal', type: 'low' },
                    { name: 'Main Line Sector 4', health: 72.1, status: 'Monitor', type: 'med' },
                    { name: 'Booster Pump B2', health: 42.8, status: 'Critical', type: 'high' }
                  ].map((asset, i) => (
                    <div key={i} className={`enterprise-card p-8 maintenance-${asset.type}`}>
                      <div className="flex-between mb-6">
                        <div className="text-muted small fw-800 uppercase tracking-widest">{asset.name}</div>
                        <span className="impact-badge" style={{ background: `var(--${asset.type === 'low' ? 'success' : asset.type === 'med' ? 'warning' : 'error'})` }}>{asset.status}</span>
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{asset.health}%</div>
                      <p className="text-muted small" style={{ margin: 0 }}>Predicted failure: {asset.type === 'high' ? 'Within 48h' : '6+ Months'}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 enterprise-card p-8">
                    <h3 style={{ marginBottom: '1.5rem' }}>Predictive Risk Map</h3>
                    <div style={{ height: '400px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="text-center">
                        <div className="text-primary opacity-20 mb-4"><Cpu size={64} /></div>
                        <p className="text-muted fw-600">Visualizing Infrastructure Grid Data...</p>
                        <span className="badge" style={{ background: '#e2e8f0' }}>MODELS_LOADING_92%</span>
                      </div>
                    </div>
                  </div>
                  <div className="enterprise-card p-8">
                    <h3 style={{ marginBottom: '1.5rem' }}>Maintenance Schedule</h3>
                    <div className="space-y-4">
                      {[
                        { item: 'Filter Flush', date: 'Tomorrow 09:00', loc: 'Maseru' },
                        { item: 'Valve Lubrication', date: 'Oct 22, 2026', loc: 'Leribe' },
                        { item: 'Sensor Calibration', date: 'Oct 25, 2026', loc: 'Berea' }
                      ].map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="fw-700 text-primary mb-1">{s.item}</div>
                          <div className="flex-between">
                            <span className="small text-muted">{s.date}</span>
                            <span className="small fw-600">{s.loc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn w-full mt-6" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', height: '50px' }}>VIEW FULL CALENDAR</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="glass-card intelligence-hud" style={{ borderLeft: '4px solid var(--secondary)', background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(99,102,241,0.15))', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div className="radar-sweep"></div>
                <div className="cyber-grid"></div>
                
                <div className="stat-header mb-6 relative z-10">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="pulse-icon" style={{ background: 'var(--secondary)', color: 'white', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 0 20px var(--secondary)' }}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)', margin: 0 }}>Projected Intelligence Grid</h3>
                      <p className="small text-muted" style={{ color: 'var(--secondary)' }}>Model v4.0.2 - Deep Learning Analysis</p>
                    </div>
                  </div>
                  <div className="badge" style={{ background: 'rgba(52,211,153,0.2)', color: 'var(--success)', border: '1px solid var(--success)', boxShadow: '0 0 10px var(--success)' }}>
                    <span className="dot-indicator bg-success mr-2"></span> PROACTIVE_MODE
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="hud-panel p-6 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(10px)' }}>
                    <h4 className="mb-4 small uppercase" style={{ color: 'var(--secondary)', letterSpacing: '0.1em' }}>Dist. Risk Heatmap</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { district: 'Maseru', risk: 'Critical', score: 82, color: 'var(--error)' },
                        { district: 'Leribe', risk: 'Elevated', score: 45, color: 'var(--warning)' },
                        { district: 'Berea', risk: 'Nominal', score: 18, color: 'var(--success)' },
                        { district: 'Mafeteng', risk: 'Nominal', score: 12, color: 'var(--primary)' }
                      ].map(d => (
                        <div key={d.district} className="group">
                          <div className="flex-between mb-2">
                            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{d.district}</span>
                            <span className="badge font-mono" style={{ background: d.color + '20', color: d.color, border: `1px solid ${d.color}50` }}>{d.risk}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: d.score + '%', height: '100%', background: d.color, boxShadow: `0 0 10px ${d.color}`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="hud-panel p-6 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(239,68,68,0.4)', position: 'relative', overflow: 'hidden' }}>
                    <div className="warning-stripe"></div>
                    <h4 className="mb-2 uppercase" style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} className="animate-pulse" /> Anomalous AI Detection
                    </h4>
                    <p className="small mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>Neural network identified pressure variance delta of 14.2%.</p>
                    
                    <div style={{ padding: '1.5rem', background: 'linear-gradient(45deg, rgba(239,68,68,0.2), transparent)', borderLeft: '4px solid var(--error)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', textShadow: '0 0 10px var(--error)', marginBottom: '0.5rem' }}>
                        BURST PREDICTION: MASERU WEST
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                        <strong className="text-error">92.4% CONFIDENCE</strong> of subterranean structural failure near Plot 552. Immediate dispatch recommended.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-muted text-xs mb-1">Integ. Score</div>
                        <div className="text-white text-lg">76.0%</div>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-muted text-xs mb-1">Sensor Conf.</div>
                        <div className="text-white text-lg">99.8%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="enterprise-card p-8">
                <div className="flex-between mb-8">
                  <div>
                    <h3 style={{ fontSize: '1.5rem' }}>Account Management Terminal</h3>
                    <p className="text-muted">Direct control and monitoring of system identities.</p>
                  </div>
                  <div className="search-box">
                    <input type="text" placeholder="Identity Search..." className="input-field" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} style={{ width: '300px' }} />
                  </div>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Reference</th><th>Identity</th><th>Classification</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.account_number}>
                          <td className="font-mono small fw-700">#{c.account_number}</td>
                          <td className="fw-700">{c.first_name} {c.last_name}</td>
                          <td><span className="badge">{c.customer_type}</span></td>
                          <td><span className="badge success">ACTIVE</span></td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn small" onClick={() => setEditingCustomer(c)}><Settings size={14} /></button>
                              <button className="btn small text-error" onClick={() => handleDeleteCustomer(c.account_number)}><LogOut size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Onboarding Form */}
                <div className="mt-12 p-8 rounded-3xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 className="mb-6 flex items-center gap-3">
                    <UserPlus size={20} className="text-primary" />
                    {editingCustomer ? 'Modify Identity: ' + editingCustomer.account_number : 'Onboard New Identity'}
                  </h4>
                  <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input className="input-field" placeholder="First Name" value={editingCustomer ? editingCustomer.first_name : newCustomer.first_name} onChange={e => editingCustomer ? setEditingCustomer({...editingCustomer, first_name: e.target.value}) : setNewCustomer({...newCustomer, first_name: e.target.value})} required />
                    <input className="input-field" placeholder="Last Name" value={editingCustomer ? editingCustomer.last_name : newCustomer.last_name} onChange={e => editingCustomer ? setEditingCustomer({...editingCustomer, last_name: e.target.value}) : setNewCustomer({...newCustomer, last_name: e.target.value})} required />
                    <input className="input-field" placeholder="Email" value={editingCustomer ? editingCustomer.email : newCustomer.email} onChange={e => editingCustomer ? setEditingCustomer({...editingCustomer, email: e.target.value}) : setNewCustomer({...newCustomer, email: e.target.value})} required />
                    <select className="input-field" value={editingCustomer ? editingCustomer.customer_type : newCustomer.customer_type} onChange={e => editingCustomer ? setEditingCustomer({...editingCustomer, customer_type: e.target.value}) : setNewCustomer({...newCustomer, customer_type: e.target.value})}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                    <input className="input-field" style={{ gridColumn: 'span 2' }} placeholder="Physical Address" value={editingCustomer ? editingCustomer.address : newCustomer.address} onChange={e => editingCustomer ? setEditingCustomer({...editingCustomer, address: e.target.value}) : setNewCustomer({...newCustomer, address: e.target.value})} required />
                    {!editingCustomer && (
                      <>
                        <input className="input-field" placeholder="Username" value={newCustomer.username} onChange={e => setNewCustomer({...newCustomer, username: e.target.value})} required />
                        <input className="input-field" type="password" placeholder="Password" value={newCustomer.password} onChange={e => setNewCustomer({...newCustomer, password: e.target.value})} required />
                      </>
                    )}
                    <button type="submit" className="btn-enterprise w-full" style={{ gridColumn: 'span 2', height: '55px' }}>
                      {editingCustomer ? 'COMMIT_IDENTITY_OVERRIDES' : 'INITIALIZE_ONBOARDING'}
                    </button>
                    {editingCustomer && <button type="button" className="btn w-full mt-2" onClick={() => setEditingCustomer(null)} style={{ gridColumn: 'span 2', background: 'transparent', border: 'none', color: 'var(--error)' }}>ABORT_MODIFICATION</button>}
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="enterprise-card p-8">
                <div className="flex-between mb-8">
                  <div>
                    <h3 style={{ fontSize: '1.5rem' }}>Incident Command</h3>
                    <p className="text-muted">Real-time fault monitoring and resource dispatch.</p>
                  </div>
                  <div className="impact-badge" style={{ background: 'var(--warning)' }}>{leakages.filter(l => l.status !== 'Fixed').length} ACTIVE_FAULTS</div>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Timestamp</th><th>Geographic Location</th><th>Status</th><th>Response</th></tr></thead>
                    <tbody>
                      {leakages.map(l => (
                        <tr key={l.report_id}>
                          <td className="font-mono">#L-{l.report_id}</td>
                          <td className="small text-muted">{new Date(l.report_date).toLocaleString()}</td>
                          <td className="fw-600">{l.location}</td>
                          <td><span className={`badge ${l.status === 'Fixed' ? 'success' : 'warning'}`}>{l.status}</span></td>
                          <td>
                            {l.status !== 'Fixed' && user.role?.toLowerCase() === 'admin' && (
                              <button className="btn-enterprise small" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')}>Dispatch Team</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'rates' && view === 'admin' && (
              <div className="animate-in">
                <div className="flex-between mb-8">
                  <div>
                    <h2 className="hero-title-pro" style={{ fontSize: '2.2rem' }}>Tariff Configuration</h2>
                    <p className="text-muted">Economic model for revenue extraction and usage tiers.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {rates.slice(0, 3).map(r => (
                    <div key={r.rate_id} className="enterprise-card p-8">
                      <div className="text-muted small fw-800 mb-2 uppercase">{r.tier_name}</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>LSL {parseFloat(r.rate_per_unit).toFixed(2)}</div>
                      <div className="flex-between mt-4">
                         <span className="small text-muted">{r.minimum_units} - {r.maximum_units > 9000 ? '∞' : r.maximum_units} kl</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="enterprise-card p-8">
                  <h3 style={{ marginBottom: '2rem' }}>Global Rate Grid</h3>
                  <div className="table-container mb-12">
                    <table className="data-table">
                      <thead><tr><th>Tier</th><th>Operational Bounds</th><th>Rate Multiplier</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {rates.map(r => (
                          <tr key={r.rate_id}>
                            <td><span className="fw-700">{r.tier_name}</span></td>
                            <td><span className="badge" style={{ background: '#f1f5f9' }}>{r.minimum_units} kl — {r.maximum_units > 9000 ? 'MAX' : r.maximum_units + ' kl'}</span></td>
                            <td><span className="fw-800 text-primary">LSL {parseFloat(r.rate_per_unit).toFixed(2)}</span></td>
                            <td className="text-right">
                              <button className="btn" onClick={() => startEditRate(r)}><Settings size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-8 rounded-3xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h4 className="mb-6">{editingRate ? 'Modify Tier: ' + editingRate.tier_name : 'Initialize New Billing Tier'}</h4>
                    <form onSubmit={editingRate ? handleUpdateRate : handleAddRate} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <input className="input-field" placeholder="Tier Name" value={newTierName} onChange={e => setNewTierName(e.target.value)} required />
                      <input type="number" className="input-field" placeholder="Min Units" value={newMinUnits} onChange={e => setNewMinUnits(e.target.value)} required />
                      <input type="number" className="input-field" placeholder="Max Units" value={newMaxUnits} onChange={e => setNewMaxUnits(e.target.value)} required />
                      <input type="number" step="0.01" className="input-field" placeholder="Rate" value={newRate} onChange={e => setNewRate(e.target.value)} required />
                      <button type="submit" className="btn-enterprise w-full" style={{ gridColumn: 'span 4', height: '55px' }}>{editingRate ? 'COMMIT_TIER_OVERRIDES' : 'DEPLOY_NEW_BILLING_TIER'}</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manual' && view === 'admin' && (
              <div className="animate-in">
                <div className="flex-between mb-8">
                  <div>
                    <h2 className="hero-title-pro" style={{ fontSize: '2.2rem' }}>Manual Telemetry Recording</h2>
                    <p className="text-muted">Direct input station for localized meter readings.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="lg:col-span-2 enterprise-card p-8">
                    <h3>Entry Terminal</h3>
                    {usageMsg && <div className="p-4 rounded-xl mb-6 bg-emerald-50 text-emerald-700 fw-700">{usageMsg}</div>}
                    <form onSubmit={handleManualUsage} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <select className="input-field" value={selectedCustomer || ''} onChange={e => setSelectedCustomer(e.target.value)} required style={{ height: '60px' }}>
                        <option value="" disabled>-- SEARCH ACCOUNTS --</option>
                        {customers.map(c => (
                          <option key={c.account_number} value={c.account_number}>{c.account_number} - {c.first_name} {c.last_name}</option>
                        ))}
                      </select>
                      <input className="input-field" placeholder="Billing Cycle (e.g. Oct 2026)" value={manualUsage.month} onChange={e => setManualUsage({...manualUsage, month: e.target.value})} required style={{ height: '60px' }} />
                      <input type="number" className="input-field" style={{ gridColumn: 'span 2', height: '60px', fontSize: '1.5rem' }} placeholder="Meter Delta (kl)" value={manualUsage.units} onChange={e => setManualUsage({...manualUsage, units: e.target.value})} required />
                      <button type="submit" className="btn-enterprise w-full" style={{ gridColumn: 'span 2', height: '60px' }}>COMMIT TELEMETRY RECORD</button>
                    </form>
                  </div>
                  <div className="enterprise-card p-8">
                    <h3>Real-time Valuation</h3>
                    <div className="p-6 rounded-2xl text-center mt-6" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div className="text-muted small fw-700 mb-2 uppercase">Estimated Invoice Total</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                        LSL {manualUsage.units ? (calculateBill(Number(manualUsage.units), rates, customers.find(c => c.account_number === selectedCustomer)?.customer_type || 'Residential')).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && view === 'admin' && (
              <div className="animate-in">
                <div className="glass-card mb-6" style={{ background: '#0c1a2e', color: '#00ff41', fontFamily: 'monospace', border: '1px solid #00ff41', padding: '1.5rem' }}>
                   <div className="flex-between mb-4 border-b border-emerald-900 pb-2">
                      <span className="fw-800">CORE_SYSTEM_AUDIT_LOG_V2.0</span>
                      <span className="badge" style={{ background: 'rgba(0,255,65,0.1)', color: '#00ff41' }}>LIVE_STREAM</span>
                   </div>
                   <div style={{ height: '200px', overflowY: 'auto', fontSize: '0.85rem' }}>
                      {forensicLogs.map(log => (
                        <div key={log.id} className="mb-1"><span style={{ opacity: 0.5 }}>[{log.time}]</span> <span style={{ color: log.type === 'SECURITY' ? '#ff3e3e' : '#0ea5e9' }}>{log.type}:</span> {log.msg}</div>
                      ))}
                   </div>
                </div>
                <div className="enterprise-card p-8">
                   <h3>Historical DB Audit Logs</h3>
                   <div className="table-container mt-6">
                      <table className="data-table">
                         <thead><tr><th>Timestamp</th><th>Identity</th><th>Action</th><th>Details</th></tr></thead>
                         <tbody>
                            {auditLogs.map(log => (
                              <tr key={log.id}>
                                <td className="small text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="fw-700">{log.performed_by}</td>
                                <td><span className="badge">{log.action}</span></td>
                                <td className="small text-muted">{log.details}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'customer' && (
          <div className="animate-in">
            {activeTab === 'dashboard' && (
              <div className="animate-in">
                <div className="flex-between mb-8">
                  <div>
                    <h2 className="hero-title-pro" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Welcome back, {user.first_name}</h2>
                    <p className="text-muted">Executive overview of your utility account and network status.</p>
                  </div>
                  <div className="stat-pill">
                    <span className="text-success">●</span> SESSION_SECURE
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="enterprise-card p-8" style={{ borderLeft: '4px solid var(--error)' }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '16px', color: 'var(--error)' }}>
                        <Wallet size={28} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Outstanding Balances</h3>
                        <p className="text-muted small">Immediate action required to maintain service.</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span style={{ fontSize: '3rem', fontWeight: 800, color: '#1e293b' }}>LSL {balances.find(b => b.account_number === user.account_number)?.total_outstanding || '0.00'}</span>
                    </div>
                    <div className="flex gap-4">
                      <button className="btn-enterprise" style={{ flex: 1 }} onClick={() => { setActiveTab('history'); addToast('Redirecting to secure gateway...', 'info'); }}>PAY NOW</button>
                      <button className="btn" style={{ flex: 1, border: '1px solid #e2e8f0' }} onClick={() => setActiveTab('history')}>VIEW BILLS</button>
                    </div>
                  </div>

                  <div className="enterprise-card p-8" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '16px', color: 'var(--primary)' }}>
                        <Activity size={28} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Smart Meter Telemetry</h3>
                        <p className="text-muted small">Live sync with District Grid Sector 02.</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span style={{ fontSize: '3rem', fontWeight: 800, color: '#1e293b' }}>12.4 <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>kl</span></span>
                      <span className="text-success small fw-700">↓ 12% vs last month</span>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div className="flex-between">
                        <span className="small fw-600 text-muted">Network Status</span>
                        <span className="badge success">OPTIMAL</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="enterprise-card p-8 mb-8">
                  <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'File Incident', icon: <AlertTriangle />, color: 'var(--warning)', tab: 'reports' },
                      { label: 'Green Impact', icon: <Leaf />, color: 'var(--accent)', tab: 'green' },
                      { label: 'Update Profile', icon: <Settings />, color: 'var(--primary)', tab: 'dashboard' },
                      { label: 'Support Ticket', icon: <ShieldCheck />, color: 'var(--secondary)', tab: 'reports' }
                    ].map((action, i) => (
                      <div key={i} className="p-6 rounded-2xl cursor-pointer hover:bg-slate-50 border border-slate-100 transition-all text-center" onClick={() => setActiveTab(action.tab)}>
                        <div style={{ color: action.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                          {React.cloneElement(action.icon, { size: 28 })}
                        </div>
                        <div className="fw-700 small uppercase tracking-wider">{action.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'green' && (
              <div className="animate-in">
                <div className="flex-between mb-8">
                  <div>
                    <h2 className="hero-title-pro" style={{ fontSize: '2.2rem' }}>Sustainability Portal</h2>
                    <p className="text-muted">Tracking your contribution to Lesotho's water conservation goals.</p>
                  </div>
                  <div className="impact-badge">LVL 4 CONSERVATOR</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="metric-card">
                    <div className="text-primary mb-2"><Droplets size={24} /></div>
                    <div className="text-muted small fw-600">Liters Saved</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>12,402 L</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-success mb-2"><Leaf size={24} /></div>
                    <div className="text-muted small fw-600">Green Points</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>2,450</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-secondary mb-2"><Users size={24} /></div>
                    <div className="text-muted small fw-600">Community Rank</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>Top 5%</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-warning mb-2"><Activity size={24} /></div>
                    <div className="text-muted small fw-600">Conservation Credit</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>LSL 45.00</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="enterprise-card p-8">
                    <h3 style={{ marginBottom: '1.5rem' }}>Consumption Benchmarking</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex-between mb-2">
                          <span className="small fw-600">Your Average Usage</span>
                          <span className="small text-muted">145 kl / month</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '40%', height: '100%', background: 'var(--primary)' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex-between mb-2">
                          <span className="small fw-600">Maseru District Average</span>
                          <span className="small text-muted">182 kl / month</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '60%', height: '100%', background: '#cbd5e1' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 p-6 rounded-2xl" style={{ background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                      <p className="small text-success fw-600" style={{ margin: 0 }}>
                        Awesome! You are consuming 20% less water than your neighborhood average. This qualifies you for the 'Eco-Saver' tariff next month!
                      </p>
                    </div>
                  </div>

                  <div className="enterprise-card p-8">
                    <h3 style={{ marginBottom: '1.5rem' }}>Personalized Tips</h3>
                    <div className="space-y-4">
                      {[
                        { tip: 'Fix dripping faucets promptly to save up to 20 liters a day.', icon: <Settings /> },
                        { tip: 'Install low-flow showerheads for a 30% reduction in water use.', icon: <Droplets /> },
                        { tip: 'Water your garden during early morning or late evening hours.', icon: <ShieldCheck /> }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                          <div style={{ color: 'var(--accent)' }}>{React.cloneElement(item.icon, { size: 20 })}</div>
                          <p className="small text-muted" style={{ margin: 0 }}>{item.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="enterprise-card p-8">
                <div className="flex-between mb-8">
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Billing & Payment History</h2>
                    <p className="text-muted">A comprehensive record of your utility invoices.</p>
                  </div>
                  <History className="text-muted" size={24} />
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Month</th><th>Units Used</th><th>Invoice Total</th><th>Payment Status</th><th className="text-right">Action</th></tr>
                    </thead>
                    <tbody>
                      {bills.filter(b => b.account_number === user.account_number).map(b => (
                        <tr key={b.bill_id}>
                          <td><span className="fw-700">{b.billing_month}</span></td>
                          <td>{b.units_used} kl</td>
                          <td><span className="fw-800">LSL {parseFloat(b.total_amount).toFixed(2)}</span></td>
                          <td><span className={`badge ${b.payment_status === 'Paid' ? 'success' : 'unpaid'}`}>{b.payment_status}</span></td>
                          <td className="text-right">
                            <div className="flex gap-2 justify-end">
                              {b.payment_status !== 'Paid' && <button className="btn-enterprise small" onClick={() => setPayingBill(b)}>Pay Now</button>}
                              <button className="btn small" onClick={() => handlePrint(b)}><FileText size={14} /></button>
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
              <div className="enterprise-card p-8">
                <div className="flex-between mb-8">
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Incident Reporting</h2>
                    <p className="text-muted">Report leaks or supply disruptions directly to dispatch.</p>
                  </div>
                  <AlertTriangle className="text-warning" size={24} />
                </div>
                {leakageMsg && <div className="p-4 rounded-xl mb-6 bg-emerald-50 text-emerald-700 fw-700">{leakageMsg}</div>}
                <form onSubmit={handleReportLeakage} className="grid grid-cols-1 gap-6 mb-12">
                  <input className="input-field" placeholder="Incident Location / Landmark" value={leakageLocation} onChange={e => setLeakageLocation(e.target.value)} required />
                  <textarea className="input-field" style={{ minHeight: '120px' }} placeholder="Detailed Description..." value={leakageDesc} onChange={e => setLeakageDesc(e.target.value)} required />
                  <button type="submit" className="btn-enterprise" style={{ height: '55px' }}>Submit Incident Report</button>
                </form>

                <h4 className="mb-4">My Recent Submissions</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Date Reported</th><th>Location</th><th>Current Status</th></tr></thead>
                    <tbody>
                      {myLeakages.length === 0 ? (
                        <tr><td colSpan={3} className="text-center text-muted p-8">No active incident reports found.</td></tr>
                      ) : (
                        myLeakages.map(l => (
                          <tr key={l.report_id || Math.random()}>
                            <td className="small">{new Date(l.report_date).toLocaleDateString()}</td>
                            <td><span className="fw-600">{l.location}</span></td>
                            <td><span className={`badge ${l.status === 'Fixed' ? 'success' : 'warning'}`}>{l.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
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
