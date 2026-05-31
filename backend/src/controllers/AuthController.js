import AuthService from "../services/AuthService.js";
import { validateInput, signupSchema, loginSchema } from "../validators/authValidator.js";

export class AuthController {
  async signup(req, res) {
    try {
      console.log("📝 Signup request:", req.body);
      
      // Validate input
      const validation = validateInput(signupSchema, req.body);
      if (!validation.success) {
        console.log("❌ Validation failed:", validation.errors);
        return res.status(400).json({ errors: validation.errors });
      }

      const { name, email, password, accommodationId } = validation.data;

      const { user, token } = await AuthService.signup(
        name,
        email,
        password,
        accommodationId
      );

      res.json({
        message: "Signup successful",
        token,
        user: AuthService.toProfileDTO(user),
      });
    } catch (err) {
      console.error("❌ Signup error:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      // Validate input
      const validation = validateInput(loginSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.errors });
      }

      const { email, password } = validation.data;

      const { user, token } = await AuthService.login(email, password);

      res.json({
        message: "Login successful",
        token,
        user: AuthService.toProfileDTO(user),
      });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  async getMe(req, res) {
    try {
      const user = req.user; // From auth middleware
      res.json({
        user: AuthService.toProfileDTO(user),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, photoUrl, bio } = req.body;

      const user = await AuthService.updateProfile(req.user.id, {
        name,
        photoUrl,
        bio,
      });

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new AuthController();
