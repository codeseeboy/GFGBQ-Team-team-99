import { Request, Response, NextFunction } from "express";
import { authService } from "../service/auth.service";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = authService.verifyToken(token);
    
    // Get user details
    const user = await authService.getUserById(decoded.userId);
    
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Optional auth - doesn't fail if no token, just doesn't set user
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = authService.verifyToken(token);
      const user = await authService.getUserById(decoded.userId);
      req.user = user;
      req.userId = decoded.userId;
    }
    
    next();
  } catch (err) {
    // Ignore auth errors for optional auth
    next();
  }
};
