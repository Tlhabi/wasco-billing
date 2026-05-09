import { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplets, Activity, Wallet, CreditCard, ChevronRight, User, LogOut, AlertTriangle, BarChart as BarChartIcon, FileText, Settings, Users, History, UserPlus, Bell, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './index.css';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://wasco-billing-nbph.onrender.com/api';

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
  { rate_id: 1, tier_name: 'Tier 1', minimum_units: 0, maximum_units: 10, rate_per_unit: 5.50 },
  { rate_id: 2, tier_name: 'Tier 2', minimum_units: 11, maximum_units: 20, rate_per_unit: 7.00 },
  { rate_id: 3, tier_name: 'Tier 3', minimum_units: 21, maximum_units: 999999, rate_per_unit: 9.00 }
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
  { segment: 'Residential', total_units: 2500 },
  { segment: 'Business', total_units: 1500 },
  { segment: 'Industrial', total_units: 3000 },
  { segment: 'Other', total_units: 500 }
];
// ------------------------------

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'public', 'customer', 'admin', 'manager'

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
  const [leakageStats, setLeakageStats] = useState([]); // From view_leakage_summary
  const [usageGranularity, setUsageGranularity] = useState('Monthly'); // 'Daily', 'Monthly', 'Yearly'
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('Urgent Alert');
  const [districtReports, setDistrictReports] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
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
  const [manualUsage, setManualUsage] = useState({ units: '', date: '', month: 'March 2026' });
  const [usageMsg, setUsageMsg] = useState('');
  const [insightTimeframe, setInsightTimeframe] = useState('Monthly'); // 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    username: '', password: '', first_name: '', last_name: '',
    email: '', address: '', district: '', phone: '', customer_type: 'Residential'
  });
  const [editingRate, setEditingRate] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      if (res.data.success) {
        setIsOffline(false);
        setUser(res.data.user);
        navigateUser(res.data.user);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setLoginError('Invalid username or password.');
      } else {
        console.warn('Backend unavailable, using mock login.');
        setIsOffline(true);
        const mockUser = MOCK_USERS[username.toLowerCase()];
        if (mockUser) {
          setUser(mockUser);
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

        // Fetch View-based insights
        const [balRes, lStatRes] = await Promise.all([
          axios.get(`${API_BASE}/views/balances`),
          axios.get(`${API_BASE}/views/leakage-stats`)
        ]);
        setBalances(balRes.data);
        setLeakageStats(lStatRes.data);
      }

      if (role === 'customer') {
        try {
          const [payRes, notifRes] = await Promise.all([
            axios.get(`${API_BASE}/payments?account=${account_number}`),
            axios.get(`${API_BASE}/notifications?account=${account_number}`)
          ]);
          setPayments(payRes.data);
          setNotifications(notifRes.data);
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
      setBills(MOCK_BILLS);
      setRates(MOCK_RATES);
      if (role === 'admin' || role === 'manager') {
        setUsageReports(MOCK_USAGE_REPORTS);
        setLeakages(MOCK_LEAKAGES);
        setCustomers(MOCK_CUSTOMERS);
        setPayments(MOCK_PAYMENTS);
        setDistrictReports(MOCK_DISTRICT_REPORTS);
        setSegmentData(MOCK_SEGMENT_DATA);
      }
      if (role === 'customer') {
        setPayments(MOCK_PAYMENTS.filter(p => p.account_number === account_number));
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

  const handlePay = async (account_number, billing_month, amount) => {
    try {
      const res = await axios.post(`${API_BASE}/pay`, { account_number, billing_month, amount });
      setPaymentMsg(`Payment successful! Ref: ${res.data.reference}`);
      setTimeout(() => setPaymentMsg(''), 5000);
      fetchData(user.role.toLowerCase(), user.account_number);
    } catch (err) {
      console.warn('Backend unavailable, using mock payment.');
      const ref = `REF-MOCK-${Math.floor(Math.random() * 10000)}`;
      setPaymentMsg(`Payment successful! Ref: ${ref}`);
      setTimeout(() => setPaymentMsg(''), 5000);

      setBills(bills.map(b =>
        (b.account_number === account_number && b.billing_month === billing_month)
          ? { ...b, payment_status: 'Paid' } : b
      ));
      setPayments([{
        payment_id: Date.now(),
        account_number,
        bill_month: billing_month,
        amount_paid: amount,
        payment_date: new Date().toISOString(),
        payment_method: 'Online',
        reference_number: ref
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
      console.warn('Backend unavailable, updating rate locally.');
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
      <div className="app-container">
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="hero">
          <div className="hero-eyebrow">
            <Droplets size={14} /> Lesotho's Water Utility Portal
          </div>
          <h1>Pure Water,<br />Smartly Managed.</h1>
          <p>Experience seamless utility management across Lesotho's districts — real-time usage tracking, instant bill payments, and live leakage alerts all in one platform.</p>
          <div className="hero-btns">
            <button className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '14px' }} onClick={() => setView('login')}>
              <Droplets size={18} /> Access My Portal
            </button>
            <button className="btn" onClick={fetchPublicData} style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.6)', border: '1.5px solid var(--glass-border)', backdropFilter: 'blur(12px)' }}>
              View Service Rates
            </button>
          </div>
        </div>

        <div className="feature-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon"><Activity size={22} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Real-time Usage</h3>
            <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>Monitor your water consumption daily with our distributed edge reading technology across all districts.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(14,165,233,0.12))', color: 'var(--success)' }}><Wallet size={22} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Instant Payments</h3>
            <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>Pay bills securely using integrated digital gateways with instant receipts and transaction history.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))', color: 'var(--warning)' }}><AlertTriangle size={22} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Leakage Reporting</h3>
            <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>Spot a burst pipe? Report it instantly to your district branch through our mobile-ready portal.</p>
          </div>
        </div>

        <footer style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid rgba(14,165,233,0.1)', marginTop: '2rem' }}>
          <p>© 2026 Water and Sewerage Company (WASCO) · Lesotho · All rights reserved.</p>
        </footer>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="app-container" style={{ maxWidth: '420px', marginTop: '8vh' }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="glass-card">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px var(--primary-glow)' }}>
              <Droplets size={28} color="white" />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Welcome back</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sign in to your WASCO account</p>
          </div>

          {loginError && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontWeight: 600, padding: '0.6rem 0.9rem', background: 'rgba(239,68,68,0.07)', borderRadius: '10px', fontSize: '0.875rem' }}>{loginError}</div>}
          {loginSuccess && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontWeight: 600, padding: '0.6rem 0.9rem', background: 'rgba(16,185,129,0.07)', borderRadius: '10px', fontSize: '0.875rem' }}>{loginSuccess}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Username</label>
              <input type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', borderRadius: '12px', marginTop: '0.25rem' }}>
              Sign In
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <button onClick={() => setView('register')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Create Account →</button>
            <button onClick={fetchPublicData} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>View Rates</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="app-container" style={{ maxWidth: '560px', marginTop: '4vh' }}>
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
                <option value="Residential">🏠 Residential</option>
                <option value="Business">🏢 Business</option>
                <option value="Industrial">🏭 Industrial</option>
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
      <div className="app-container">
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <header>
          <div className="logo"><Droplets size={32} className="logo-icon" /><h1>WASCO <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Public Services</span></h1></div>
          <button className="btn btn-primary" onClick={() => setView('login')}>Back to Login</button>
        </header>

        <div className="glass-card mb-6">
          <h2>Available Water and Sewerage Services</h2>
          <p className="text-muted mb-4">WASCO provides clean and safe drinking water as well as reliable sewerage services across all districts of Lesotho.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', padding: '1rem', background: 'rgba(14, 165, 233, 0.05)', borderRadius: '12px' }}>
              <h3 className="mb-2"><Droplets size={20} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--primary)' }} /> Clean Water Supply</h3>
              <p>Reliable piped water directly to your residential or commercial property.</p>
            </div>
            <div style={{ flex: 1, minWidth: '250px', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px' }}>
              <h3 className="mb-2"><Activity size={20} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--success)' }} /> Sewerage & Sanitation</h3>
              <p>Safe waste disposal and sanitation infrastructure for urban centers.</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2>Current Billing Rates</h2>
          <p className="text-muted mb-4">Rates are calculated progressively based on your total monthly consumption.</p>
          <div className="table-container">
            <table>
              <thead><tr><th>Tier Name</th><th>Usage Range (Units)</th><th>Cost Per Unit (LSL)</th></tr></thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.rate_id}>
                    <td><strong>{r.tier_name}</strong></td>
                    <td>{r.minimum_units} - {r.maximum_units > 9999 ? 'Unlimited' : r.maximum_units}</td>
                    <td>{parseFloat(r.rate_per_unit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const headerJSX = (
    <header className="glass-card" style={{ padding: '0.75rem 2rem', borderRadius: '24px', position: 'sticky', top: '1rem', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setView(user.role.toLowerCase())}>
        <Droplets size={32} className="logo-icon" />
        <h1 style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          WASCO <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{user.role} Portal</span>
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div className="search-box" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.03)',
          borderRadius: '16px',
          padding: '0.5rem 1.25rem',
          border: '1px solid var(--glass-border)',
          transition: 'all 0.3s ease'
        }}>
          <Activity size={18} className="text-muted" style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Search Account..."
            value={billSearch}
            onChange={e => setBillSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '180px', fontWeight: 500 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* NOTIFICATION BELL — Customer Only */}
          {user.role?.toLowerCase() === 'customer' && (
            <div style={{ position: 'relative' }}>
              <button className="btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '12px' }}>
                <Bell size={20} />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="glass-card dropdown-panel" style={{
                  position: 'absolute',
                  top: '60px',
                  right: '0',
                  width: '360px',
                  zIndex: 2000,
                  padding: '1.5rem',
                  maxHeight: '450px',
                  overflowY: 'auto',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  border: '1px solid var(--primary)'
                }}>
                  <div className="flex-between mb-3">
                    <h4 style={{ margin: 0 }}>Notifications</h4>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="badge unpaid" style={{ fontSize: '0.7rem' }}>
                        {notifications.filter(n => !n.is_read).length} new
                      </span>
                    )}
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
                          const billsSection = document.querySelector('.table-container');
                          if (billsSection) billsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        style={{
                          padding: '0.75rem',
                          borderBottom: '1px solid var(--glass-border)',
                          marginBottom: '0.5rem',
                          background: n.is_read ? 'transparent' : 'rgba(14, 165, 233, 0.08)',
                          borderRadius: '8px',
                          borderLeft: n.is_read ? 'none' : '3px solid var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div className="flex-between">
                          <span className="small text-muted">{n.sent_date}</span>
                          {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>}
                        </div>
                        <p style={{ margin: '0.4rem 0 0.2rem', fontWeight: n.is_read ? 'normal' : '600', fontSize: '0.85rem' }}>
                          {n.notification_type.startsWith('Bill Generated') ? (
                            <span>💧 New bill for <strong>{n.bill_month}</strong> — <span style={{ color: 'var(--warning)' }}>{n.notification_type.replace('Bill Generated - ', '')}</span>. Tap to view.</span>
                          ) : (
                            <span>📊 Your water usage for <strong>{n.bill_month}</strong> has been recorded.</span>
                          )}
                        </p>
                        {!n.is_read && n.notification_type.startsWith('Bill Generated') && (
                          <span className="small" style={{ color: 'var(--primary)', fontWeight: 600 }}>View Bill →</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* PROFILE DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn"
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 1rem', borderRadius: '12px',
                background: showProfile ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.4)',
                border: showProfile ? '1px solid var(--primary)' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '0.4rem' }}>
                <User size={18} />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.first_name ? `${user.first_name} ${user.last_name}` : (user.account_number || user.role)}</span>
              <ChevronRight size={14} style={{ transform: showProfile ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
            </button>

            {showProfile && (
              <div className="glass-card dropdown-panel" style={{
                position: 'absolute',
                top: '60px',
                right: '0',
                width: '320px',
                zIndex: 2000,
                padding: '1.5rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem', color: 'white', fontSize: '1.25rem', fontWeight: 700
                  }}>
                    {user.first_name ? user.first_name[0].toUpperCase() + (user.last_name ? user.last_name[0].toUpperCase() : '') : user.role[0].toUpperCase()}
                  </div>
                  <h4 style={{ margin: '0 0 0.25rem' }}>{user.first_name ? `${user.first_name} ${user.last_name}` : user.role}</h4>
                  <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>{user.role}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  {user.account_number && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Account</span>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>{user.account_number}</span>
                    </div>
                  )}
                  {user.username && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Username</span>
                      <span style={{ fontWeight: 500 }}>@{user.username}</span>
                    </div>
                  )}
                  {user.email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Email</span>
                      <span style={{ fontWeight: 500 }}>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Phone</span>
                      <span style={{ fontWeight: 500 }}>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Address</span>
                      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '180px' }}>{user.address}</span>
                    </div>
                  )}
                  {user.district && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">District</span>
                      <span style={{ fontWeight: 500 }}>{user.district}</span>
                    </div>
                  )}
                  {user.customer_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Account Type</span>
                      <span className="badge" style={{ fontSize: '0.7rem' }}>{user.customer_type}</span>
                    </div>
                  )}
                </div>

                <button className="btn" onClick={handleLogout} style={{
                  width: '100%', marginTop: '1.25rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--warning)',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  justifyContent: 'center'
                }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

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
  const currentMonthUnits = usageReports.length > 0 ? usageReports[0].total_units || 0 : 0;
  const currentQuarterUnits = usageReports.slice(0, 3).reduce((acc, curr) => acc + (curr.total_units || 0), 0);
  const currentYearUnits = usageReports.reduce((acc, curr) => acc + (curr.total_units || 0), 0);

  const getUsageTrendsData = () => {
    if (!usageReports || usageReports.length === 0) return [];
    const grouped = {};
    usageReports.forEach(r => {
      const dateStr = r.reading_date || r.billing_month || '2026-01-01';
      const d = new Date(dateStr);
      let key = '';
      if (insightTimeframe === 'Daily') {
        key = dateStr.substring(0, 10);
      } else if (insightTimeframe === 'Weekly') {
        const wk = new Date(d);
        wk.setDate(wk.getDate() - wk.getDay());
        key = `Wk ${wk.toISOString().split('T')[0]}`;
      } else if (insightTimeframe === 'Monthly') {
        key = dateStr.substring(0, 7);
      } else if (insightTimeframe === 'Quarterly') {
        key = `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
      } else if (insightTimeframe === 'Yearly') {
        key = d.getFullYear().toString();
      }
      grouped[key] = (grouped[key] || 0) + (r.units_used || 0);
    });
    return Object.keys(grouped).sort().map(k => ({ period: k, total_units: grouped[k] }));
  };

  return (
    <div className="app-container">
      {/* TOAST SYSTEM */}
      <div className="toast-container" style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`} style={{ 
            background: t.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
            animation: 'toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {t.message}
          </div>
        ))}
      </div>

      {/* BROADCAST BANNER FOR CUSTOMERS */}
      {view === 'customer' && notifications.some(n => !n.is_read && n.notification_type === 'Urgent Notice') && (
        <div className="broadcast-banner" style={{
          background: 'linear-gradient(90deg, #ef4444, #f97316)', color: 'white', padding: '0.75rem',
          textAlign: 'center', fontWeight: 600, borderRadius: '12px', marginBottom: '1.5rem',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', animation: 'pulse-red 2s infinite'
        }}>
          ⚠️ {notifications.find(n => !n.is_read && n.notification_type === 'Urgent Notice').sent_to}
        </div>
      )}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      {headerJSX}
      {isOffline && <div className="glass-card mb-4" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Backend connection failed. Using Offline Mock Mode.</div>}
      {paymentMsg && <div className="glass-card mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{paymentMsg}</div>}

      {/* MANAGER VIEW */}
      {view === 'manager' && (
        <>
          {/* Branch Insights Dashboard */}
          <div className="glass-card mb-6" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid var(--primary)' }}>
            <div className="flex-between mb-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '14px', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)' }}>
                  <BarChartIcon size={24} />
                </div>
                <div>
                  <h2 className="mb-0" style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>Branch Insights Dashboard</h2>
                  <p className="text-muted small">Summative analysis of water usage and billing performance</p>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '4px', display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setInsightTimeframe(tf)}
                    className={`btn small ${insightTimeframe === tf ? 'btn-primary' : ''}`}
                    style={{ 
                      borderRadius: '8px', 
                      padding: '0.4rem 0.8rem',
                      background: insightTimeframe === tf ? 'var(--primary)' : 'transparent',
                      border: 'none',
                      boxShadow: insightTimeframe === tf ? '0 4px 10px rgba(14, 165, 233, 0.4)' : 'none'
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Units Used (kl)', value: bills.reduce((acc, b) => acc + (b.units_used || 0), 0).toLocaleString(), icon: Activity, color: '#0ea5e9' },
                { label: 'Total Revenue', value: `LSL ${bills.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, color: '#10b981' },
                { label: 'Payment Rate', value: `${bills.length > 0 ? ((bills.filter(b => b.payment_status === 'Paid').length / bills.length) * 100).toFixed(1) : 0}%`, icon: Check, color: '#f59e0b' },
                { label: 'Active Reports', value: leakages.filter(l => l.status !== 'Fixed').length, icon: AlertTriangle, color: '#ef4444' }
              ].map((stat, i) => (
                <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                  <div style={{ color: stat.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><stat.icon size={20} /></div>
                  <div className="small text-muted fw-600 mb-1 uppercase">{stat.label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ height: '400px' }}>
              <div className="glass-card p-4">
                <h4 className="mb-4 small text-muted uppercase fw-700">Usage Trends ({insightTimeframe})</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={getUsageTrendsData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="total_units" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-4">
                <h4 className="mb-4 small text-muted uppercase fw-700">Segmented Contribution</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total_units"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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
                  <thead>
                    <tr><th>Metric Scope</th><th>Current Period</th><th>Variance</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Total Consumption</td><td>{currentMonthUnits} kl</td><td className="text-success">↓ 4.2%</td><td><span className="badge success">Normal</span></td></tr>
                    <tr><td>Calculated Revenue</td><td>LSL {bills.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0).toFixed(2)}</td><td className="text-success">↑ 12.1%</td><td><span className="badge primary">Growing</span></td></tr>
                    <tr><td>Outstanding Balance</td><td>LSL {balances.reduce((acc, b) => acc + parseFloat(b.total_outstanding || 0), 0).toFixed(2)}</td><td className="text-error">↑ 5.3%</td><td><span className="badge warning">Action Required</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            </div>
          </div>
        </>
      )}

      {/* ADMIN VIEW */}
      {view === 'admin' && (
        <>
          <div className="stats-grid mb-6">
            <div className="glass-card">
              <h3 className="mb-4">Batch Billing Process</h3>
              <p className="text-muted small mb-4">Finalize all readings into verified billing statements for the selected period.</p>
              <div className="input-group mb-4">
                <label className="small fw-600 text-muted mb-1 block">Billing Period</label>
                <select value={calculationMonth} onChange={e => setCalculationMonth(e.target.value)} className="input-field">
                  <option value="March 2026">March 2026</option>
                  <option value="February 2026">February 2026</option>
                </select>
              </div>
              <button className="btn btn-primary w-full" onClick={handleCalculateBills} disabled={loading} style={{ justifyContent: 'center' }}>
                {loading ? 'Processing Batch...' : 'Generate System Bills'}
              </button>
            </div>
            {/* Manual Meter Reading (Moved from Manager) */}
            <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="stat-header mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                    <History className="text-primary" size={20} />
                  </div>
                  <h3>Manual Meter Reading</h3>
                </div>
              </div>
              <form onSubmit={handleManualUsage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label className="small text-muted mb-1 block">Customer Search</label>
                  <select className="input-field" onChange={(e) => setSelectedCustomer(e.target.value)} value={selectedCustomer || ''}>
                    <option value="">Select Account...</option>
                    {customers.map(c => <option key={c.account_number} value={c.account_number}>{c.first_name} {c.last_name} ({c.account_number})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="small text-muted mb-1 block">Usage (kl)</label>
                    <input type="number" className="input-field" value={manualUsage.units} onChange={e => setManualUsage({ ...manualUsage, units: e.target.value })} placeholder="0" />
                  </div>
                  <div className="input-group">
                    <label className="small text-muted mb-1 block">Date</label>
                    <input type="date" className="input-field" value={manualUsage.date} onChange={e => setManualUsage({ ...manualUsage, date: e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ justifyContent: 'center' }}>Record Reading</button>
                {usageMsg && <p className="text-success small fw-600 mt-2"><Check size={14} /> {usageMsg}</p>}
              </form>
            </div>
            <div className="glass-card" style={{ gridColumn: 'span 2', height: '400px' }}>
              <div className="stat-header mb-4"><h3>Revenue by District</h3><BarChartIcon className="text-muted" /></div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={districtReports}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="district" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="total_revenue" fill="var(--secondary)" name="Revenue (LSL)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card" style={{ height: '400px' }}>
              <div className="stat-header mb-4"><h3>Broadcast System</h3><Bell className="text-muted" /></div>
              <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select value={broadcastType} onChange={e => setBroadcastType(e.target.value)} className="input-field">
                  <option value="System Update">⚙️ System Update</option>
                  <option value="Urgent Notice">🔴 Urgent Notice</option>
                </select>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  placeholder="Global message..." 
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                ></textarea>
                <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={isBroadcasting}>Send Broadcast</button>
              </form>
            </div>
          </div>
          <div className="stats-grid mb-6">
            <div className="glass-card mb-6" style={{ borderLeft: '4px solid var(--secondary)' }}>
              <div className="stat-header mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                    <Users className="text-secondary" size={20} />
                  </div>
                  <h3>Customer Directory</h3>
                </div>
              </div>
              <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
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
                          <span className={`badge ${c.customer_type === 'Industrial' ? 'error' : (c.customer_type === 'Commercial' ? 'warning' : 'success')}`} style={{ opacity: 0.8 }}>
                            {c.customer_type}
                          </span>
                        </td>
                        <td className="text-right">
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn small" onClick={() => setEditingCustomer(c)} style={{ background: 'rgba(255,255,255,0.1)' }}><Settings size={14} /></button>
                            <button className="btn small" onClick={() => handleDeleteCustomer(c.account_number)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}><LogOut size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={`mt-8 p-6 ${editingCustomer ? 'edit-mode-active' : ''}`} style={{
                background: editingCustomer ? 'rgba(14, 165, 233, 0.03)' : 'rgba(255,255,255,0.02)',
                borderRadius: '20px',
                border: editingCustomer ? '1px solid var(--primary)' : '1px solid transparent',
                boxShadow: editingCustomer ? '0 0 20px rgba(14, 165, 233, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <div className="flex-between mb-4">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {editingCustomer ? <Settings size={18} className="text-primary" /> : <UserPlus size={18} className="text-primary" />}
                    {editingCustomer ? `Editing Account: ${editingCustomer.account_number}` : 'Onboard New Customer'}
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
                  <button className={`btn ${editingCustomer ? 'btn-primary' : 'btn-success'}`} style={{ gridColumn: 'span 2', marginTop: '1rem', height: '50px', fontSize: '1rem' }}>
                    {editingCustomer ? 'Confirm Updates' : 'Onboard Customer'}
                  </button>
                </form>
              </div>
            </div>
            <div className="glass-card mb-6" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div className="stat-header mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                    <CreditCard className="text-warning" size={20} />
                  </div>
                  <h3>Billing Rate Configuration</h3>
                </div>
              </div>
              <div className="table-container mb-6" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <table className="data-table">
                  <thead><tr><th>Tier Name</th><th>Usage Range (Units)</th><th>Rate (LSL/Unit)</th><th className="text-right">Management</th></tr></thead>
                  <tbody>
                    {rates.map(r => (
                      <tr key={r.rate_id} style={{ background: editingRate?.rate_id === r.rate_id ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                        <td><strong className="text-main">{r.tier_name}</strong></td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)' }}>
                            {r.minimum_units} — {r.maximum_units > 9999 ? '∞' : r.maximum_units}
                          </span>
                        </td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{parseFloat(r.rate_per_unit).toFixed(2)}</td>
                        <td className="text-right">
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn small" onClick={() => startEditRate(r)} style={{ background: 'rgba(255,255,255,0.1)' }}><Settings size={14} /></button>
                            <button className="btn small" onClick={() => handleDeleteRate(r.rate_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}><LogOut size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={`p-6 ${editingRate ? 'edit-mode-active' : ''}`} style={{
                background: editingRate ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255,255,255,0.02)',
                borderRadius: '20px',
                border: editingRate ? '1px solid var(--warning)' : '1px solid transparent',
                boxShadow: editingRate ? '0 0 20px rgba(245, 158, 11, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <div className="flex-between mb-4">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={18} className="text-warning" />
                    {editingRate ? `Modifying Tier: ${editingRate.tier_name}` : 'Define New Rate Tier'}
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
                  <button className={`btn ${editingRate ? 'btn-warning' : 'btn-primary'}`} style={{ gridColumn: 'span 4', height: '48px' }}>
                    {editingRate ? 'Commit Rate Changes' : 'Publish Rate Tier'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="glass-card mb-6" style={{ borderTop: '4px solid var(--primary)' }}>
            <div className="stat-header mb-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                  <History className="text-primary" size={20} />
                </div>
                <h3>System Audit Logs</h3>
              </div>
            </div>
            <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Timestamp</th><th>Performed By</th><th>Action</th><th>Target</th><th>Details</th></tr>
                </thead>
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

      {view === 'customer' && (
        <>
          <div className="stats-grid mb-6">
            <div className="glass-card" style={{ gridColumn: 'span 2', height: '400px' }}>
              <div className="stat-header mb-4"><h3>Usage Trends</h3><Activity className="text-muted" /></div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={bills.filter(b => b.account_number === user.account_number).reverse().slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="billing_month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="units_used" fill="var(--primary)" name="Units Used" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card">
              <div className="stat-header mb-4"><h3>Report a Leakage</h3><AlertTriangle className="text-warning" /></div>
              <form onSubmit={handleReportLeakage} className="grid grid-cols-1 gap-4">
                <input className="input-field" placeholder="Exact Location (e.g. Maseru West Plot 123)" value={leakageLocation} onChange={e => setLeakageLocation(e.target.value)} required />
                <textarea className="input-field" placeholder="Description of the leakage..." rows={3} value={leakageDesc} onChange={e => setLeakageDesc(e.target.value)} />
                <button className="btn btn-primary" style={{ justifyContent: 'center' }}>Submit Report</button>
              </form>
              {leakageMsg && <p className="text-success small mt-2 fw-600">{leakageMsg}</p>}
            </div>
            <div className="glass-card">
              <div className="stat-header mb-4"><h3>Update My Profile</h3><Settings className="text-muted" /></div>
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 gap-3">
                <input className="input-field" value={user.email} onChange={e => setUser({...user, email: e.target.value})} placeholder="Email" />
                <input className="input-field" value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} placeholder="Phone" />
                <button className="btn btn-primary" style={{ justifyContent: 'center' }}>Save Changes</button>
              </form>
            </div>
          </div>
          <div className="glass-card mb-6">
            <h2 className="mb-4">My Leakage Reports Status</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Date</th><th>Location</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {leakages.filter(l => l.account_number === user.account_number).length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted">You haven't reported any leakages.</td></tr>
                  ) : (
                    leakages.filter(l => l.account_number === user.account_number).map(l => (
                      <tr key={l.report_id}>
                        <td>{new Date(l.report_date).toLocaleDateString()}</td>
                        <td>{l.location}</td>
                        <td>
                          <span className={`badge ${l.status === 'Reported' ? 'unpaid' : l.status === 'Fixed' ? 'paid' : 'pending'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="small text-muted">{l.description || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ALL VIEWS: Bills Table */}
      <div className="glass-card mb-6">
        <div className="flex-between mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>{view === 'customer' ? 'My Billing History' : 'All Customers Billing Records'}</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['All', 'Paid', 'Unpaid'].map(status => (
                <button
                  key={status}
                  className={`badge ${billStatusFilter === status ? (status === 'Paid' ? 'paid' : (status === 'Unpaid' ? 'unpaid' : 'primary')) : ''}`}
                  onClick={() => setBillStatusFilter(status)}
                  style={{ cursor: 'pointer', border: '1px solid var(--glass-border)', padding: '0.3rem 0.8rem' }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <button className="btn" onClick={() => fetchData(user.role.toLowerCase(), user.account_number)} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>Refresh Data</button>
        </div>

        {loading ? (
          <div className="skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '40px', width: '100%' }}></div>
            <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
            <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
            <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {view !== 'customer' && <th>Account</th>}
                  <th>Month</th>
                  <th>Units Used</th>
                  <th>Amount (LSL)</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedBills.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted">No records found.</td></tr>
                ) : (
                  displayedBills.map((bill, idx) => (
                    <tr key={`${bill.account_number}-${bill.billing_month}-${idx}`}>
                      {view !== 'customer' && <td><strong>{bill.account_number}</strong></td>}
                      <td>{bill.billing_month}</td>
                      <td>{bill.units_used} units</td>
                      <td style={{ fontWeight: 600 }}>{parseFloat(bill.total_amount).toFixed(2)}</td>
                      <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                      <td><span className={`badge ${bill.payment_status === 'Paid' ? 'paid' : 'unpaid'}`}>{bill.payment_status}</span></td>
                      <td className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
                        {bill.payment_status === 'Unpaid' && view !== 'manager' && (
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handlePay(bill.account_number, bill.billing_month, bill.total_amount)}>
                            Pay
                          </button>
                        )}
                        <button className="btn" style={{ padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.05)' }} onClick={() => { setBillToPrint(bill); setTimeout(() => window.print(), 100); setTimeout(() => setBillToPrint(null), 1000); }}>
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ALL VIEWS: Payments History (from SQLite) */}
      <div className="glass-card mb-6">
        <h2 className="mb-4"><History size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Payment History</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th>{view !== 'customer' && <th>Account</th>}<th>Bill Month</th><th>Method</th><th>Reference</th><th>Amount (LSL)</th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={view !== 'customer' ? 6 : 5} className="text-center text-muted">No payments found.</td></tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                    {view !== 'customer' && <td><strong>{p.account_number}</strong></td>}
                    <td>{p.bill_month}</td>
                    <td>{p.payment_method}</td>
                    <td><span className="text-muted">{p.reference_number}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{parseFloat(p.amount_paid).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN/MANAGER: Leakages Table */}
      {(view === 'admin' || view === 'manager') && (
        <div className="glass-card" style={{ borderTop: '4px solid var(--error)' }}>
          <div className="stat-header mb-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                <AlertTriangle className="text-error" size={20} />
              </div>
              <h2 style={{ margin: 0 }}>Incident & Leakage Management</h2>
            </div>
          </div>
          <div className="table-container" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            <table>
              <thead>
                <tr><th>Report Date</th><th>Account No.</th><th>Physical Location</th><th>Incident Description</th><th className="text-right">Current Status</th></tr>
              </thead>
              <tbody>
                {leakages.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted p-8">No active incidents reported.</td></tr>
                ) : (
                  leakages.map((l, i) => (
                    <tr key={i}>
                      <td><span className="text-muted">{new Date(l.report_date).toLocaleDateString()}</span></td>
                      <td><strong className="text-main">{l.account_number}</strong></td>
                      <td>{l.location}</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.description}</td>
                      <td className="text-right">
                        {view === 'manager' ? (
                          <span className={`badge ${l.status === 'Fixed' ? 'success' : (l.status === 'Investigating' ? 'warning' : 'unpaid')}`}>
                            {l.status}
                          </span>
                        ) : (
                          <select
                            className={`badge ${l.status === 'Fixed' ? 'success' : (l.status === 'Investigating' ? 'warning' : 'unpaid')}`}
                            value={l.status}
                            onChange={(e) => handleUpdateLeakage(l.report_id, e.target.value)}
                            style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontWeight: 600, padding: '0.2rem 0.5rem' }}
                          >
                            <option value="Reported">Reported</option>
                            <option value="Pending">Pending</option>
                            <option value="Investigating">Investigating</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Fixed">Fixed</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

    </div>
  );
}
