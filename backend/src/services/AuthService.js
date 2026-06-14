import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";

export class AuthService {
  async signup(name, email, password, accommodationId, gender) {
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
      ...(gender !== undefined ? { gender } : {}),
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async updateProfile(userId, { name, photoUrl, bio, gender }) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const updated = await UserRepository.updateById(userId, {
      ...(name !== undefined ? { name } : {}),
      ...(photoUrl !== undefined ? { photoUrl } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(gender !== undefined ? { gender } : {}),
    });

    return this.toProfileDTO(updated);
  }

  async login(email, password) {
    const userWithPassword = await UserRepository.findByEmailWithPassword(
      email.toLowerCase().trim()
    );

    if (!userWithPassword) {
      throw new Error("Invalid credentials");
    }

    if (!userWithPassword.password) {
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
    const avatarUrl =
      user.photoUrl ||
      `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accommodationId: user.accommodationId,
      photoUrl: avatarUrl,
      bio: user.bio || "",
      gender: user.gender || "prefer_not_to_say",
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
