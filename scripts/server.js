const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const webpush = require('web-push');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));

app.get('/sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'sw.js'));
});

const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:adesonhuntiya@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let adminSubscription = null;

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adesonhuntiya@gmail.com',
    pass: 'srzmvytiisdbvmdq'
  }
});

const dbPath = path.join(__dirname, '../project-db.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database successfully.');
  }
});

app.get('/api/push-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/subscribe-admin', (req, res) => {
  adminSubscription = req.body;
  res.status(201).json({ message: 'Subscribed successfully!' });
});

app.get('/api/admin/admins', (req, res) => {
  db.all(`SELECT * FROM admins`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.json(rows || []);
  });
});

app.get('/api/admin/users', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.json(rows || []);
  });
});

app.get('/api/admin/orders', (req, res) => {
  db.all(`SELECT * FROM userProducts ORDER BY Id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.get('/api/admin/helps', (req, res) => {
  db.all(`SELECT * FROM helps ORDER BY Id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/admin/send-code', async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  otpStore.set(email, {
    code: code,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  try {
    await transporter.sendMail({
      from: '"Admin Portal" <adesonhuntiya@gmail.com>',
      to: email,
      subject: 'Your Admin Verification Code',
      text: `Hello ${name}, your verification code is: ${code}. It expires in 5 minutes.`
    });

    res.json({ success: true, message: 'Verification code sent to email.' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send verification email.' });
  }
});

app.post('/api/admin/complete-registration', (req, res) => {
  const { name, email, password, code } = req.body;

  if (!name || !email || !password || !code) {
    return res.status(400).json({ error: 'All fields are required, return to the Registration page.' });
  }

  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ error: 'No code requested or session expired.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'Verification code has expired.' });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  otpStore.delete(email);

  const sql = `INSERT INTO admins (Name, Email, Password) VALUES (?, ?, ?)`;

  db.run(sql, [name, email, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email or Name already registered as admin.' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully!',
      adminId: this.lastID
    });
  });
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const sql = `INSERT INTO users (Name, Email, Password) VALUES (?, ?, ?)`;

  db.run(sql, [username, email, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email or name already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'User registered successfully!',
      userId: this.lastID
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Name and password are required.' });
  }

  const sql = `SELECT * FROM users WHERE Name = ? AND Password = ?`;

  db.get(sql, [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

app.post('/api/help', (req, res) => {
  const { Name, helpText } = req.body;

  if (!helpText) {
    return res.status(400).json({ error: 'Dont send empty texts...' });
  }

  const sql = `INSERT INTO helps (Name, Sentence) VALUES (?, ?)`;

  db.run(sql, [Name, helpText], async function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'You cant spam messages, wait until the admin respond.' });
      }
      return res.status(500).json({ error: err.message });
    }

    if (adminSubscription) {
      const host = req.protocol + '://' + req.get('host');
      const pushPayload = JSON.stringify({
        title: 'New Support Request.',
        body: `Help request from ${Name}!`,
        icon: `${host}/images/logo.png`
      });

      try {
        await webpush.sendNotification(adminSubscription, pushPayload);
      } catch (pushErr) {
        console.error('Failed to send push notification:', pushErr);
      }
    } else {
      console.log('Message saved to DB. Admin has not subscribed for notifications yet.');
    }

    res.status(201).json({
      message: 'Text sent successfully!',
      userId: this.lastID
    });
  });
});

app.put('/api/helpAgain', (req, res) => {
  const { Name, helpText, Reply } = req.body;

  if (!helpText) {
    return res.status(400).json({ error: 'Dont send empty texts...' });
  }

  const sql = `UPDATE helps SET Sentence = ?, Reply = ? WHERE Name = ?`;

  db.run(sql, [helpText, Reply, Name], async function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (adminSubscription) {
      const host = req.protocol + '://' + req.get('host');
      const pushPayload = JSON.stringify({
        title: 'New Support Request.',
        body: `Help request from ${Name}!`,
        icon: `${host}/images/logo.png`
      });

      try {
        await webpush.sendNotification(adminSubscription, pushPayload);
      } catch (pushErr) {
        console.error('Failed to send push notification:', pushErr);
      }
    } else {
      console.log('Message saved to DB. Admin has not subscribed for notifications yet.');
    }

    res.status(200).json({
      message: 'Text sent successfully!',
      rowsUpdated: this.changes
    });
  });
});

app.put('/api/answerHelpAdmin', (req, res) => {
  const { Name, Admin, ReplyMsg, Reply } = req.body;

  if (!ReplyMsg) {
    return res.status(400).json({ error: 'Dont send empty texts...' });
  }

  const sql = `UPDATE helps SET Admin = ?, Reply = ?, ReplyMsg = ? WHERE Name = ?`;

  db.run(sql, [Admin, Reply, ReplyMsg, Name], async function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({
      message: 'Text sent successfully!',
      rowsUpdated: this.changes
    });
  });
});

app.post('/api/answerHelp', (req, res) => {
  const { lastName } = req.body;

  const sql = `SELECT * FROM helps WHERE Name = ?`;

  db.get(sql, [lastName], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if(!user || user.Reply === 0) {
      return res.status(401).json({ message: 'Nvm.' });
    }

    res.status(200).json({
      message: 'Answer received.',
      user: user
    });
  });
});

app.post('/api/checkUser', (req, res) => {
  const { lastName } = req.body;

  const sql = `SELECT * FROM Users WHERE Name = ?`;

  db.get(sql, [lastName], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if(!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User found.',
      user: user
    });
  });
});

app.post('/api/checkAdmin', (req, res) => {
  const { adminName } = req.body;

  const sql = `SELECT * FROM admins WHERE Name = ?`;

  db.get(sql, [adminName], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if(!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User found.',
      user: user
    });
  });
});

app.post('/api/order', (req, res) => {
  const { Name, address, phone, cart, price } = req.body;

  if (!Name || !address || !phone || !cart || !price) {
    return res.status(400).json({ error: 'Something is missing...' });
  }

  const sql = `INSERT INTO userProducts (Name, Address, Phone, Cart, Price) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [Name, address, phone, JSON.stringify(cart), price], async function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (adminSubscription) {
      const host = req.protocol + '://' + req.get('host');
      const pushPayload = JSON.stringify({
        title: 'New Order Received!',
        body: `${Name} placed an order for $${price}!`,
        icon: `${host}/images/logo.png`
      });

      try {
        await webpush.sendNotification(adminSubscription, pushPayload);
      } catch (pushErr) {
        console.error('Failed to send push notification:', pushErr);
      }
    } else {
      console.log('Order saved to DB. Admin has not subscribed for notifications yet.');
    }

    res.status(201).json({
      message: 'Order sent successfully!',
      userId: this.lastID
    });
  });
});

app.post('/api/loginAdmin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Name and password are required.' });
  }

  const sql = `SELECT * FROM admins WHERE Name = ? AND Password = ?`;

  db.get(sql, [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

app.delete('/api/delete-help', (req, res) => {
  const {Name} = req.body;

  const sql = `DELETE FROM helps WHERE Name = ?`;

  db.run(sql, [Name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at Port: ${PORT}`);
});