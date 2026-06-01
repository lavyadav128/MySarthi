import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ silent: true });
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// simple email validator
export function isValidEmail(e) {
  return typeof e === "string" && /\S+@\S+\.\S+/.test(e.trim());
}

export const validatePassword = (password) => {
  if (!password) return "Password is required";

  const value = password.trim();

  const isWeak =
    value.length < 8 ||
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/[0-9]/.test(value) ||
    !/[!@#$%^&*]/.test(value);

  if (isWeak) {
    return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
  }

  return null;
};



export function generateToken(user) {
  return jwt.sign(
    {id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}


