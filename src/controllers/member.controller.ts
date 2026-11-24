import { Request, Response, NextFunction } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import AuthService from "../models/Auth.service";
import {
  ExtendedRequest,
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { AUTH_TIME } from "../libs/config";

const memberService = new MemberService();
const authService = new AuthService();
const memberController: T = {};

// 1. Do'kon ma'lumotlarini olish
memberController.getStore = async (req: Request, res: Response) => {
  try {
    console.log("getStore");
    const result = await memberService.getStore();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getStore:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 2. Mijoz ro'yxatdan o'tishi (Signup + JWT Token)
memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body;
    if (req.file) input.memberImage = req.file.path.replace(/\\/g, "/");

    const result: Member = await memberService.signup(input);
    const token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIME * 3600 * 1000,
      httpOnly: false, // React frontend tokenni o'qiy olishi uchun
    });

    res.status(HttpCode.CREATED).json({
      member: result,
      accessToken: token,
    });
  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 3. Mijoz tizimga kirishi (Login + JWT Token)
memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body;
    const result = await memberService.login(input);
    const token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIME * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error, login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 4. Mijoz tizimdan chiqishi (Logout)
memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");
    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error, logout:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 5. Profil ma'lumotlarini olish
memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getMemberDetail");
    const result = await memberService.getMemberDetail(req.member);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMemberDetail:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 6. Profil ma'lumotlarini yangilash
memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember");
    const input: MemberUpdateInput = req.body;
    if (req.file) input.memberImage = req.file.path.replace(/\\/g, "/");

    const result = await memberService.updateMember(req.member, input);
    res.status(HttpCode.OK).json({ result: result });
  } catch (err) {
    console.log("Error, updateMember:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 7. Eng faol foydalanuvchilar
memberController.getTopUsers = async (req: Request, res: Response) => {
  try {
    console.log("getTopUsers");
    const result = await memberService.getTopUsers();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getTopUsers:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 8. QAT'IY AUTH MIDDLEWARE (Faqat login bo'lgan mijozlar o'ta oladi)
memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) {
      const member = await authService.checkAuth(token);
      if (member) req.member = member;
    }
    if (!req.member) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    }
    next();
  } catch (err) {
    console.log("Error, verifyAuth:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 9. IXTIYORIY AUTH MIDDLEWARE (Login bo'lgan bo'lsa member'ni oladi, bo'lmasa xato bermay o'tkazaveradi)
memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) {
      const member = await authService.checkAuth(token);
      if (member) req.member = member;
    }
    next();
  } catch (err) {
    console.log("Error, retrieveAuth:", err);
    next();
  }
};

export default memberController;
