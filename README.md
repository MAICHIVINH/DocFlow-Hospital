# 🏥 DocFlow Hospital - Hệ thống Chuyển giao Tài liệu Nội bộ

Chào mừng bạn đến với **DocFlow**, giải pháp quản lý và chuyển giao tài liệu hiện đại dành riêng cho môi trường bệnh viện. Hướng dẫn này sẽ giúp bạn cài đặt và chạy dự án từ đầu trên hệ điều hành **Windows**.

---

## 📋 1. Yêu cầu hệ thống (Prerequisites)

Hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

*   **Node.js**: Phiên bản >= 18.0 (Tải tại: [nodejs.org](https://nodejs.org/))
*   **npm**: Phiên bản >= 9.0 (Thường đi kèm với Node.js)
*   **PostgreSQL**: Phiên bản >= 14.0 (Tải tại: [postgresql.org](https://www.postgresql.org/download/windows/))
*   **Tài khoản Cloudinary**: Để lưu trữ file trực tuyến (Đăng ký miễn phí tại: [cloudinary.com](https://cloudinary.com/))
*   **Git**: Để quản lý mã nguồn.

---

## 🗄️ 2. Cấu hình Cơ sở dữ liệu (PostgreSQL)

1.  Mở công cụ **pgAdmin 4** hoặc sử dụng **SQL Shell (psql)**.
2.  Tạo một Database mới tên là: `hospital_docs`.
3.  Đảm bảo bạn nhớ tài khoản (`postgres`) và mật khẩu của mình (mặc định thường là `123456` hoặc mật khẩu bạn đã đặt khi cài đặt).

---

## ⚙️ 3. Cấu hình Biến môi trường (Environment Variables)

Dự án gồm 2 phần: **Backend** (Server) và **Frontend** (Client). Bạn cần tạo các file cấu hình sau:

### 🔹 Tại thư mục gốc (Backend)
Tạo file `.env` và dán nội dung sau:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_docs
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Security
JWT_SECRET=your_jwt_secret_key_123

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 4. Cài đặt và Chạy hệ thống

Mở terminal (PowerShell hoặc CMD) tại thư mục `DocFlow-Hospital` và thực hiện các bước:

### Bước 1: Cài đặt Backend
```bash
# Cài đặt thư viện
npm install

# Tạo cấu trúc bảng và dữ liệu mẫu (Seeders)
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Chạy Server Backend
npm run dev
```
*Server sẽ chạy tại: `http://localhost:5000`*

### Bước 2: Cài đặt Frontend
Mở một cửa sổ Terminal mới:
```bash
cd client

# Cài đặt thư viện
npm install

# Chạy giao diện ReactJS
npm run dev
```
*Giao diện sẽ chạy tại: `http://localhost:3000`*

---

## 🔑 5. Thông tin Đăng nhập Mặc định

Sau khi chạy lệnh `seed`, bạn có thể sử dụng tài khoản Admin sau để trải nghiệm:

*   **Username:** `admin`
*   **Password:** `Admin@123`

---

## 🛠️ Trợ giúp (Troubleshooting)

- **Lỗi kết nối DB:** Kiểm tra lại file `.env` xem `DB_PASSWORD` và `DB_NAME` đã chính xác chưa.
- **Lỗi Upload file:** Đảm bảo `CLOUDINARY` credentials trong file `.env` đã đúng.
- **Port bị chiếm:** Nếu port 3000 hoặc 5000 đã có ứng dụng khác dùng, bạn có thể đổi trong `vite.config.js` hoặc `server.js`.

---
*Phát triển bởi Đội ngũ Kỹ thuật DocFlow - 2024*
