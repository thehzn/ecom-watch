import mongoose, { model } from "mongoose";

const productSchema = new mongoose.Schema({

    modelName: { type: String, required: true, trim: true},

    sku: {type: String,required: true, unique: true, trim: true},

    brand: {type: String,required: true,trim: true},

    modelNumber: {type: String, required: true, trim: true},

    category: {type: String,required: true,enum: [
        "Luxury Watch",
        "Heritage",
        "Contemporary",
        "Complications",]},

    productFor: {type: String, enum: ["Men", "Women", "Children"],default: "Men"},

    price: {type: Number,required: true,min: 0},

    stock: {type: Number,required: true,default: 1,min: 1},

    description: {type: String,required: true,trim: true},

    caseMaterial: {type: String,trim: true},

    glassType: {type: String,trim: true},

    strapBracelet: {type: String,trim: true},

    mainImage: {type: String,required: true},

    images: [{type: String}],
  
})


const Product = mongoose. model("product",productSchema)
export default Product


