# PROJECT REPORT: DISTRIBUTED ONLINE WATER BILL MANAGEMENT SYSTEM
**Institution:** Academic Submission  
**System Name:** WASCO Distributed Billing Portal  
**Project Category:** Distributed Internet Databases  

---

## 1. Project Overview & Problem Definition
The **Water and Sewerage Company (WASCO)** of Lesotho requires a modern, scalable, and distributed system to manage customer billing, water consumption, and payment history. The previous manual or centralized systems faced challenges in data accessibility across different districts, leading to delays in bill notifications and inaccurate consumption tracking.

This project implements a **Distributed Heterogeneous Database System** designed to:
- Manage customer information across multiple districts.
- Calculate bills based on progressive consumption rates.
- Track payment history and outstanding balances.
- Provide real-time leakage reporting and automated notifications.

---

## 2. System Architecture
The application utilizes a **Heterogeneous Distributed Architecture** to optimize performance and data locality.

### 2.1 Technology Stack
- **Frontend:** React.js (Vite) with Lucide-React icons and Recharts for analytics.
- **Backend:** Node.js with Express middleware.
- **Database (Core Node):** **MySQL** – Used for central data persistence (Customers, Rates, Bills).
- **Database (Edge Node):** **SQLite** – Used for localized, high-frequency data (Water usage readings, Payment logs, Notifications).

### 2.2 Rationale for DBMS Choice
- **MySQL (Core):** Provides robust ACID compliance, high concurrency for multiple branch managers, and advanced features like Views and Triggers.
- **SQLite (Edge):** Chosen for its zero-configuration nature, making it ideal for simulating "district-level" edge nodes where a full server setup might not be feasible, ensuring local data remains available even if central connectivity is intermittent.

---

## 3. Database Design & Models
The system fragments data across two different database engines to demonstrate distributed management.

### 3.1 MySQL Schema (Core Node)
1. **customers:** `account_number`, `first_name`, `last_name`, `email`, `address`, `district`, `phone`, `customer_type`.
2. **billing_rates:** `tier_name`, `min_units`, `max_units`, `rate_per_unit`.
3. **bills:** `bill_id`, `account_number`, `billing_month`, `units_used`, `total_amount`, `payment_status`.
4. **leakage_reports:** `id`, `account_number`, `location`, `description`, `status`, `report_date`.
5. **user_accounts:** `user_id`, `username`, `password_hash`, `role`, `account_number`.

### 3.2 SQLite Schema (Edge Node)
1. **water_usage:** `account_number`, `billing_month`, `reading_date`, `units_used`.
2. **payments:** `account_number`, `bill_month`, `amount_paid`, `payment_date`, `reference_number`.
3. **notifications:** `account_number`, `message`, `is_read`, `created_at`.

---

## 4. Advanced SQL Implementation
To meet high-level academic requirements, several advanced SQL concepts were utilized:

### 4.1 Database Views
Three specialized views were created in MySQL to simplify complex reporting for Managers:
- `view_unpaid_bills`: Filters all bills with 'Unpaid' status for rapid debt collection.
- `view_customer_balances`: Aggregates total outstanding amounts per customer.
- `view_leakage_summary`: Provides a count of pending vs. resolved leakages.

### 4.2 Transaction Control Language (TCL)
The payment module utilizes **Transactions** to ensure data integrity across the distributed environment. When a customer pays:
1. A transaction begins in MySQL to update the `bills` status.
2. The payment record is inserted into SQLite.
3. If both succeed, the transaction is **COMMITTED**.
4. If either fails, the transaction is **ROLLED BACK**, preventing inconsistent data.

### 4.3 Database Triggers
A MySQL **After Insert Trigger** (`after_bill_insert`) was implemented on the `bills` table. It automatically generates a record in the `notifications` table whenever a new bill is created, ensuring customers are alerted immediately without requiring manual entry by staff.

---

## 5. Security & Access Control
- **Authentication:** All passwords are encrypted using the **Bcrypt** hashing algorithm before storage.
- **Role-Based Access Control (RBAC):**
    - **Customer:** Can view personal bills, pay online, and report leakages.
    - **Admin:** Manages billing rates and system-wide data.
    - **Branch Manager:** Accesses summative analytics, trends (Daily/Weekly/Monthly), and outstanding balance reports.

---

## 6. Conclusion
The WASCO Distributed Billing System successfully demonstrates the integration of heterogeneous databases with a modern web interface. By distributing data between MySQL and SQLite, the system achieves a balance between centralized control and local performance, meeting all specified project requirements.

---

## 7. How to Run the Project
1. **Database Setup:** 
   - Import `wasco_billing` schema into MySQL (Port 3306).
   - Run `node init-sqlite.js` in the backend folder.
   - Run `node setup-triggers.js` to initialize Advanced SQL features.
2. **Start Backend:** `cd backend && node server.js`
3. **Start Frontend:** `cd frontend && npm run dev`
