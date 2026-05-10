import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";

export class AuthService {
  async signup(name, email, password, accommodationId) {
    const exists = await UserRepository.existsByEmail(email);
    if (exists) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      accommodationId,
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email, password) {
    const userWithPassword = await UserRepository.findByEmailWithPassword(
      email.toLowerCase().trim()
    );

    if (!userWithPassword) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(
      password,
      userWithPassword.password
    );

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    const user = { ...userWithPassword };
    delete user.password;

    const token = this.generateToken(user);

    return { user, token };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        accommodationId: user.accommodationId,
      },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  }

  toProfileDTO(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accommodationId: user.accommodationId,
      photoUrl: user.photoUrl || "",
      bio: user.bio || "",
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
