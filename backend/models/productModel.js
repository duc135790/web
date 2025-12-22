// backend/models/productModel.js - WITH isHidden FIELD

import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer',
        },
    },
    {
        timestamps: true,
    }
);

const productSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        author: { type: String, required: true },
        
        category: { type: String, required: true },
        description: { type: String, required: true },
        publisher: { type: String, required: true },
        publicationYear: { type: Number },
        pageCount: { type: Number },
        language: { type: String, default: 'Tiếng Việt' },
        
        price: { type: Number, required: true, default: 0 },
        
        countInStock: { type: Number, required: true, default: 0 },
        reviews: [reviewSchema],
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
        
        // ✅ FIELD ẨN/HIỆN SẢN PHẨM
        isHidden: {
            type: Boolean,
            default: false
        },
        
        // SEO
        metaTitle: { type: String },
        metaDescription: { type: String },
        metaKeywords: { type: String },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);
export default Product;