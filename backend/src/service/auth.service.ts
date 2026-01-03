import jwt, { SignOptions } from "jsonwebtoken";
import { User, IUser } from "../model/User";

const JWT_SECRET = process.env.JWT_SECRET || "trustlayer-hackathon-secret-2026";
const JWT_EXPIRES_IN = "7d";

interface TokenPayload {
  userId: string;
  email: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email
  };
  
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
};

const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Create new user
  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    },
    token
  };
};

const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Find user with password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    },
    token
  };
};

const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

const getUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
};

export const authService = {
  register,
  login,
  verifyToken,
  getUserById,
  generateToken
};
