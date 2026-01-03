import { Request, Response } from "express";
import { authService } from "../service/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const result = await authService.register(name, email, password);
    
    res.status(201).json({
      message: "Account created successfully",
      ...result
    });
  } catch (err: any) {
    if (err.message === "Email already registered") {
      return res.status(409).json({ message: err.message });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await authService.login(email, password);
    
    res.json({
      message: "Login successful",
      ...result
    });
  } catch (err: any) {
    if (err.message === "Invalid email or password") {
      return res.status(401).json({ message: err.message });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // User is attached by auth middleware
    const user = (req as any).user;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to get user info" });
  }
};
