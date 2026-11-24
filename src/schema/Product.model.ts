import mongoose, { Schema } from "mongoose";
import {
  ProductBrand,
  ProductCollection,
  ProductStatus,
} from "../libs/enums/product.enum";
import { Product } from "../libs/types/product";

const productSchema = new Schema<Product>(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    productBrand: {
      type: String,
      enum: ProductBrand,
      default: ProductBrand.OTHER,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Qidiruv va saralashni tezlashtirish uchun indekslar:
productSchema.index(
  { productName: 1, productPrice: 1, productBrand: 1 },
  { unique: true },
);

export default mongoose.model<Product>("Product", productSchema);
