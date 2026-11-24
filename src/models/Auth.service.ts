import { AUTH_TIME } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import jwt from "jsonwebtoken";

class AuthService {
  private readonly secretToken: string;

  constructor() {
    this.secretToken = process.env.SECRET_TOKEN as string;
  }

  // Mijoz ro'yxatdan o'tganda yoki login qilganda 24 soatlik xavfsiz JWT token generatsiya qilish
  public async createToken(payload: Member): Promise<string> {
    return new Promise((resolve, reject) => {
      const duration = `${AUTH_TIME}h`;
      const tokenPayload = {
        _id: payload._id.toString(),
        memberType: payload.memberType,
        memberStatus: payload.memberStatus,
        memberNick: payload.memberNick,
        memberPhone: payload.memberPhone,
        memberPoints: payload.memberPoints,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      };

      jwt.sign(
        tokenPayload,
        this.secretToken,
        { expiresIn: duration },
        (err, token) => {
          if (err || !token) {
            reject(new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION));
          } else {
            resolve(token);
          }
        },
      );
    });
  }

  // Kelgan tokenni tekshirish va uning ichidagi mijoz ma'lumotlarini dekod qilish
  public async checkAuth(token: string): Promise<Member | null> {
    try {
      const result = jwt.verify(token, this.secretToken) as Member;
      console.log(`[AUTH] Verified member: ${result.memberNick}`);
      return result;
    } catch (err) {
      console.log("JWT verification error:", err);
      return null;
    }
  }
}

export default AuthService;
