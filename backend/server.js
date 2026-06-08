const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'innexafit_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Database Connection - PostgreSQL in production, SQLite for local dev
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  });
  console.log('Using PostgreSQL database (production)');
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
  });
  console.log('Using SQLite database (local development)');
}

// Database Models
const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false }, // ADMIN, COACH, CLIENT
  username: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  birthDate: { type: DataTypes.STRING },
  planType: { type: DataTypes.STRING, defaultValue: 'Pending' },
  pricePaid: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  startDate: { type: DataTypes.STRING },
  expiryDate: { type: DataTypes.STRING },
  parentCoachId: { type: DataTypes.STRING }, // Used for clients to map to coach
});

const WorkoutPlan = sequelize.define('WorkoutPlan', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  clientEmail: { type: DataTypes.STRING },
  exercises: { type: DataTypes.TEXT }, // JSON array of exercises
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

const NutritionPlan = sequelize.define('NutritionPlan', {
  id: { type: DataTypes.STRING, primaryKey: true },
  dayName: { type: DataTypes.STRING },
  sessionTitle: { type: DataTypes.STRING },
  dateAssigned: { type: DataTypes.STRING },
  clientEmail: { type: DataTypes.STRING },
  meals: { type: DataTypes.TEXT }, // JSON array of meals
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  clientFeedbackNotes: { type: DataTypes.TEXT }
});

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.STRING, primaryKey: true },
  clientEmail: { type: DataTypes.STRING },
  packageName: { type: DataTypes.STRING },
  amount: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING }
});

const CheckIn = sequelize.define('CheckIn', {
  id: { type: DataTypes.STRING, primaryKey: true },
  clientEmail: { type: DataTypes.STRING },
  weight: { type: DataTypes.FLOAT },
  date: { type: DataTypes.STRING }
});

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.STRING, primaryKey: true },
  action: { type: DataTypes.TEXT, allowNull: false },
  timestamp: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'info' }
});

const SubscriptionPackage = sequelize.define('SubscriptionPackage', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  durationMonths: { type: DataTypes.INTEGER, defaultValue: 1 },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  coachId: { type: DataTypes.STRING, allowNull: false }
});

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.STRING, primaryKey: true },
  senderId: { type: DataTypes.STRING, allowNull: false },
  receiverId: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  timestamp: { type: DataTypes.STRING, allowNull: false }
});

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Helper to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Seed Default Users
async function seedDefaultUsers() {
  const count = await User.count();
  if (count === 0) {
    const coachPassword = await bcrypt.hash('123456', 10);
    const clientPassword = await bcrypt.hash('123456', 10);
    const adminPassword = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      {
        id: 'mock-coach-id',
        name: 'Coach Innexa',
        email: 'coach@innexafit.com',
        password: coachPassword,
        role: 'COACH',
        username: 'coach_innexa@innexafit.com',
        phone: '+20123456789',
        gender: 'Male',
        birthDate: '1990-05-15',
        planType: 'Yearly',
        pricePaid: 399,
        status: 'Active',
        startDate: '2026-01-01',
        expiryDate: '2027-01-01'
      },
      {
        id: 'mock-client-id',
        name: 'John Doe',
        email: 'client@innexafit.com',
        password: clientPassword,
        role: 'CLIENT',
        username: 'johndoe@innexafit.com',
        phone: '+2019999999',
        gender: 'Male',
        birthDate: '1998-10-10',
        planType: 'Free',
        pricePaid: 0,
        status: 'Active',
        startDate: '2026-06-01',
        expiryDate: '2026-07-01',
        parentCoachId: 'mock-coach-id'
      },
      {
        id: 'mock-admin-id',
        name: 'Platform Owner',
        email: 'admin@innexafit.com',
        password: adminPassword,
        role: 'ADMIN',
        username: 'admin_innexa@innexafit.com',
        phone: '+2010000000',
        gender: 'Male',
        birthDate: '1985-08-20',
        planType: 'Lifetime',
        pricePaid: 0,
        status: 'Active',
        startDate: '2026-01-01',
        expiryDate: '2030-01-01'
      }
    ]);
    console.log('seeded default users successfully');
  }
}

