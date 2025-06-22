const { PrismaClient } = require("@prisma/client");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient()
async function Register(req, res) {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (existingUser) return res.status(400).json({
      message: 'Email already in use'
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword }
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}

async function Login(req, res) {
  try {
    const { user_email, user_password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: user_email
      }
    });

    if (!user) return res.status(404).json({
      message: 'User not found'
    });

    const valid = await bcrypt.compare(user_password, user.password);

    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, 'SECRET_KEY', { expiresIn: '7d' });

    const { password, createdAt, updatedAt, ...rest } = user

    res.json({ message: 'Login successful', data: rest, token });
  } catch (error) {
    res.status(500).json({ message: 'Error Login', error: error.message });
  }
}

module.exports = {
  Register,
  Login
}