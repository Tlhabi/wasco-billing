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
      <div className="landing-wrapper parallax-hero" onMouseMove={handleMouseMove} style={{ background: '#050b14', overflow: 'hidden', position: 'relative', width: '100vw', minHeight: '100vh' }}>
        <div className="scanlines"></div>
        
        {/* Telemetry Ticker */}
        <div className="telemetry-ticker">
          <div className="ticker-content">
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex' }}>
                {[
                  { label: 'GRID_STABILITY', value: '99.98%', status: 'OPTIMAL' },
                  { label: 'NETWORK_PRESSURE', value: '84.2 PSI', status: 'STABLE' },
                  { label: 'PURITY_INDEX', value: '100%', status: 'CERTIFIED' },
                  { label: 'ACTIVE_NODES', value: '1,442', status: 'SYNCED' },
                  { label: 'LAST_PULSE', value: new Date().toLocaleTimeString(), status: 'LIVE' }
                ].map((item, j) => (
                  <div key={j} className="ticker-item">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>[{item.label}]</span>
                    <span style={{ color: 'var(--primary)' }}>{item.value}</span>
                    <span className="badge success" style={{ fontSize: '8px', padding: '1px 5px', height: '14px' }}>{item.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blobs">
          <div className="blob blob-1" style={{ background: 'radial-gradient(circle, #0ea5e9, #6366f1)', opacity: 0.25, width: '1200px', height: '1200px' }}></div>
          <div className="blob blob-2" style={{ background: 'radial-gradient(circle, #10b981, #0ea5e9)', opacity: 0.15, width: '1000px', height: '1000px' }}></div>
          <div className="particles-layer"></div>
        </div>

        <div className="landing-content" style={{ padding: '0 8vw', maxWidth: '1600px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center', minHeight: '100vh', position: 'relative', zIndex: 20 }}>
          <div className="animate-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 cyber-border-box" style={{ background: 'rgba(14,165,233,0.1)' }}>
              <span className="dot-indicator"></span>
              <span className="font-mono text-xs text-primary fw-800" style={{ letterSpacing: '2px' }}>v5.0.1 SYSTEM_ONLINE</span>
            </div>

            <h1 className="hero-gradient-text" style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', lineHeight: '1.05', marginBottom: '1.5rem', fontWeight: 900 }}>
              REDEFINING <br />
              <span className="word-cycler" style={{ color: '#fff' }}>
                THE <span className="cycle-text text-primary">{heroWords[heroWordIndex].toUpperCase()}</span>
              </span>
            </h1>
            
            <p className="text-muted mb-12 max-w-lg" style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
              Experience the next generation of water resource management. 
              Real-time telemetry, automated billing, and AI-driven grid optimization for the modern era.
            </p>

            <div className="flex gap-6">
              <button className="btn super-btn font-mono text-lg" onClick={() => setView('login')} style={{ background: 'var(--primary)', color: '#fff', padding: '1.2rem 2.8rem', borderRadius: '16px', border: 'none', boxShadow: '0 0 30px var(--primary-glow)' }}>
                <span className="flex items-center gap-3">
                  INITIALIZE_PORTAL <ChevronRight className="icon-slide" size={24} />
                </span>
              </button>
              <button className="btn glass-btn font-mono text-lg" onClick={fetchPublicData} style={{ padding: '1.2rem 2.8rem', borderRadius: '16px', color: '#fff' }}>
                NETWORK_STATS
              </button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-12">
              {[
                { label: 'Global Pressure', val: liveStats.pressure.toFixed(1) + '%', icon: <Activity size={20} /> },
                { label: 'System Uptime', val: '99.9%', icon: <LayoutDashboard size={20} /> },
                { label: 'Active Nodes', val: '1.4k', icon: <Users size={20} /> }
              ].map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    {s.icon} <span className="font-mono text-xs opacity-60 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <h3 className="m-0 font-mono" style={{ fontSize: '2.2rem', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>{s.val}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Column (Massive Focal Hologram) */}
          <div className="hero-visual-side animate-in" style={{ animationDelay: '0.2s', perspective: '1500px' }}>
            <div className="parallax-layer floating-hologram hologram-glow" style={{ transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`, transformStyle: 'preserve-3d' }}>
              <div className="glass-hud-panel" style={{ width: '480px', height: '620px', position: 'relative', overflow: 'hidden', padding: '2.5rem' }}>
                <div className="cyber-grid opacity-30"></div>
                
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div className="flex-between">
                    <div className="font-mono text-xs text-primary">SCANNING_REGION_01</div>
                    <div className="font-mono text-xs text-muted">COORD_42.8N_18.2E</div>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="relative">
                      <div className="pulse-icon" style={{ width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(14,165,233,0.05)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                      <Droplets size={140} className="text-primary" style={{ filter: 'drop-shadow(0 0 40px var(--primary))' }} />
                    </div>
                    <h2 className="font-mono mt-10 text-primary" style={{ letterSpacing: '12px', fontSize: '2rem' }}>WASCO_OS</h2>
                    <div className="badge primary mt-3 font-mono" style={{ padding: '6px 16px', background: 'rgba(14,165,233,0.1)' }}>LINK_STABILIZED</div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl cyber-border-box" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <div className="font-mono text-[10px] text-muted mb-2 uppercase tracking-tighter">DATA_INTEGRITY</div>
                      <div className="font-mono text-success fw-800">OPTIMAL</div>
                    </div>
                    <div className="p-4 rounded-xl cyber-border-box" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <div className="font-mono text-[10px] text-muted mb-2 uppercase tracking-tighter">NETWORK_LATENCY</div>
                      <div className="font-mono text-primary fw-800">0.02ms</div>
                    </div>
                  </div>
                </div>

                <div className="scan-line" style={{ background: 'linear-gradient(to bottom, transparent, var(--primary), transparent)', opacity: 0.2 }}></div>
              </div>
              
              {/* Background Focal Image */}
              <img 
                src={`file:///C:/Users/Lenovo/.gemini/antigravity/brain/6ba6f6ba-1169-4d9a-83aa-6905ebcce28c/cyber_water_infrastructure_1778963293774.png`}
                style={{ 
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) translateZ(-80px)', 
                  width: '130%', height: '130%', objectFit: 'cover', opacity: 0.1, filter: 'grayscale(1) contrast(1.5)',
                  pointerEvents: 'none'
                }}
                alt=""
              />
            </div>
          </div>
        </div>

        {/* Global UI Decorations */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 100 }} className="animate-in">
          <div className="font-mono text-[10px] text-muted mb-2">SYSTEM_LOGS</div>
          <div style={{ fontSize: '9px', color: 'var(--primary)', opacity: 0.6 }} className="font-mono">
            {'>'} DB_SYNC: SUCCESS<br/>
            {'>'} AUTH_PROTOCOL: ACTIVE<br/>
            {'>'} GRID_ENCRYPTION: 256-BIT
          </div>
        </div>
      </div>
    );
  }
  if (view === 'login') {
    return (
      <div className="app-container login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Dynamic Water Background */}
        <div className="bg-blobs water-bg-effect">
          <div className="blob blob-1" style={{ opacity: 0.6, width: '120vw', height: '120vh', top: '-10vh', left: '-10vw' }}></div>
          <div className="blob blob-2" style={{ opacity: 0.5, width: '100vw', height: '100vh', bottom: '-20vh', right: '-20vw' }}></div>
          <div className="blob blob-3" style={{ opacity: 0.7, width: '80vw', height: '80vh', top: '20vh', left: '20vw' }}></div>
        </div>
        
        {/* Decorative Grid Overlay */}
        <div className="grid-overlay"></div>

        <div className="glass-card login-card animate-in" style={{ width: '100%', maxWidth: '440px', padding: '3.5rem', borderRadius: '32px', background: 'rgba(255,255,255,0.5)', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
          {/* Subtle top glow line */}
          <div className="card-glow-line"></div>
          
          <div className="text-center" style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
            <div className="login-logo-wrap" style={{ 
              width: '80px', height: '80px', borderRadius: '24px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 1.5rem', boxShadow: '0 15px 35px var(--primary-glow)',
              transform: 'rotate(-5deg)',
              position: 'relative'
            }}>
              <Droplets size={38} color="white" className="floating-icon" />
              <div className="ripple-ring"></div>
              <div className="ripple-ring delay"></div>
            </div>
            <h2 className="login-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>WASCO <span className="text-light" style={{ fontWeight: 400, opacity: 0.6 }}>Portal</span></h2>
            <p className="text-muted login-subtitle" style={{ fontSize: '1rem' }}>Secure Access Authentication</p>
          </div>

          {loginError && (
            <div className="error-alert animate-in" style={{ 
              color: 'var(--error)', marginBottom: '1.5rem', fontWeight: 600, 
              padding: '0.8rem 1.2rem', background: 'rgba(239,68,68,0.08)', 
              borderRadius: '14px', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <AlertTriangle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <div className="login-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.04)', padding: '0.4rem', borderRadius: '12px' }}>
            <button 
              className={`login-tab ${!isBiometricScan ? 'active' : ''}`} 
              onClick={() => setIsBiometricScan(false)}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', fontWeight: 600, background: !isBiometricScan ? 'white' : 'transparent', color: !isBiometricScan ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: !isBiometricScan ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >Password</button>
            <button 
              className={`login-tab ${isBiometricScan ? 'active' : ''}`} 
              onClick={handleBiometricAuth}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', fontWeight: 600, background: isBiometricScan ? 'white' : 'transparent', color: isBiometricScan ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: isBiometricScan ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >WASCO Passkey</button>
          </div>

          {!isBiometricScan ? (
            <form onSubmit={handleLogin} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="input-group modern-input-group" style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account ID / Username</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. john_doe" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    className="input-field modern-input" 
                    style={{ height: '56px', borderRadius: '16px', fontSize: '1rem', paddingRight: '40px' }} 
                  />
                  <User size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              
              <div className="input-group modern-input-group" style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Secure Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="input-field modern-input" 
                    style={{ height: '56px', borderRadius: '16px', fontSize: '1rem', paddingRight: '40px' }} 
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
              
              <div className="flex-between" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                  <span className="small text-muted fw-600">Remember device</span>
                </label>
                <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Recover access?</a>
              </div>

              <button type="submit" className="btn btn-primary login-btn" disabled={isAuthenticating} style={{ height: '56px', fontSize: '1.1rem', borderRadius: '16px', marginTop: '0.5rem', fontWeight: 700 }}>
                {isAuthenticating ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} /> Authenticating...</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>Sign In <ChevronRight size={20} /></span>
                )}
              </button>
            </form>
          ) : (
            <div className="biometric-container animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
              <div className={`biometric-scanner ${biometricSuccess ? 'success' : ''}`} style={{ 
                width: '120px', height: '120px', borderRadius: '50%', background: biometricSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(14,165,233,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: `2px solid ${biometricSuccess ? 'var(--success)' : 'var(--primary)'}`
              }}>
                <Fingerprint size={64} style={{ color: biometricSuccess ? 'var(--success)' : 'var(--primary)', transition: 'all 0.3s' }} />
                {!biometricSuccess && (
                  <div className="scan-line" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)', animation: 'scan 2s ease-in-out infinite alternate' }}></div>
                )}
              </div>
              <p className="biometric-text" style={{ marginTop: '1.5rem', fontWeight: 600, color: biometricSuccess ? 'var(--success)' : 'var(--primary)', letterSpacing: '0.05em' }}>
                {biometricSuccess ? 'Identity Verified. Logging in...' : 'Scanning biometrics...'}
              </p>
              <button 
                type="button"
                className="btn" 
                onClick={() => { setIsBiometricScan(false); setBiometricSuccess(false); }}
                style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          )}

          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <p className="text-muted small">New to WASCO Services?</p>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <button onClick={() => setView('register')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>Request Connection</button>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-color)' }}></div>
              <button onClick={fetchPublicData} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Public Rates</button>
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

                  <div className="glass-card hud-panel" style={{ borderTop: '4px solid var(--secondary)', position: 'relative' }}>
                    <div className="cyber-grid opacity-10"></div>
                    <div className="flex-between mb-4 relative z-10">
                      <h4 className="font-mono small uppercase text-secondary">[ SEGMENTED_CONTRIBUTION ]</h4>
                      <div className="flex gap-2">
                        <button 
                          className={`btn small font-mono ${segmentMetric === 'total_units' ? 'btn-primary' : ''}`} 
                          onClick={() => setSegmentMetric('total_units')}
                          style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px' }}
                        >USAGE</button>
                        <button 
                          className={`btn small font-mono ${segmentMetric === 'total_revenue' ? 'btn-primary' : ''}`} 
                          onClick={() => setSegmentMetric('total_revenue')}
                          style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px' }}
                        >REVENUE</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10">
                      <div style={{ height: '220px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <div className="font-mono text-muted" style={{ fontSize: '10px' }}>TOTAL</div>
                          <div className="font-mono fw-800" style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                            {segmentMetric === 'total_revenue' ? `LSL ${Math.round(segmentData.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0) / 1000)}k` : `${Math.round(segmentData.reduce((acc, curr) => acc + (curr.total_units || 0), 0) / 1000)}k kl`}
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={segmentData.map(d => ({ name: d.segment, value: d[segmentMetric] }))} 
                              innerRadius={65} 
                              outerRadius={85} 
                              paddingAngle={8} 
                              dataKey="value" 
                              nameKey="name"
                            >
                              {segmentData.map((entry, index) => (
                                <Cell 
                                  key={"cell-" + index} 
                                  fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} 
                                  stroke="rgba(255,255,255,0.1)"
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--secondary)', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff', fontSize: '12px' }}
                              formatter={(value) => segmentMetric === 'total_revenue' ? `LSL ${parseFloat(value).toLocaleString()}` : `${value} kl`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex flex-col gap-3">
                        {segmentData.map((d, i) => (
                          <div key={d.segment} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex-between mb-1">
                              <span className="font-mono text-xs flex items-center gap-2">
                                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][i % 4] }}></span>
                                {d.segment.toUpperCase()}
                              </span>
                              <span className="font-mono text-xs fw-800" style={{ color: ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][i % 4] }}>
                                {((d[segmentMetric] / segmentData.reduce((acc, curr) => acc + (curr[segmentMetric] || 0), 1)) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="font-mono text-sm fw-700">
                              {segmentMetric === 'total_revenue' ? `LSL ${parseFloat(d[segmentMetric]).toLocaleString()}` : `${d[segmentMetric]} kl`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
              <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--primary)', position: 'relative' }}>
                <div className="flex-between mb-6">
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Users className="text-primary pulse-icon" size={24} /> Customer Master Database
                    </h3>
                    <p className="text-muted small">Live synchronized record of all {customers.length} identities.</p>
                  </div>
                  <div className="search-box" style={{ position: 'relative' }}>
                    <input type="text" placeholder="Quantum Search..." className="input-field" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} style={{ paddingLeft: '2.5rem', background: 'var(--surface-solid)', border: '1px solid var(--primary-glow)', boxShadow: '0 0 15px rgba(14,165,233,0.1)', width: '250px' }} />
                    <User size={16} className="text-primary" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
                <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Account ID</th><th>Identity</th><th>Status</th><th>Classification</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.account_number} className="group hover-row" style={{ transition: 'all 0.3s ease' }}>
                          <td>
                            <div className="badge primary font-mono" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid var(--primary-glow)' }}>
                              <History size={12} style={{ marginRight: '4px' }} /> {c.account_number}
                            </div>
                          </td>
                          <td className="fw-700">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                                {c.first_name?.[0]}{c.last_name?.[0]}
                              </div>
                              {c.first_name} {c.last_name}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span className="dot-indicator" style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', marginRight: '6px' }}></span>
                              <span className="small fw-600 text-success">Active</span>
                            </div>
                          </td>
                          <td><span className="badge" style={{ background: 'var(--surface-solid)' }}>{c.customer_type}</span></td>
                          <td>
                            <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn small glass-btn" style={{ padding: '0.4rem', borderRadius: '8px' }}><Settings size={14} /></button>
                              <button className="btn small text-error" onClick={() => handleDeleteCustomer(c.account_number)} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none' }}><LogOut size={14} /></button>
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
              <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--warning)', position: 'relative', overflow: 'hidden' }}>
                <div className="cyber-grid opacity-50"></div>
                <div className="flex-between mb-6 relative z-10">
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <AlertTriangle className="text-warning pulse-icon" size={24} /> Incident Command Center
                    </h3>
                    <p className="text-muted small">Live geographic fault tracking and dispatch.</p>
                  </div>
                  <div className="badge warning p-2" style={{ border: '1px solid var(--warning)' }}>
                    <span className="dot-indicator bg-warning mr-2"></span> {leakages.filter(l => l.status !== 'Fixed').length} CRITICAL FAULTS
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mb-6">
                  {leakages.filter(l => l.status !== 'Fixed').slice(0, 3).map(l => (
                    <div key={l.report_id} className="hud-panel p-4 rounded-xl" style={{ borderLeft: '4px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div className="flex-between mb-2">
                        <span className="font-mono text-warning text-sm font-bold">INCIDENT #{l.report_id}</span>
                        <span className="text-xs text-muted">{new Date(l.report_date).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-white fw-600 mb-1">{l.location}</div>
                      <div className="small text-muted mb-3 line-clamp-2">Pressure drop detected in zone. Field dispatch required immediately.</div>
                      {user.role?.toLowerCase() === 'admin' ? (
                        <button className="btn btn-primary small w-full" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')} style={{ background: 'var(--warning)', color: '#000' }}>Dispatch & Resolve</button>
                      ) : <span className="text-muted italic small">Awaiting Dispatch</span>}
                    </div>
                  ))}
                </div>

                <div className="table-container relative z-10" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Incident ID</th><th>Date Logged</th><th>Location</th><th>Status</th><th>Resolution</th></tr></thead>
                    <tbody>
                      {leakages.map(l => (
                        <tr key={l.report_id} className="hover-row group">
                          <td><strong className="font-mono">#L-{l.report_id}</strong></td>
                          <td className="small text-muted">{new Date(l.report_date).toLocaleString()}</td>
                          <td className="fw-600">{l.location}</td>
                          <td>
                            <span className={"badge font-mono " + (l.status === 'Fixed' ? 'success' : 'warning')} style={{ border: `1px solid var(--${l.status === 'Fixed' ? 'success' : 'warning'})` }}>
                              {l.status === 'Fixed' ? 'RESOLVED' : 'ACTIVE_FAULT'}
                            </span>
                          </td>
                          <td>
                            {l.status !== 'Fixed' && user.role?.toLowerCase() === 'admin' ? (
                              <button className="btn btn-primary small opacity-0 group-hover-opacity-100 transition-opacity" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')}>Resolve</button>
                            ) : l.status === 'Fixed' ? <span className="text-success"><Check size={16} /></span> : <span className="text-muted italic small"><Activity size={14} className="animate-spin" /></span>}
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
          <div className="glass-card flex-between" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div><h3 className="stat-value">{customers.length}</h3><p className="stat-label">Master Accounts</p></div>
            <div className="stat-icon-wrap"><Users size={22} /></div>
          </div>
          <div className="glass-card flex-between" style={{ borderLeft: '4px solid var(--success)' }}>
            <div><h3 className="stat-value">LSL {(bills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0) / 1000).toFixed(1)}k</h3><p className="stat-label">Total Billed</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--success)' }}><Wallet size={22} /></div>
          </div>
          <div className="glass-card flex-between" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div><h3 className="stat-value">{leakages.filter(l => l.status === 'Pending').length}</h3><p className="stat-label">Active Faults</p></div>
            <div className="stat-icon-wrap" style={{ color: 'var(--warning)' }}><AlertTriangle size={22} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <div className="flex-between mb-4">
              <h4 className="font-mono small text-muted uppercase">Usage_Analytics_Stream</h4>
              <select className="input-field" value={insightTimeframe} onChange={(e) => setInsightTimeframe(e.target.value)} style={{ width: '120px', padding: '0.2rem', fontSize: '0.75rem' }}>
                <option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option>
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

          <div className="glass-card hud-panel" style={{ borderTop: '4px solid var(--secondary)', position: 'relative' }}>
            <div className="cyber-grid opacity-10"></div>
            <div className="flex-between mb-4 relative z-10">
              <h4 className="font-mono small uppercase text-secondary">[ SEGMENTED_CONTRIBUTION ]</h4>
              <div className="flex gap-2">
                <button className={`btn small font-mono ${segmentMetric === 'total_units' ? 'btn-primary' : ''}`} onClick={() => setSegmentMetric('total_units')} style={{ padding: '2px 8px', fontSize: '10px' }}>USAGE</button>
                <button className={`btn small font-mono ${segmentMetric === 'total_revenue' ? 'btn-primary' : ''}`} onClick={() => setSegmentMetric('total_revenue')} style={{ padding: '2px 8px', fontSize: '10px' }}>REVENUE</button>
              </div>
            </div>
            <div className="relative z-10" style={{ height: '220px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="font-mono text-muted" style={{ fontSize: '10px' }}>TOTAL</div>
                <div className="font-mono fw-800" style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                  {segmentMetric === 'total_revenue' ? `LSL ${Math.round(segmentData.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0) / 1000)}k` : `${Math.round(segmentData.reduce((acc, curr) => acc + (curr.total_units || 0), 0) / 1000)}k kl`}
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentData.map(d => ({ name: d.segment, value: d[segmentMetric] }))} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" nameKey="name">
                    {segmentData.map((entry, index) => (<Cell key={"cell-" + index} fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} stroke="rgba(255,255,255,0.1)" />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--secondary)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} formatter={(value) => segmentMetric === 'total_revenue' ? `LSL ${parseFloat(value).toLocaleString()}` : `${value} kl`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </>
    )}

    {activeTab === 'manual' && (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6 animate-in">
        {/* Entry Form */}
        <div className="lg:col-span-2 glass-card hud-panel" style={{ borderTop: '4px solid var(--primary)', position: 'relative' }}>
          <div className="cyber-grid opacity-10"></div>
          <div className="flex-between mb-6 relative z-10">
            <div>
              <h3 className="font-mono text-primary">[ USAGE_RECORDING_STATION ]</h3>
              <p className="text-muted small">Input localized meter telemetry for automated bill generation.</p>
            </div>
            <Activity className="text-primary pulse-icon" size={28} />
          </div>
          
          {usageMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="font-mono">
              <Check size={20} /> {usageMsg}
            </div>
          )}

          <form onSubmit={handleManualUsage} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="input-group">
              <label className="font-mono small text-muted mb-2 block fw-800">TARGET_ACCOUNT_ID</label>
              <select 
                className="input-field font-mono" 
                value={selectedCustomer || ''} 
                onChange={e => setSelectedCustomer(e.target.value)} 
                required
                style={{ height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
              >
                <option value="" disabled>-- IDENTITY_LOOKUP --</option>
                {customers.map(c => (
                  <option key={c.account_number} value={c.account_number} style={{ background: 'var(--surface-solid)' }}>
                    {c.account_number} - {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="font-mono small text-muted mb-2 block fw-800">BILLING_CYCLE_PERIOD</label>
              <input 
                className="input-field font-mono" 
                value={manualUsage.month} 
                onChange={e => setManualUsage({ ...manualUsage, month: e.target.value })} 
                placeholder="e.g. May 2026" 
                required 
                style={{ height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div className="input-group">
              <label className="font-mono small text-muted mb-2 block fw-800">METER_DELTA_UNITS (kl)</label>
              <input 
                type="number" 
                className="input-field font-mono" 
                value={manualUsage.units} 
                onChange={e => setManualUsage({ ...manualUsage, units: e.target.value })} 
                placeholder="0.00" 
                required 
                style={{ height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
              />
            </div>
            
            <div className="flex items-end">
              <button type="submit" className="btn btn-primary w-full font-mono text-lg" style={{ height: '56px', borderRadius: '12px', boxShadow: '0 0 20px var(--primary-glow)' }}>
                [ COMMIT_TRANSACTION ]
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-surface-solid rounded-xl border border-dashed border-color opacity-60">
            <h4 className="font-mono small text-muted mb-2">SYSTEM_VALIDATION_PROTOCOL:</h4>
            <ul className="text-muted small font-mono" style={{ paddingLeft: '1.2rem', listStyle: 'square' }}>
              <li>Accounts must exist in the Master Database.</li>
              <li>Unit metrics are calculated based on current tiered WASCO rates.</li>
              <li>Commitment triggers an immutable billing record and SMS/Email dispatch.</li>
            </ul>
          </div>
        </div>

        {/* Live Bill Preview */}
        <div className="glass-card hud-panel" style={{ borderTop: '4px solid var(--accent)', background: 'rgba(16, 185, 129, 0.03)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
              <FileText size={24} />
            </div>
            <h4 className="font-mono uppercase text-accent">Real-time_Valuation</h4>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="font-mono text-muted text-xs mb-2">ESTIMATED_INVOICE_TOTAL</div>
              <div className="font-mono text-4xl fw-800 text-accent" style={{ textShadow: '0 0 15px rgba(16,185,129,0.4)' }}>
                LSL {manualUsage.units ? (calculateBill(Number(manualUsage.units), rates, customers.find(c => c.account_number === selectedCustomer)?.customer_type || 'Residential')).toFixed(2) : '0.00'}
              </div>
            </div>

            <div className="hud-panel p-4 rounded-xl border-accent-glow">
              <div className="flex-between mb-2">
                <span className="font-mono text-xs text-muted">CUSTOMER_TYPE</span>
                <span className="font-mono text-xs fw-700 text-accent">{customers.find(c => c.account_number === selectedCustomer)?.customer_type || 'N/A'}</span>
              </div>
              <div className="flex-between mb-2">
                <span className="font-mono text-xs text-muted">UNIT_VOLUME</span>
                <span className="font-mono text-xs fw-700 text-accent">{manualUsage.units || 0} kl</span>
              </div>
              <div className="flex-between">
                <span className="font-mono text-xs text-muted">BILL_STATUS</span>
                <span className="font-mono text-xs fw-700 text-accent">DRAFT_PENDING</span>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div className="flex gap-3">
                <AlertTriangle className="text-warning" size={18} />
                <p className="text-xs text-muted font-mono" style={{ color: 'var(--warning)' }}>
                  VERIFY_DATA: Transaction will be permanent once committed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card hud-panel animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex-between mb-4">
          <h4 className="font-mono text-muted uppercase small">Recent_Reading_Activity_Log</h4>
          <Activity size={16} className="text-muted" />
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Reference</th><th>Timestamp</th><th>Account</th><th>Units</th><th>Action_Status</th></tr></thead>
            <tbody>
              {usageReports.slice(0, 5).map((r, i) => (
                <tr key={i} className="hover-row">
                  <td><span className="badge font-mono" style={{ fontSize: '10px' }}>#{Math.random().toString(36).substring(7).toUpperCase()}</span></td>
                  <td className="small text-muted">{new Date(r.reading_date || Date.now()).toLocaleString()}</td>
                  <td className="fw-700">{r.account_number || 'BATCH_SYSTEM'}</td>
                  <td className="text-primary fw-800">{r.units_used || r.total_units} kl</td>
                  <td><span className="badge success">COMMITTED</span></td>
                </tr>
              ))}
              {usageReports.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted p-6">No recent telemetry recorded.</td></tr>
              )}
            </tbody>
          </table>
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
      <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--accent)', position: 'relative', overflow: 'hidden' }}>
        <div className="radar-sweep" style={{ opacity: 0.05, background: 'conic-gradient(from 0deg, transparent 70%, var(--accent) 100%)' }}></div>
        <div className="stat-header mb-6 relative z-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="pulse-icon" style={{ background: 'var(--accent)', color: 'white', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 0 20px var(--accent)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Global Economic Engine</h3>
              <p className="text-muted small">Real-time configuration of tier-based revenue extraction models.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          {rates.slice(0, 3).map(r => (
            <div key={r.rate_id} className="hud-panel p-5 rounded-2xl" style={{ border: '1px solid rgba(52, 211, 153, 0.2)', background: 'linear-gradient(135deg, rgba(0,0,0,0.2), rgba(52, 211, 153, 0.05))' }}>
              <div className="text-muted small uppercase mb-1 font-mono tracking-widest">{r.tier_name}</div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Outfit' }}>{parseFloat(r.rate_per_unit).toFixed(2)}</span>
                <span className="text-sm text-muted mb-1 font-mono">LSL/kl</span>
              </div>
              <div className="w-full h-1 bg-surface-solid rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${(parseFloat(r.rate_per_unit) / 50) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="table-container mb-6 relative z-10" style={{ border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
          <table className="data-table">
            <thead><tr><th>Configuration Array</th><th>Usage Bounds</th><th>Value Extractor</th><th className="text-right">Overrides</th></tr></thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.rate_id} className="hover-row group" style={{ background: editingRate?.rate_id === r.rate_id ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>
                  <td><strong className="text-main font-mono">{r.tier_name}</strong></td>
                  <td>
                    <span className="badge font-mono" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-color)' }}>
                      [ {r.minimum_units} , {r.maximum_units > 9000 ? 'MAX' : r.maximum_units} ]
                    </span>
                  </td>
                  <td style={{ color: 'var(--accent)', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }}>LSL {parseFloat(r.rate_per_unit).toFixed(2)}</td>
                  <td className="text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover-opacity-100 transition-opacity">
                      <button className="btn small glass-btn" onClick={() => startEditRate(r)}><Settings size={14} /></button>
                      <button className="btn small text-error" onClick={() => handleDeleteRate(r.rate_id)} style={{ background: 'rgba(239, 68, 68, 0.1)' }}><LogOut size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={'p-6 relative z-10 transition-all ' + (editingRate ? 'edit-mode-active' : '')} style={{
          background: editingRate ? 'rgba(52, 211, 153, 0.05)' : 'var(--surface-solid)',
          borderRadius: '20px', border: editingRate ? '1px solid var(--accent)' : '1px dashed var(--border-color)',
        }}>
          <div className="flex-between mb-4">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>
              <Settings size={18} className="text-accent" />
              {editingRate ? 'OVERRIDE_TIER: ' + editingRate.tier_name : 'INITIALIZE_NEW_TIER'}
            </h4>
            {editingRate && <button className="badge" onClick={() => { setEditingRate(null); setNewTierName(''); setNewMinUnits(''); setNewMaxUnits(''); setNewRate(''); }} style={{ cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>ABORT_EDIT</button>}
          </div>
          <form onSubmit={editingRate ? handleUpdateRate : handleAddRate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <div className="input-group">
              <label className="small text-muted mb-1 block font-mono">TIER_LABEL</label>
              <input className="input-field font-mono" value={newTierName} onChange={e => setNewTierName(e.target.value)} placeholder="T-X" required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block font-mono">MIN_BOUND</label>
              <input type="number" className="input-field font-mono" value={newMinUnits} onChange={e => setNewMinUnits(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block font-mono">MAX_BOUND</label>
              <input type="number" className="input-field font-mono" value={newMaxUnits} onChange={e => setNewMaxUnits(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="small text-muted mb-1 block font-mono">RATE_MULTIPLIER</label>
              <input type="number" step="0.01" className="input-field font-mono text-accent fw-700" value={newRate} onChange={e => setNewRate(e.target.value)} required />
            </div>
            <button className={'btn w-full font-mono ' + (editingRate ? 'btn-primary' : '')} style={{ gridColumn: 'span 4', marginTop: '1rem', height: '50px', background: editingRate ? 'var(--accent)' : 'var(--surface-hover)', color: editingRate ? '#000' : 'var(--text-main)' }}>
              {editingRate ? 'COMMIT_CHANGES' : 'INJECT_NEW_TIER'}
            </button>
          </form>
        </div>
      </div>
    )}
    {activeTab === 'reports' && (
      <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--warning)', position: 'relative', overflow: 'hidden' }}>
        <div className="cyber-grid opacity-50"></div>
        <div className="flex-between mb-6 relative z-10">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle className="text-warning pulse-icon" size={24} /> Incident Command Center
            </h3>
            <p className="text-muted small">Live geographic fault tracking and dispatch.</p>
          </div>
          <div className="badge warning p-2" style={{ border: '1px solid var(--warning)' }}>
            <span className="dot-indicator bg-warning mr-2"></span> {leakages.filter(l => l.status !== 'Fixed').length} CRITICAL FAULTS
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mb-6">
          {leakages.filter(l => l.status !== 'Fixed').slice(0, 3).map(l => (
            <div key={l.report_id} className="hud-panel p-4 rounded-xl" style={{ borderLeft: '4px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
              <div className="flex-between mb-2">
                <span className="font-mono text-warning text-sm font-bold">INCIDENT #{l.report_id}</span>
                <span className="text-xs text-muted">{new Date(l.report_date).toLocaleTimeString()}</span>
              </div>
              <div className="text-white fw-600 mb-1">{l.location}</div>
              <div className="small text-muted mb-3 line-clamp-2">Pressure drop detected in zone. Field dispatch required immediately.</div>
              {user.role?.toLowerCase() === 'admin' ? (
                <button className="btn btn-primary small w-full" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')} style={{ background: 'var(--warning)', color: '#000' }}>Dispatch & Resolve</button>
              ) : <span className="text-muted italic small">Awaiting Dispatch</span>}
            </div>
          ))}
        </div>

        <div className="table-container relative z-10" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Incident ID</th><th>Date Logged</th><th>Location</th><th>Status</th><th>Resolution</th></tr></thead>
            <tbody>
              {leakages.map(l => (
                <tr key={l.report_id} className="hover-row group">
                  <td><strong className="font-mono">#L-{l.report_id}</strong></td>
                  <td className="small text-muted">{new Date(l.report_date).toLocaleString()}</td>
                  <td className="fw-600">{l.location}</td>
                  <td>
                    <span className={"badge font-mono " + (l.status === 'Fixed' ? 'success' : 'warning')} style={{ border: `1px solid var(--${l.status === 'Fixed' ? 'success' : 'warning'})` }}>
                      {l.status === 'Fixed' ? 'RESOLVED' : 'ACTIVE_FAULT'}
                    </span>
                  </td>
                  <td>
                    {l.status !== 'Fixed' && user.role?.toLowerCase() === 'admin' ? (
                      <button className="btn btn-primary small opacity-0 group-hover-opacity-100 transition-opacity" onClick={() => handleUpdateLeakageStatus(l.report_id, 'Fixed')}>Resolve</button>
                    ) : l.status === 'Fixed' ? <span className="text-success"><Check size={16} /></span> : <span className="text-muted italic small"><Activity size={14} className="animate-spin" /></span>}
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
      <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
        <div className="radar-sweep" style={{ opacity: 0.05, background: 'conic-gradient(from 0deg, transparent 70%, var(--primary) 100%)' }}></div>
        <div className="relative z-10">
          <div className="flex-between mb-8">
            <div>
              <h2 className="font-mono mb-1" style={{ fontSize: '2rem' }}>WELCOME_BACK, {user.first_name}</h2>
              <p className="text-muted small font-mono">ACCOUNT_ID: {user.account_number} | SECURE_SESSION_ACTIVE</p>
            </div>
            <div className="badge primary p-3" style={{ boxShadow: '0 0 20px rgba(14,165,233,0.2)' }}>
              <span className="dot-indicator bg-success mr-2"></span> LINK_STABLE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="hud-panel p-6 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '2px solid rgba(239,68,68,0.3)', boxShadow: '0 10px 30px rgba(239,68,68,0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: '14px', boxShadow: 'inset 0 0 10px rgba(239,68,68,0.2)' }}><Wallet size={24} className="text-error pulse-icon" /></div>
                <div className="font-mono text-muted text-sm tracking-widest fw-700">OUTSTANDING_TARIFFS</div>
              </div>
              <div className="text-5xl font-bold mb-3 font-mono" style={{ color: 'var(--text-main)' }}>
                {bills.filter(b => b.account_number === user.account_number && b.payment_status === 'Unpaid').length} <span className="text-2xl text-error">BILLS</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(239,68,68,0.1)' }}>
                 <div className="h-full bg-error" style={{ width: '60%', boxShadow: '0 0 10px var(--error)' }}></div>
              </div>
              <div className="text-xs font-mono font-bold" style={{ color: 'var(--error)' }}>ACTION REQUIRED TO PREVENT SERVICE DISRUPTION.</div>
            </div>

            <div className="hud-panel p-6 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '2px solid rgba(14,165,233,0.3)', boxShadow: '0 10px 30px rgba(14,165,233,0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div style={{ background: 'rgba(14,165,233,0.1)', padding: '0.6rem', borderRadius: '14px', boxShadow: 'inset 0 0 10px rgba(14,165,233,0.2)' }}><Activity size={24} className="text-primary pulse-icon" /></div>
                <div className="font-mono text-muted text-sm tracking-widest fw-700">CURRENT_BALANCE</div>
              </div>
              <div className="text-5xl font-bold mb-3 font-mono" style={{ color: 'var(--text-main)' }}>
                <span className="text-2xl text-primary">LSL</span> {balances.find(b => b.account_number === user.account_number)?.total_outstanding || '0.00'}
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(14,165,233,0.1)' }}>
                 <div className="h-full bg-primary" style={{ width: '30%', boxShadow: '0 0 10px var(--primary)' }}></div>
              </div>
              <div className="text-xs font-mono font-bold text-muted">TOTAL ACCUMULATED DEBT.</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="btn w-full font-mono flex-between" onClick={() => setActiveTab('history')} style={{ background: 'var(--surface-solid)', border: '1px solid var(--primary)', color: 'var(--primary)', height: '60px' }}>
              <span>VIEW_HISTORY</span> <ChevronRight size={18} />
            </button>
            <button className="btn w-full font-mono flex-between" onClick={() => setActiveTab('reports')} style={{ background: 'var(--surface-solid)', border: '1px solid var(--warning)', color: 'var(--warning)', height: '60px' }}>
              <span>LOG_INCIDENT</span> <AlertTriangle size={18} />
            </button>
            <button className="btn w-full font-mono flex-between" onClick={() => { setActiveTab('history'); addToast('Initiating secure payment gateway...', 'success'); }} style={{ background: 'var(--primary)', color: '#fff', height: '60px', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
              <span>PAY_NOW</span> <CreditCard size={18} />
            </button>
          </div>
          
          <div className="p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.05)', border: '1px dashed var(--success)' }}>
            <div className="flex items-center gap-3">
              <Check size={24} className="text-success" />
              <div>
                <div className="font-mono fw-700 text-success text-sm">TELEMETRY_SYNCED</div>
                <div className="text-muted text-xs font-mono">Your smart meter last reported usage 4 minutes ago.</div>
              </div>
            </div>
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
