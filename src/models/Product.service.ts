import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";

class ProductService {
  private readonly productModel;

  constructor() {
    this.productModel = ProductModel;
  }

  /** ==============================
   *  BSSR: ADMIN PRODUCT MANAGEMENT
   *  ============================== */

  // Barcha mahsulotlarni Admin panelda ko'rish uchun olish
  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel
      .find()
      .sort({ updatedAt: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result as unknown as Product[];
  }

  // Yangi mahsulot qo'shish (Gaming PC, Laptop, Monitor va h.k.)
  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      const result = await this.productModel.create(input);
      return result as unknown as Product;
    } catch (err) {
      console.error("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  // Tanlangan mahsulotni tahrirlash (narxi, qoldiq soni yoki statusi PAUSE/PROCESS/DELETE)
  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findByIdAndUpdate({ _id: productId }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result as unknown as Product;
  }

  /** ==============================
   *  SPA: CLIENT REST API
   *  ============================== */

  // Mijozlar uchun mahsulotlar ro'yxati (Kolleksiya, Brand va Search filtrlari bilan)
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCollection) {
      match.productCollection = inquiry.productCollection;
    }
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result as unknown as Product[];
  }

  // Bitta tanlangan mahsulot tafsilotini olish
  public async getProduct(id: string): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result as unknown as Product;
  }
}

export default ProductService;
