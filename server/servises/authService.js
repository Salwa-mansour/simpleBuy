import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import bcrypt from 'bcryptjs';

// --- ACCOUNT RELATED QUERIES ---

async function createUser({ userName, email, password }) {
  let hashedPassword = null;
  // Skip hashing if it's null (e.g., Google OAuth signup)
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  return User.create({
    name: userName,
    email,
    password: hashedPassword,
  });
}

async function allUsers() {
  return User.find().lean();
}

async function findByEmail(email) {
  return User.findOne({ email });
}

async function findByUserName(userName) {
  return User.findOne({ name: userName });
}

async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

async function findUserById(id) {
  return User.findById(id);
}

async function updatedUser(userId, newRoles) {
  // Returns updated doc and selects specific fields
  return User.findByIdAndUpdate(
    userId,
    { roles: newRoles },
    { new: true, runValidators: true }
  ).select('_id name roles');
}

// --- TOKEN RELATED QUERIES ---

async function rotateToken(oldJti, userId, newRefreshToken, newJti) {
  if (!oldJti) return null;

  try {
    // 1. Atomically find AND delete the old token in one step
    const deletedToken = await RefreshToken.findOneAndDelete({ jti: oldJti });

    // 2. If it wasn't found, it was already consumed or deleted -> REUSE DETECTED!
    if (!deletedToken) {
      console.warn(`[SECURITY] Token reuse or invalid token detected for user ${userId}. JTI: ${oldJti}`);
      
      // Optional security measure: Invalidate ALL tokens for this user on reuse attack
      await RefreshToken.deleteMany({ userId });
      
      return null;
    }

    // 3. Create the new refresh token synchronized with the new JTI
    const newToken = await RefreshToken.create({
      jti: newJti,
      userId: userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return newToken;

  } catch (error) {
    console.error("Rotation Database Error:", error);
    return null;
  }
}

async function findToken(jti) {
  return RefreshToken.findOne({ jti });
}

async function deleteToken(jti) {
  return RefreshToken.deleteMany({ jti });
}

export {
  createUser,
  allUsers,
  findByEmail,
  findByUserName,
  updatedUser,
  comparePassword,
  findUserById,
  rotateToken,
  deleteToken,
  findToken,
};