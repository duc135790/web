import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/hashPassword.js";

//tao schema cho gio hang
const cartItemSchema = mongoose.Schema({
    name: {type: String, required: true},
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
});

const customerSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    // ✅ THÊM FIELD isActive
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    cart: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

customerSchema.pre("save", async function (){
    if(!this.isModified("password")){
        return;
    }
    this.password = await hashPassword(this.password);
});

customerSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

const Customer= mongoose.model('Customer', customerSchema);
export default Customer;