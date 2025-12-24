// backend/utils/emailService.js - EMAIL SERVICE WITH INVOICE

import nodemailer from 'nodemailer';

// ✅ CẤU HÌNH TRANSPORTER
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ VERIFY TRANSPORTER
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// ✅ FORMAT CURRENCY
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// ✅ FORMAT DATE
const formatDate = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// ✅ GET STATUS INFO
const getStatusInfo = (status) => {
  const statusMap = {
    'Đang xử lý': { color: '#FFC107', icon: '⏳', text: 'Đang xử lý' },
    'Đã xác nhận': { color: '#2196F3', icon: '✅', text: 'Đã xác nhận' },
    'Đang giao': { color: '#9C27B0', icon: '🚚', text: 'Đang giao hàng' },
    'Đã giao': { color: '#4CAF50', icon: '✓', text: 'Đã giao hàng' },
    'Đã hủy': { color: '#F44336', icon: '✗', text: 'Đã hủy' }
  };
  return statusMap[status] || statusMap['Đang xử lý'];
};

// ✅ GENERATE HTML EMAIL TEMPLATE
const generateInvoiceHTML = (order, customer) => {
  const statusInfo = getStatusInfo(order.orderStatus);
  
  const itemsHTML = order.orderItems.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${item.image}" 
               alt="${item.name}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;"
               onerror="this.src='https://via.placeholder.com/60?text=Book'">
          <div>
            <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${item.name}</div>
            <div style="font-size: 13px; color: #666;">SL: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 500; color: #d32f2f;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const shippingFee = 30000;
  const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn đơn hàng #${order._id.toString().slice(-8)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- HEADER -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
        BOOKSTORE
      </h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
        Sách hay - Tri thức vô giá
      </p>
    </div>

    <!-- STATUS BANNER -->
    <div style="background-color: ${statusInfo.color}; color: white; padding: 16px 20px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 4px;">${statusInfo.icon}</div>
      <div style="font-size: 18px; font-weight: bold;">${statusInfo.text}</div>
    </div>

    <!-- MAIN CONTENT -->
    <div style="padding: 30px 20px;">
      
      <!-- GREETING -->
      <div style="margin-bottom: 25px;">
        <h2 style="margin: 0 0 10px 0; color: #333; font-size: 22px;">
          Xin chào ${customer.name},
        </h2>
        <p style="margin: 0; color: #666; line-height: 1.6;">
          Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>BookStore</strong>. 
          Đơn hàng của bạn đã được xác nhận và đang được xử lý.
        </p>
      </div>

      <!-- ORDER INFO -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #2196F3; padding: 16px; margin-bottom: 25px; border-radius: 4px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;">Mã đơn hàng:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #333; font-size: 14px;">
              #${order._id.toString().slice(-8).toUpperCase()}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;">Ngày đặt:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #333; font-size: 14px;">
              ${formatDate(order.createdAt)}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;">Trạng thái:</td>
            <td style="padding: 6px 0; text-align: right;">
              <span style="background-color: ${statusInfo.color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                ${statusInfo.icon} ${statusInfo.text}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- ORDER ITEMS -->
      <div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
          📚 Chi tiết đơn hàng
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHTML}
        </table>
      </div>

      <!-- TOTAL CALCULATION -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 15px;">Tạm tính:</td>
            <td style="padding: 8px 0; text-align: right; font-size: 15px; color: #333;">
              ${formatCurrency(subtotal)}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 15px;">Phí vận chuyển:</td>
            <td style="padding: 8px 0; text-align: right; font-size: 15px; color: #4CAF50; font-weight: 500;">
              Miễn phí
            </td>
          </tr>
          <tr style="border-top: 2px solid #ddd;">
            <td style="padding: 12px 0; color: #333; font-size: 18px; font-weight: bold;">Tổng cộng:</td>
            <td style="padding: 12px 0; text-align: right; font-size: 22px; font-weight: bold; color: #d32f2f;">
              ${formatCurrency(order.totalPrice)}
            </td>
          </tr>
        </table>
      </div>

      <!-- SHIPPING & PAYMENT INFO -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
        <!-- Shipping Address -->
        <div style="background-color: #e3f2fd; padding: 16px; border-radius: 4px; border-left: 3px solid #2196F3;">
          <h4 style="margin: 0 0 10px 0; color: #1976D2; font-size: 15px;">
            📍 Địa chỉ giao hàng
          </h4>
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5;">
            <strong>${customer.name}</strong><br>
            SĐT: ${order.shippingAddress.phone}<br>
            ${order.shippingAddress.address}, ${order.shippingAddress.city}
          </p>
        </div>

        <!-- Payment Info -->
        <div style="background-color: #fff3e0; padding: 16px; border-radius: 4px; border-left: 3px solid #FF9800;">
          <h4 style="margin: 0 0 10px 0; color: #F57C00; font-size: 15px;">
            💳 Thanh toán
          </h4>
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5;">
            <strong>Phương thức:</strong><br>
            ${order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}<br>
            <strong>Trạng thái:</strong><br>
            ${order.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
          </p>
        </div>
      </div>

      <!-- BANK INFO (if applicable) -->
      ${order.paymentMethod === 'BANK' && order.bankTransferInfo ? `
      <div style="background-color: #f1f8e9; padding: 16px; border-radius: 4px; margin-bottom: 25px; border-left: 3px solid #8BC34A;">
        <h4 style="margin: 0 0 10px 0; color: #558B2F; font-size: 15px;">
          🏦 Thông tin chuyển khoản
        </h4>
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5;">
          <strong>Ngân hàng:</strong> ${order.bankTransferInfo.bankName}<br>
          <strong>Số tài khoản:</strong> ${order.bankTransferInfo.accountNumber}<br>
          <strong>Chủ tài khoản:</strong> ${order.bankTransferInfo.accountHolder}
        </p>
      </div>
      ` : ''}

      <!-- NOTES -->
      <div style="background-color: #fff8e1; padding: 16px; border-radius: 4px; border-left: 3px solid #FFC107; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #F57F17; font-size: 15px;">
          📝 Lưu ý
        </h4>
        <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.6;">
          <li>Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc</li>
          <li>Vui lòng kiểm tra kỹ sản phẩm khi nhận hàng</li>
          <li>Liên hệ hotline <strong>1900-xxxx</strong> nếu cần hỗ trợ</li>
        </ul>
      </div>

      <!-- CTA BUTTON -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:5173/my-orders" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; 
                  font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          📦 Xem chi tiết đơn hàng
        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background-color: #f5f5f5; padding: 25px 20px; text-align: center; border-top: 1px solid #ddd;">
      <p style="margin: 0 0 10px 0; color: #999; font-size: 13px;">
        Email này được gửi tự động, vui lòng không trả lời.
      </p>
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
        <strong>BOOKSTORE</strong> - Sách hay chính hãng<br>
        📞 Hotline: 1900-xxxx | 📧 support@bookstore.vn<br>
        🌐 <a href="http://localhost:5173" style="color: #667eea; text-decoration: none;">www.bookstore.vn</a>
      </p>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          © 2024 BookStore. All rights reserved.
        </p>
      </div>
    </div>

  </div>
</body>
</html>
  `;
};

// ✅ SEND ORDER CONFIRMATION EMAIL
export const sendOrderConfirmationEmail = async (order, customer) => {
  try {
    console.log('\n📧 Preparing to send order confirmation email...');
    console.log(`   Order ID: ${order._id}`);
    console.log(`   Customer: ${customer.name} (${customer.email})`);
    console.log(`   Status: ${order.orderStatus}`);

    const mailOptions = {
      from: {
        name: 'BookStore',
        address: process.env.EMAIL_USER
      },
      to: customer.email,
      subject: `✅ Xác nhận đơn hàng #${order._id.toString().slice(-8)} - BookStore`,
      html: generateInvoiceHTML(order, customer),
      attachments: []
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ SEND ORDER STATUS UPDATE EMAIL
export const sendOrderStatusEmail = async (order, customer, oldStatus, newStatus) => {
  try {
    const statusInfo = getStatusInfo(newStatus);
    
    const mailOptions = {
      from: {
        name: 'BookStore',
        address: process.env.EMAIL_USER
      },
      to: customer.email,
      subject: `${statusInfo.icon} Cập nhật đơn hàng #${order._id.toString().slice(-8)} - ${statusInfo.text}`,
      html: generateInvoiceHTML(order, customer)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Status update email sent: ${oldStatus} → ${newStatus}`);
    
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Error sending status email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail
};