# 🏥 DocFlow Hospital - Hệ thống Quản lý & Chuyển giao Tài liệu Nội bộ

**DocFlow Hospital** là một nền tảng quản lý tài liệu chuyên sâu, được thiết kế để tối ưu hóa quy trình luân chuyển, phê duyệt và lưu trữ hồ sơ trong môi trường y tế. Hệ thống tập trung vào tính bảo mật, quy trình phê duyệt chặt chẽ và khả năng truy xuất nguồn gốc (Audit Log).

---

## 🏗️ Kiến trúc Hệ thống

Hệ thống được xây dựng theo mô hình **Client-Server** hiện đại:
- **Frontend**: Ứng dụng Single Page (SPA) xây dựng trên ReactJS.
- **Backend**: API RESTful sử dụng Node.js & Express.
- **Database**: PostgreSQL (Lưu trữ dữ liệu có cấu trúc) & MinIO (Lưu trữ file vật lý).

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize (PostgreSQL)
- **Authentication**: JWT (JSON Web Token)
- **File Storage**: Minio SDK (Tương thích S3)
- **Logging**: Morgan

### Frontend
- **Library**: ReactJS 18
- **Styling**: Vanilla CSS & Material UI (Icon/Components)
- **State Management**: React Context API
- **Routing**: React Router DOM v6
- **Notifications**: Notistack

### Infrastructure
- **Database**: PostgreSQL 14+
- **Object Storage**: MinIO (Docker)
- **Containerization**: Docker & Docker Compose

---

## ✨ Tính năng Cốt lõi

1.  **Quản lý Tài liệu chuyên nghiệp**:
    *   Tải lên, xem trực tuyến (PDF) và quản lý phiên bản.
    *   Phân loại tài liệu theo phòng ban, loại tài liệu và gắn thẻ (Tags).
    *   Lưu trữ tài liệu cũ (Archive).
2.  **Quy trình Phê duyệt (Approval Workflow)**:
    *   Luồng phê duyệt đa cấp (Soạn thảo -> Gửi duyệt -> Trưởng khoa duyệt -> Ban giám đốc).
3.  **Phân quyền Người dùng (RBAC)**:
    *   Hệ thống quyền hạn chi tiết cho từng vai trò: Admin, Manager, Staff.
4.  **Báo cáo & Thống kê**:
    *   Dashboard trực quan theo dõi số lượng tài liệu, trạng thái phê duyệt.
5.  **Nhật ký Hoạt động (Audit Log)**:
    *   Ghi lại mọi thay đổi trên hệ thống (ai làm gì, khi nào) để đảm bảo tính minh bạch.
6.  **Thông báo**:
    *   Hệ thống thông báo thời gian thực về trạng thái tài liệu và yêu cầu phê duyệt.

---

## 📂 Cấu trúc Dự án

```text
DocFlow-Hospital/
├── client/                 # Mã nguồn Frontend (ReactJS)
│   ├── src/
│   │   ├── components/     # UI Components dùng chung
│   │   ├── context/        # Quản lý State (Auth, Theme)
│   │   ├── pages/          # Các trang chức năng chính
│   │   └── services/       # Gọi API đến Backend
├── src/                    # Mã nguồn Backend (Node.js)
│   ├── config/             # Cấu hình DB, MinIO, JWT
│   ├── controllers/        # Xử lý logic nghiệp vụ
│   ├── models/             # Định nghĩa Schema Database (Sequelize)
│   ├── routes/             # Định nghĩa các endpoint API
│   └── services/           # Các dịch vụ bổ trợ
├── database/               # Migrations & Seeders
├── docker-compose.yml      # Cấu hình chạy MinIO & Postgres (Docker)
└── README.md               # Tài liệu này
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

### 1. Yêu cầu Hệ thống
- Node.js (v18+)
- PostgreSQL (v14+)
- Docker Desktop (Chạy MinIO)

### 2. Cấu hình Biến môi trường
Tạo file `.env` tại thư mục gốc và cấu hình như sau:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_docs
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_secret_key

# MinIO (Object Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_BUCKET=hospital-docs
```

### 3. Khởi động Infrastructure (Docker)
```bash
docker-compose up -d
```

### 4. Thiết lập Backend
```bash
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

### 5. Thiết lập Frontend
```bash
cd client
npm install
npm run dev
```

---

## 🔐 Phân quyền (RBAC)

- **ADMIN**: Toàn quyền quản trị (Người dùng, Phòng ban, Quyền, Hệ thống).
- **MANAGER**: Quản lý tài liệu cấp phòng ban, thực hiện phê duyệt.
- **STAFF**: Soạn thảo, gửi duyệt và tra cứu tài liệu được quyền truy cập.

---

## 🛠️ Hỗ trợ & Bảo trì

- **Tra cứu Log**: `server-debug.log`.
- **Dọn dẹp Cache**: Xóa thư mục `node_modules` và chạy `npm install` lại nếu gặp lỗi thư viện.
- **Backup**: Khuyên dùng `pg_dump` để sao lưu dữ liệu PostgreSQL định kỳ.

---
*Bản quyền © 2024 DocFlow - Giải pháp Y tế số.*