// REST Routes

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, username, phone, gender, birthDate } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user-' + Math.random().toString(36).substr(2, 9);

    const newUser = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      username,
      phone,
      gender,
      birthDate,
      planType: role === 'COACH' ? 'Pending' : 'Free',
      status: role === 'COACH' ? 'Pending' : 'Active',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days
    });

    const accessToken = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, username: newUser.username },
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, username: user.username },
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ accessToken });
  });
});

app.get('/api/auth/verify', (req, res) => {
  res.json({ message: 'Email verification successfully simulated!' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ message: 'Password reset instructions sent!' });
});

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ fileUrl, fileName: req.file.filename });
});

// Workouts
app.get('/api/workouts', authenticateToken, async (req, res) => {
  try {
    let list;
    if (req.user.role === 'COACH') {
      list = await WorkoutPlan.findAll();
    } else {
      list = await WorkoutPlan.findAll({ where: { clientEmail: req.user.email } });
    }
    const formatted = list.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      clientEmail: item.clientEmail,
      exercises: JSON.parse(item.exercises || '[]'),
      createdAt: item.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const { id, name, description, clientEmail, exercises } = req.body;
    const plan = await WorkoutPlan.create({
      id: id || 'wrk-' + Math.random().toString(36).substr(2, 9),
      name,
      description,
      clientEmail,
      exercises: JSON.stringify(exercises || [])
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Nutrition
app.get('/api/nutrition', authenticateToken, async (req, res) => {
  try {
    let list;
    if (req.user.role === 'COACH') {
      list = await NutritionPlan.findAll();
    } else {
      list = await NutritionPlan.findAll({ where: { clientEmail: req.user.email } });
    }
    const formatted = list.map(item => ({
      id: item.id,
      dayName: item.dayName,
      sessionTitle: item.sessionTitle,
      dateAssigned: item.dateAssigned,
      clientEmail: item.clientEmail,
      meals: JSON.parse(item.meals || '[]'),
      isCompleted: item.isCompleted,
      clientFeedbackNotes: item.clientFeedbackNotes
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/nutrition', authenticateToken, async (req, res) => {
  try {
    const { id, dayName, sessionTitle, dateAssigned, clientEmail, meals } = req.body;
    const plan = await NutritionPlan.create({
      id: id || 'nut-' + Math.random().toString(36).substr(2, 9),
      dayName,
      sessionTitle,
      dateAssigned,
      clientEmail,
      meals: JSON.stringify(meals || [])
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Payments
app.post('/api/payments/checkout', authenticateToken, async (req, res) => {
  try {
    const { packageName, amount } = req.body;
    const txn = await Transaction.create({
      id: 'txn-' + Math.random().toString(36).substr(2, 9),
      clientEmail: req.user.email,
      packageName,
      amount,
      status: 'Paid',
      date: new Date().toISOString().split('T')[0]
    });
    res.status(201).json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clients Checkins
app.post('/api/clients/checkins', authenticateToken, async (req, res) => {
  try {
    const { weight } = req.body;
    const dateStr = new Date().toISOString().split('T')[0];
    const log = await CheckIn.create({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      clientEmail: req.user.email,
      weight,
      date: dateStr
    });

    // Find coach id of this client to notify them
    const clientUser = await User.findOne({ where: { email: req.user.email } });
    if (clientUser && clientUser.parentCoachId) {
      io.to(clientUser.parentCoachId).emit('notification', {
        title: 'New Weight Check-in',
        message: `${clientUser.name} logged their weight today: ${weight} kg`
      });
    }

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Generators Mockup
app.post('/api/ai/workout', authenticateToken, (req, res) => {
  const { goal, trainingDays } = req.body;
  res.json({
    data: {
      name: `AI generated ${goal} Plan`,
      description: `Custom ${goal} program optimized for ${trainingDays} sessions/week`,
      exercises: [
        {
          name: 'Barbell Squats',
          category: 'Legs',
          notes: 'Focus on full depth and straight chest.',
          sets: [
            { setNumber: 1, targetReps: 12, targetWeight: 60, targetRest: 90, isCompleted: false },
            { setNumber: 2, targetReps: 10, targetWeight: 70, targetRest: 90, isCompleted: false },
            { setNumber: 3, targetReps: 8, targetWeight: 80, targetRest: 90, isCompleted: false }
          ]
        },
        {
          name: 'Dumbbell Bench Press',
          category: 'Chest',
          notes: 'Keep elbows tucked at a 45-degree angle.',
          sets: [
            { setNumber: 1, targetReps: 12, targetWeight: 20, targetRest: 90, isCompleted: false },
            { setNumber: 2, targetReps: 10, targetWeight: 24, targetRest: 90, isCompleted: false },
            { setNumber: 3, targetReps: 8, targetWeight: 28, targetRest: 90, isCompleted: false }
          ]
        }
      ]
    }
  });
});

app.post('/api/ai/nutrition', authenticateToken, (req, res) => {
  const { goal, calories } = req.body;
  res.json({
    data: {
      dayName: 'Day 1',
      sessionTitle: `AI generated nutrition plan (${goal})`,
      meals: [
        {
          name: 'Breakfast (وجبة فطور)',
          time: '08:00 AM',
          alternatives: 'بديل الشوفان: 60 جرام توست بني أو 200 جرام بطاطا حلوة.',
          foods: [
            { id: 'f1', name: 'Rolled Oats (شوفان)', amount: '60g', calories: 230, protein: 8, carbs: 40, fats: 4 },
            { id: 'f2', name: 'Eggs Whites (بياض بيض)', amount: '5 Large', calories: 85, protein: 18, carbs: 1, fats: 0 }
          ]
        },
        {
          name: 'Lunch (وجبة غداء)',
          time: '02:00 PM',
          alternatives: 'بديل صدور الدجاج: 200 جرام لحم بقري قليل الدهن أو 250 جرام تونة مصفاة.',
          foods: [
            { id: 'f3', name: 'Grilled Chicken Breast (صدور دجاج)', amount: '200g', calories: 330, protein: 62, carbs: 0, fats: 7 },
            { id: 'f4', name: 'Basmati Rice cooked (أرز بسمتي)', amount: '150g', calories: 195, protein: 4.5, carbs: 42, fats: 0.5 }
          ]
        }
      ]
    }
  });
});

// ==========================================
// FULL-STACK API ENDPOINTS
// ==========================================

// ADMIN: Get all coaches
app.get('/api/admin/coaches', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const coaches = await User.findAll({ where: { role: 'COACH' } });
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Update coach details (activate, change plan, extend expiration)
app.put('/api/admin/coaches/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { status, planType, pricePaid, expiryDate, startDate, name } = req.body;

    const coach = await User.findByPk(id);
    if (!coach) return res.status(404).json({ message: 'Coach not found' });

    if (status) coach.status = status;
    if (planType) coach.planType = planType;
    if (pricePaid !== undefined) coach.pricePaid = pricePaid;
    if (expiryDate) coach.expiryDate = expiryDate;
    if (startDate) coach.startDate = startDate;
    if (name) coach.name = name;

    await coach.save();
    res.json(coach);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Get all clients
app.get('/api/admin/clients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const clients = await User.findAll({ where: { role: 'CLIENT' } });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Get platform audit logs
app.get('/api/admin/logs', authenticateToken, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Log action
app.post('/api/admin/logs', authenticateToken, async (req, res) => {
  try {
    const { action, type } = req.body;
    const log = await AuditLog.create({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action,
      timestamp: new Date().toISOString(),
      type: type || 'info'
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// COACH: Search for client by email/username/phone
app.get('/api/coach/search-client', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'COACH') return res.status(403).json({ message: 'Forbidden' });
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query parameter is required' });

    const client = await User.findOne({
      where: {
        role: 'CLIENT',
        [Op.or]: [
          { email: query },
          { username: query },
          { phone: query }
        ]
      }
    });

    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// COACH: Get clients
app.get('/api/coach/clients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'COACH') return res.status(403).json({ message: 'Forbidden' });
    const clients = await User.findAll({ where: { parentCoachId: req.user.id } });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// COACH: Add or link client
app.post('/api/coach/clients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'COACH') return res.status(403).json({ message: 'Forbidden' });
    const { name, email, phone, gender, birthDate, packageName, pricePaid, status } = req.body;

    let client = await User.findOne({ where: { email } });
    if (client) {
      client.parentCoachId = req.user.id;
      if (packageName) client.planType = packageName;
      if (pricePaid !== undefined) client.pricePaid = pricePaid;
      if (status) client.status = status;
      await client.save();
    } else {
      const password = await bcrypt.hash('123456', 10);
      client = await User.create({
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        password,
        role: 'CLIENT',
        username: email.split('@')[0] + '@innexafit.com',
        phone,
        gender,
        birthDate,
        planType: packageName || 'Free',
        pricePaid: pricePaid || 0,
        status: status || 'Active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        parentCoachId: req.user.id
      });
    }
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// COACH: Get packages
app.get('/api/coach/packages', authenticateToken, async (req, res) => {
  try {
    const coachId = req.user.role === 'COACH' ? req.user.id : 'mock-coach-id';
    const packages = await SubscriptionPackage.findAll({ where: { coachId } });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// COACH: Create packages
app.post('/api/coach/packages', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'COACH') return res.status(403).json({ message: 'Forbidden' });
    const { name, durationMonths, price, description } = req.body;
    const pkg = await SubscriptionPackage.create({
      id: 'pkg-' + Math.random().toString(36).substr(2, 9),
      name,
      durationMonths: durationMonths || 1,
      price: price || 0,
      description,
      coachId: req.user.id
    });
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CLIENT: Get coach details
app.get('/api/client/coach', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'CLIENT') return res.status(403).json({ message: 'Forbidden' });
    const clientUser = await User.findByPk(req.user.id);
    if (!clientUser || !clientUser.parentCoachId) {
      return res.status(404).json({ message: 'No coach assigned yet' });
    }
    const coach = await User.findByPk(clientUser.parentCoachId);
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    
    res.json({
      id: coach.id,
      name: coach.name,
      email: coach.email,
      phone: coach.phone
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHAT: Get message history
app.get('/api/messages/:receiverId', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;
    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    
    // Format to match frontend structure: { id, sender: 'client'|'coach', text, timestamp }
    const formatted = messages.map(msg => ({
      id: msg.id,
      sender: msg.senderId === senderId ? 
        (req.user.role === 'CLIENT' ? 'client' : 'coach') : 
        (req.user.role === 'CLIENT' ? 'coach' : 'client'),
      text: msg.text,
      timestamp: msg.timestamp
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHAT: Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.id;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = await ChatMessage.create({
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      senderId,
      receiverId,
      text,
      timestamp: timeStr
    });

    // Socket.io dispatch
    io.to(receiverId).emit('receive_message', {
      id: msg.id,
      sender: req.user.role === 'CLIENT' ? 'client' : 'coach',
      text: msg.text,
      timestamp: msg.timestamp,
      senderId
    });

    res.status(201).json({
      id: msg.id,
      sender: req.user.role === 'CLIENT' ? 'client' : 'coach',
      text: msg.text,
      timestamp: msg.timestamp
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Socket.io Real-Time Communications
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket joined room: ${userId}`);
  });

  socket.on('send_message', (data) => {
    // data: { senderId, receiverId, text }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    io.to(data.receiverId).emit('receive_message', {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      sender: data.senderId === data.receiverId ? 'client' : 'coach',
      text: data.text,
      timestamp: timeStr
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Sync database and start server
sequelize.sync().then(async () => {
  await seedDefaultUsers();
  server.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
});
