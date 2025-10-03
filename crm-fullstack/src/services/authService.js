const { prisma } = require('../config/database');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
 
exports.registerUser = async ({ email, password, name, profilePicture }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER',
      profilePicture,  
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profilePicture: true,
      createdAt: true,
    },
  });
};

 
exports.loginUser = async ({ email, password, isOAuth = false }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

   
  if (!isOAuth) {
    
    if (!user.password) {
      throw new Error('Please login with Google. This account was created using Google Sign-In.');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
  } 

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const decoded = jwt.decode(refreshToken);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role, 
      profilePicture: user.profilePicture || null 
    },
  };
};
exports.logoutUser = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token required');

  try {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
  } catch {
    throw new Error('Invalid or already revoked refresh token');
  }
};