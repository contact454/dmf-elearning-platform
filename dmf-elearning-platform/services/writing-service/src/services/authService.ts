import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/connection';

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export class AuthService {
  async register(email: string, password: string, name?: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        tier: 'free',
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        tier: user.tier 
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        tier: user.tier 
      },
      token,
    };
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
