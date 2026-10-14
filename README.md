# Expense Tracker - Modern Full-Stack MERN Application

A modern, responsive financial dashboard and expense management application built using the **MERN** stack (MongoDB, Express.js, React.js, and Node.js). Designed with a clean purple/indigo aesthetic, rounded cards, soft shadows, dark/light theme switching, and real database calculations.

---

## 🌟 Key Features

1. **Authentication & Security**
   - JWT-based authentication with bcrypt password hashing.
   - Protected API endpoints with ownership verification.
   - User profile settings & password change functionality.

2. **Dashboard Overview**
   - **4 Summary Cards**:
     - *Total Balance* (₹) = Total Income - Total Expenses, with % trend.
     - *Total Income* (₹) with month-over-month comparison.
     - *Total Expenses* (₹) with percentage shift.
     - *Budget Used* (%) with dynamic progress indicator.
   - **Interactive Charts (Recharts)**:
     - Monthly *Income vs Expenses* line chart with hover tooltips and year selector.
     - *Spending by Category* donut chart with percentage breakdown.
   - **Quick Add Transaction Modal** for instant income/expense logging.
   - Recent transaction activity table.

3. **Dedicated Transactions Management**
   - Complete CRUD operations (Add, Edit, Delete, View).
   - Real-time search by title, category, description, and amount.
   - Multi-field filters: Type (Income/Expense), Category, and custom Date Ranges.
   - Multi-direction sorting (Date, Amount) and pagination.

4. **Category Budget Tracking**
   - Create and edit monthly category budgets.
   - Spending calculated from actual expense records.
   - Warning indicators (80% warning threshold, 100%+ exceeded alerts).

5. **Financial Goals**
   - Create savings targets (e.g., Laptop, Emergency Fund).
   - Interactive deposits ("Add Money") updating current saved progress.
   - Percentage completion and remaining savings calculation.

6. **Loans & Debt Tracker**
   - Record Borrowed vs. Lent funds.
   - Principal, interest rate (% p.a.), due date, and repayment frequency.
   - Dedicated repayment logs with partial payment deductions.

7. **Reports & Analytics**
   - Summary metrics: Net Savings, Savings Rate (%), Highest Spending Category, Average Monthly Expenses.
   - Date range filters: Current Month, Previous Month, Last 3/6 Months, Current Year, Custom Range.
   - **Export to CSV**: Download complete transaction logs in one click.

8. **Settings & Preferences**
   - Currency display (₹ INR, $ USD, € EUR, £ GBP).
   - Light Mode & Dark Mode persistent toggle.
   - Profile name and email editing.

---

## 🚀 Running the Project

### Prerequisites
- **Node.js**: v18+ (tested on v22.14)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### 1. Backend Setup
```powershell
cd C:\Users\Lenovo\.gemini\antigravity\scratch\expense-tracker\server
npm install
npm run seed  # (Optional: seeds realistic test data with demo user alex@expensetracker.com)
npm start
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
```powershell
cd C:\Users\Lenovo\.gemini\antigravity\scratch\expense-tracker\client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 🔑 Demo Account Credentials
- **Email:** `alex@expensetracker.com`
- **Password:** `password123`
*(Or click "Sign Up" to register any new account)*
