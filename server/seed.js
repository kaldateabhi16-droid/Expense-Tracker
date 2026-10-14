const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');
const Loan = require('./models/Loan');
const Settings = require('./models/Settings');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear test user if exists
    const demoEmail = 'alex@expensetracker.com';
    let user = await User.findOne({ email: demoEmail });

    if (user) {
      await Transaction.deleteMany({ user: user._id });
      await Budget.deleteMany({ user: user._id });
      await Goal.deleteMany({ user: user._id });
      await Loan.deleteMany({ user: user._id });
      await Settings.deleteMany({ user: user._id });
      await User.deleteOne({ _id: user._id });
      console.log('Cleared existing demo user data.');
    }

    user = await User.create({
      name: 'Alex Johnson',
      email: demoEmail,
      password: 'password123',
      currency: 'INR',
      theme: 'light',
    });

    console.log(`Created demo user: ${user.name} (${user.email})`);

    await Settings.create({
      user: user._id,
      currency: 'INR',
      theme: 'light',
      dateFormat: 'DD/MM/YYYY',
      defaultTransactionType: 'expense',
    });

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // Create realistic transactions across past months
    const sampleTransactions = [
      // Current Month Income
      {
        user: user._id,
        title: 'Monthly Tech Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: new Date(curYear, curMonth, 1),
        paymentMethod: 'Bank Transfer',
        description: 'Monthly payroll deposit',
      },
      {
        user: user._id,
        title: 'Freelance UI Design project',
        amount: 22500,
        type: 'income',
        category: 'Freelance',
        date: new Date(curYear, curMonth, 5),
        paymentMethod: 'UPI',
        description: 'Fintech dashboard design milestone 1',
      },
      // Current Month Expenses
      {
        user: user._id,
        title: 'Organic Food Market',
        amount: 4200,
        type: 'expense',
        category: 'Food',
        date: new Date(curYear, curMonth, 2),
        paymentMethod: 'UPI',
        description: 'Fresh vegetables and provisions',
      },
      {
        user: user._id,
        title: 'Apartment Electric & Water Bill',
        amount: 3200,
        type: 'expense',
        category: 'Bills',
        date: new Date(curYear, curMonth, 3),
        paymentMethod: 'Net Banking',
        description: 'Power and high-speed broadband bill',
      },
      {
        user: user._id,
        title: 'Metro Pass & Fuel',
        amount: 2400,
        type: 'expense',
        category: 'Transport',
        date: new Date(curYear, curMonth, 4),
        paymentMethod: 'Debit Card',
        description: 'Weekly transit recharge and fuel',
      },
      {
        user: user._id,
        title: 'Weekend Dining & Cafe',
        amount: 2850,
        type: 'expense',
        category: 'Food',
        date: new Date(curYear, curMonth, 6),
        paymentMethod: 'Credit Card',
        description: 'Dinner with college friends',
      },
      {
        user: user._id,
        title: 'Clothing & Lifestyle Shopping',
        amount: 5600,
        type: 'expense',
        category: 'Shopping',
        date: new Date(curYear, curMonth, 7),
        paymentMethod: 'Credit Card',
        description: 'Formal shirts and sports shoes',
      },
      {
        user: user._id,
        title: 'Streaming & Cinema Tickets',
        amount: 1450,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(curYear, curMonth, 8),
        paymentMethod: 'UPI',
        description: 'IMAX movie and subscriptions',
      },
      {
        user: user._id,
        title: 'Dental Checkup & Medicines',
        amount: 1800,
        type: 'expense',
        category: 'Healthcare',
        date: new Date(curYear, curMonth, 9),
        paymentMethod: 'UPI',
        description: 'Routine scaling and multivitamins',
      },

      // Previous Month Sample Data for trends
      {
        user: user._id,
        title: 'Previous Month Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: new Date(curYear, curMonth - 1, 1),
        paymentMethod: 'Bank Transfer',
      },
      {
        user: user._id,
        title: 'Groceries & Household',
        amount: 14200,
        type: 'expense',
        category: 'Food',
        date: new Date(curYear, curMonth - 1, 4),
        paymentMethod: 'UPI',
      },
      {
        user: user._id,
        title: 'Gadget Purchase',
        amount: 18500,
        type: 'expense',
        category: 'Shopping',
        date: new Date(curYear, curMonth - 1, 12),
        paymentMethod: 'Credit Card',
      },
      {
        user: user._id,
        title: 'Utility Bills',
        amount: 4100,
        type: 'expense',
        category: 'Bills',
        date: new Date(curYear, curMonth - 1, 15),
        paymentMethod: 'Net Banking',
      },

      // 2 Months Ago
      {
        user: user._id,
        title: 'Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: new Date(curYear, curMonth - 2, 1),
        paymentMethod: 'Bank Transfer',
      },
      {
        user: user._id,
        title: 'Expenses',
        amount: 28400,
        type: 'expense',
        category: 'Food',
        date: new Date(curYear, curMonth - 2, 10),
        paymentMethod: 'UPI',
      },
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`Inserted ${sampleTransactions.length} sample transactions.`);

    // Sample Budgets
    await Budget.create([
      {
        user: user._id,
        name: 'Dining & Provisions',
        category: 'Food',
        amount: 12000,
        period: 'monthly',
      },
      {
        user: user._id,
        name: 'Monthly Utilities',
        category: 'Bills',
        amount: 5000,
        period: 'monthly',
      },
      {
        user: user._id,
        name: 'Apparel & Tech Gear',
        category: 'Shopping',
        amount: 8000,
        period: 'monthly',
      },
      {
        user: user._id,
        name: 'Commute & Travel',
        category: 'Transport',
        amount: 4500,
        period: 'monthly',
      },
    ]);
    console.log('Inserted sample budgets.');

    // Sample Goals
    await Goal.create([
      {
        user: user._id,
        name: 'Emergency Reserve Fund',
        targetAmount: 250000,
        currentAmount: 145000,
        targetDate: new Date(curYear, 11, 31),
        description: '6 months of living expenses safely saved in liquid funds',
      },
      {
        user: user._id,
        name: 'M3 MacBook Pro 16"',
        targetAmount: 220000,
        currentAmount: 180000,
        targetDate: new Date(curYear, 8, 15),
        description: 'Next workstation upgrade for development and video workflows',
      },
      {
        user: user._id,
        name: 'Japan Autumn Trip',
        targetAmount: 180000,
        currentAmount: 65000,
        targetDate: new Date(curYear, 9, 20),
        description: 'Flights, Ryokan stays and culinary exploration in Tokyo & Kyoto',
      },
    ]);
    console.log('Inserted sample financial goals.');

    // Sample Loans
    await Loan.create([
      {
        user: user._id,
        name: 'Car Financing EMI',
        type: 'borrowed',
        principalAmount: 350000,
        interestRate: 8.5,
        loanDate: new Date(curYear - 1, 5, 10),
        dueDate: new Date(curYear + 2, 5, 10),
        outstandingAmount: 210000,
        repaymentFrequency: 'Monthly',
        notes: 'SBI Auto Loan, auto-debited on 10th of every month',
        repayments: [
          { amount: 15000, date: new Date(curYear, curMonth - 1, 10), note: 'Monthly EMI' },
          { amount: 15000, date: new Date(curYear, curMonth, 10), note: 'Monthly EMI' },
        ],
      },
      {
        user: user._id,
        name: 'Rohan Sharma (Colleague)',
        type: 'lent',
        principalAmount: 25000,
        interestRate: 0,
        loanDate: new Date(curYear, curMonth - 1, 14),
        dueDate: new Date(curYear, curMonth + 1, 30),
        outstandingAmount: 10000,
        repaymentFrequency: 'One-time',
        notes: 'Urgent medical assistance loan, promised return by next paycheck',
        repayments: [
          { amount: 15000, date: new Date(curYear, curMonth, 5), note: 'UPI Transfer partial repayment' },
        ],
      },
    ]);
    console.log('Inserted sample loans.');

    console.log('Database successfully seeded with realistic sample data!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
