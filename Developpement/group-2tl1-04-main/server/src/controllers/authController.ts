import type { Request, Response } from "express";
import { AuthService } from "../services/authService";

export default class AuthController {

  static async register(req: Request, res: Response) {
    try {
      const { mail, password } = req.body;
      const user = await AuthService.register(mail, password);
      return res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { mail, password } = req.body;
      const { token, user } = await AuthService.login(mail, password);

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 3600000,
      });

      return res.json({
        message: "Login successful",
        token,
        user,
      });
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
  }
}