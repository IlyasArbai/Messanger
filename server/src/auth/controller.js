import bcrypt from "bcryptjs";
import { UserRepo } from "../user/repo.js";
import {
  createUserSession,
  deleteOtherUserSessions,
  deleteUserSession,
} from "../utils/redis.js";
import { randomUUID } from "crypto";

export class AuthController {
  static async register(req, res) {
    try {
      const { username, password } = req.validated.body;
      if (await UserRepo.find({ username }))
        return res.json({
          success: false,
          error: "username already exicte",
        });

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await UserRepo.create({
        username,
        password: hashedPassword,
      });

      return res.json({
        success: true,
        message: "welcome " + user.username,
      });
    } catch (err) {
      return res.json({
        success: false,
        error: "Registration failed",
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.validated.body;
      const user = await UserRepo.find(
        { username },
        { id: true, password: true, username: true },
      );
      if (!user || !(await bcrypt.compare(password, user.password)))
        return res.json({
          success: false,
          message: "Invalid credentials",
        });

      const sid = randomUUID();
      await createUserSession(sid, user);
      res.cookie("sid", sid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        success: true,
        username: user.username,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Login failed",
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.validated.body;
      const user = await UserRepo.find({ id: req.user.id });
      if (!user)
        return res.json({
          success: false,
          error: "User not found",
        });

      if (!(await bcrypt.compare(currentPassword, user.password)))
        return res.json({
          success: false,
          error: "Current password is incorrect",
        });
      if (currentPassword === newPassword)
        return res.json({
          success: false,
          error: "New password must differ from current password",
        });

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await UserRepo.update(user.id, {
        password: hashedPassword,
      });
      await deleteOtherUserSessions(user.id, req.sessionId);

      return res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        error: "Failed to change password",
      });
    }
  }

  static async logout(req, res) {
    try {
      await deleteUserSession(req.sessionId);

      return res.json({
        success: true,
        message: "Logout successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        error: "Failed to Logout",
      });
    }
  }

  static async check(req, res) {
    try {
      return res.json({ success: true, username: req.user.username });
    } catch (err) {
      return res.json({ success: false });
    }
  }
}
