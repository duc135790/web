import mongoose from "mongoose";
const reviewSchema = mongoose.Schema(
    {
        name: { type: String, required: true }, // Tên người bình luận
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer', // Tham chiếu đến bảng Customer
        },
    },
    {
        timestamps: true,
    }
);
const productSchema = mongoose.Schema(
    {
        name: { type: String, required: true }, // Tên sách
        image: { type: String, required: true }, // Ảnh bìa sách
        author: { type: String, required: true }, // Tác giả (Nguyễn Nhật Ánh, J.K. Rowling...)
        
        category: { type: String, required: true }, // Thể loại (Văn học, Kinh tế, Thiếu nhi...)
        description: { type: String, required: true }, // Tóm tắt nội dung
        publisher: { type: String, required: true }, // Nhà xuất bản (NXB Trẻ, Kim Đồng...)
        publicationYear: { type: Number }, // Năm xuất bản
        pageCount: { type: Number }, // Số trang
        language: { type: String, default: 'Tiếng Việt' }, // Ngôn ngữ
        
        price: { type: Number, required: true, default: 0 },
        
        //trường tồn kho
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