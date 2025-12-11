import jwt from 'jsonwebtoken';
import Customer from '../models/customerModel.js';
const protect = async (req, res, next)=>{
    let token;

    //doc token tu header 'Authorization'
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try{
            // lay token
            token = req.headers.authorization.split(' ')[1];
            //giai ma token de lay id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await Customer.findById(decoded.id).select('-password');
            next();
        }catch(error){
            console.error(error);
            res.status(401);
            throw new Error('Không có quyền truy cập, token không hợp lệ');
        }
    }

    if(!token){
        res.status(401);
        throw new Error('Không có quyền truy cập, Không tìm thấy token');
    }
};

//kiem tra quyen admin
const admin = (req, res, next)=>{
    if (req.user && req.user.isAdmin){
        next();
    }else{
        res.status(401);
        throw new Error('Không có quyền truy cập, yêu cầu quyền Admin');
    }
};

export {protect, admin};