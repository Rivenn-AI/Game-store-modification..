import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductCollection } from "../libs/enums/product.enum";

const productService = new ProductService();
const productController: T = {};

/** ==============================
 *  SPA: CLIENT REST API
 *  ============================== */

// 1. Mahsulotlar ro'yxatini olish (Filtr, qidiruv va pagination)
productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const { page, limit, order, productCollection, search } = req.query;

    const inquiry: ProductInquiry = {
      order: String(order ?? "createdAt"),
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
    };

    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }
    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 2. Bitta mahsulotni olish
productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params;
    const result = await productService.getProduct(id);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** ==============================
 *  BSSR: ADMIN PRODUCT MANAGEMENT
 *  ============================== */

// 3. Admin: Barcha mahsulotlar sahifasini ochish
productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts();
    res.render("products", { products: data });
  } catch (err) {
    console.log("Error, getAllProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// 4. Admin: Yangi mahsulot qo'shish (kamida 1 ta rasm talab qilinadi)
productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct");
    const files = req.files as Express.Multer.File[];
    if (!files || !files.length) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    }

    const data: ProductInput = req.body;
    data.productImages = files.map((file) => file.path.replace(/\\/g, "/"));

    await productService.createNewProduct(data);

    res.send(
      `<script> alert("Successfully created!"); window.location.replace('/admin/product/all'); </script>`,
    );
  } catch (err) {
    console.log("Error, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/product/all'); </script>`,
    );
  }
};

// 5. Admin: Mahsulot ma'lumotlarini yoki statusini yangilash
productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const { id } = req.params;
    const result = await productService.updateChosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
