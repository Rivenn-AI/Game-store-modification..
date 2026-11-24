import { Request, Response, NextFunction } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";

const memberService = new MemberService();
const adminController: T = {};

// 1. Asosiy sahifa (Dashboard / Home)
adminController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome:", err);
    res.redirect("/admin");
  }
};

// 2. Signup sahifasini ochish
adminController.getSignup = (req: Request, res: Response) => {
  try {
    res.render("signup");
  } catch (err) {
    console.log("Error, getSignup:", err);
    res.redirect("/admin");
  }
};

// 3. Login sahifasini ochish
adminController.getLogin = (req: Request, res: Response) => {
  try {
    res.render("login");
  } catch (err) {
    console.log("Error, getLogin:", err);
    res.redirect("/admin");
  }
};

// 4. Admin ro'yxatdan o'tish jarayoni
adminController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    const file = req.file;
    if (!file) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.ADMIN;

    const result = await memberService.processSignup(newMember);

    req.session.member = result;
    req.session.save(() => {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
    console.log("Error, processSignup:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/signup'); </script>`,
    );
  }
};

// 5. Admin tizimga kirish jarayoni
adminController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");
    const input: LoginInput = req.body;
    const result = await memberService.processLogin(input);

    req.session.member = result;
    req.session.save(() => {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
    console.log("Error, processLogin:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`,
    );
  }
};

// 6. Admin tizimdan chiqishi (Logout)
adminController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");
    req.session.destroy(() => {
      res.redirect("/admin");
    });
  } catch (err) {
    console.log("Error, logout:", err);
    res.redirect("/admin");
  }
};

// 7. Barcha oddiy mijozlar ro'yxatini olish
adminController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const result = await memberService.getUsers();
    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers:", err);
    res.redirect("/admin/login");
  }
};

// 8. Tanlangan foydalanuvchi statusini o'zgartirish (masalan, BLOCK qilish)
adminController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser");
    const result = await memberService.updateChosenUser(req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenUser:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 9. Sessiyani tekshirish
adminController.checkAuthSession = async (req: AdminRequest, res: Response) => {
  try {
    console.log("checkAuthSession");
    if (req.session?.member) {
      res.send(`<script> alert("${req.session.member.memberNick}"); </script>`);
    } else {
      res.send(`<script> alert("${Message.NOT_AUTHENTICATED}"); </script>`);
    }
  } catch (err) {
    console.log("Error, checkAuthSession:", err);
    res.send(err);
  }
};

// 10. Himoyalovchi Middleware (Faqat ADMIN kira olishi uchun)
adminController.verifyAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.session?.member?.memberType === MemberType.ADMIN) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`,
    );
  }
};

export default adminController;
