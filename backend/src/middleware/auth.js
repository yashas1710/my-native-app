import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";

export default async function auth(
  req,
  res,
  next
) {
  try {
    const header =
      req.headers.authorization || "";

    const token = header.startsWith(
      "Bearer "
    )
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ||
          "dev-secret"
      );
    } catch (err) {
      return res.status(401).json({
        error:
          "Invalid or expired token",
      });
    }

    const user =
      await UserRepository.findById(
        decoded.id
      );

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      accommodationId:
        user.accommodationId,
      ...user,
    };

    next();
  } catch (err) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      err
    );

    return res.status(500).json({
      error: "Authentication error",
    });
  }
}