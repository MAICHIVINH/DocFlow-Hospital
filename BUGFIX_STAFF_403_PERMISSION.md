# Sửa lỗi 403 Forbidden cho STAFF

## Vấn đề
Khi đăng nhập với tài khoản STAFF, gặp lỗi:
```
GET http://localhost:3000/api/documents?... 403 (Forbidden)
```

## Nguyên nhân
File `src/middlewares/auth.middleware.js` không có role `STAFF` trong `permissionMap`. Hệ thống chỉ có:
- ADMIN
- MANAGER  
- USER
- VIEWER

Khi STAFF cố gắng truy cập route có middleware `checkPermission('document:read')`, hệ thống không tìm thấy STAFF trong map nên trả về 403.

## Giải pháp
Đã thêm STAFF vào `permissionMap` với các quyền:
- `document:read` - Đọc tài liệu
- `document:create` - Tạo tài liệu mới
- `document:update` - Cập nhật tài liệu
- `stats:read` - Xem thống kê

## File đã sửa
- `src/middlewares/auth.middleware.js` (dòng 80-82)

## Cách test
1. Khởi động lại server backend
2. Login với tài khoản STAFF
3. Vào trang Documents
4. **Kết quả mong đợi**: Không còn lỗi 403, hiển thị danh sách tài liệu theo quyền

## Lưu ý
STAFF không có quyền:
- `document:delete` - Xóa tài liệu (chỉ ADMIN/MANAGER)
- `document:approve` - Duyệt tài liệu (chỉ MANAGER/ADMIN)
- `tag:manage` - Quản lý tags (chỉ MANAGER/ADMIN)
