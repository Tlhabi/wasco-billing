WASCO Online Water Billing Management System

PROJECT OVERVIEW AND OBJECTIVES 
The project aims to develop a distributed internet database to manage customer information, 
billing data (including water consumption rates), and payment history for water bills.
 You are to design modules for sending bill notifications to customers in all districts of Lesotho. 
 This project allows you to explore embedding queries to generate bills based on consumption and 
 track payment statuses, potentially integrating with online payment gateways.

1. Title of the System
WASCO Online Water Billing Management System

2. Table of Contents
1. Title of the System
2. Table of Contents
3. List of Figures
4. List of Tables
5. List of Abbreviations
6. Abstract
7. Introduction
   1.1 Problem Statement
   1.2 Problem Solving
   1.3 Objectives
   1.4 Scope & Constraint
8. Technologies Justification
   2.1 Web application technologies
   2.2 Database Management System
9. System Design
   3.1 Data Models
14. Conclusion
   4.1 Advantages of the System
   4.2 Future Enhancement of the System
   4.3 Potential Benefit
   4.4 Conclusion
15. References

3. List of Figures
Figure 1: ER Diagram of Heterogeneous Databases
Figure 2: Distributed Database Architecture

4. List of Tables
Table 1: MySQL `customers` table structure
Table 2: MySQL `bills` table structure
Table 3: SQLite `water_usage` table structure
Table 4: SQLite `payments` table structure

5. List of Abbreviations
WASCO - Water and Sewerage Company
DBMS - Database Management System
SQL - Structured Query Language
API - Application Programming Interface
GUI - Graphical User Interface

6. Abstract
This project presents the design and implementation of a distributed web-based database application for the Water and Sewerage Company (WASCO) in Lesotho. The system calculates water bills, tracks customer usage, records payment history, and provides secure role-based portals for customers, administrators, and branch managers. The project utilizes a heterogeneous distributed database model with MySQL for core customer and billing data, and SQLite for transient usage and payment logs.

7. Introduction
1.1 Problem Statement
Currently, tracking customer water consumption, processing bills manually, and keeping records of offline or unstructured payments lead to inefficiencies. Customers struggle to track their balances and report issues like leakages in a unified manner.

1.2 Problem Solving
The proposed solution is a centralized web database application that automatically calculates bills based on dynamic usage rates, stores records persistently across distributed databases, and provides user-friendly interfaces to enhance transparency for customers and WASCO staff.

1.3 Objectives
- To design a secure internet database managing customer, billing, and payment data.
- To use heterogeneous DBMS (MySQL and SQLite) to demonstrate distributed data management.
- To provide separate GUI portals for Customers, Admins, and Branch Managers.

1.4 Scope & Constraint
The scope includes billing calculation, user accounts, simulated online payment tracking, and leakage reporting. Constraints include the reliance on simulated API payments rather than live banking APIs due to testing limitations.

8. Technologies Justification
2.1 Web application technologies
- React (Vite): Used for the frontend due to its component-based architecture and rapid UI rendering.
- Node.js & Express: Used for the backend API because of its asynchronous handling capabilities, ideal for multiple concurrent database connections.

2.2 Database Management System
- MySQL: Chosen for its robustness, ACiD compliance, and suitability for structured relational data like `customers` and `bills`.
- SQLite: Chosen to demonstrate a distributed/heterogeneous environment. Used to log `water_usage` and `payments` rapidly without the overhead of a full database server.

9. System Design
3.1 Data Models
The system uses a distributed schema:
- MySQL (Core Node): `customers`, `billing_rates`, `bills`, `leakage_reports`, `user_accounts`
- SQLite (Edge Node): `water_usage`, `payments`, `notifications`
(See attached ER diagram `wasco_er_diagram.drawio` for the relationships).

14. Conclusion
4.1 Advantages of the System
- Automated bill calculations reduce human error.
- Heterogeneous database distribution improves fault tolerance.
- Role-based GUIs enhance user experience and administrative control.

4.2 Future Enhancement of the System
- Integration with real payment gateways (e.g., M-Pesa, EcoCash).
- Real-time IoT meter reading integration.

4.3 Potential Benefit
Enhanced revenue collection for WASCO, reduced customer disputes, and streamlined utility management 
for Lesotho's districts.

4.4 Conclusion
The WASCO billing system successfully meets the requirements of a modern web database application 
by combining embedded SQL, distributed architecture, and a responsive React frontend.

15. References
- Database Systems: The Complete Book, Garcia-Molina et al.
- Express JS & React Documentation.
