import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma";
import { config } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { RegisterInput, LoginInput } from "./auth.schema";
import { Role } from "@prisma/client";

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new AppError(400, "An account with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        companyName: data.companyName,
        phone: data.phone,
        role: data.role || Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        phone: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user) {
      throw new AppError(401, "Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, "Invalid email or password.");
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        phone: user.phone,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        phone: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new AppError(404, "User not found.");
    }
    return user;
  }

  private generateToken(payload: {
    id: string;
    email: string;
    name: string;
    role: Role;
    companyName?: string | null;
  }) {
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        companyName: payload.companyName,
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    );
  }
}

export const authService = new AuthService();
