# Hướng dẫn hoàn tất triển khai hệ thống phân quyền

## Bước 1: Chạy Migration Database

Chạy lệnh sau để tạo bảng `shared_documents`:

```bash
psql -U postgres -d hospital_docs -f migrations\create-shared-documents.sql
```

**Lưu ý**: Tên database là `hospital_docs` (không phải `docflow_hospital`)

## Bước 2: Khởi động lại Backend Server

Sau khi migration thành công, khởi động lại server để load model mới:

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm start
```

## Bước 3: Kiểm tra hệ thống

### Test 1: Kiểm tra STAFF chỉ thấy tài liệu trong phòng ban
1. Login với tài khoản STAFF
2. Vào trang Documents
3. Kiểm tra chỉ thấy:
   - Tài liệu PUBLIC (toàn hệ thống)
   - Tài liệu DEPARTMENT (cùng phòng ban)
   - Tài liệu PRIVATE (của mình hoặc được chia sẻ)

### Test 2: Kiểm tra chức năng chia sẻ
1. Login với tài khoản STAFF
2. Tạo tài liệu PRIVATE mới
3. Mở chi tiết tài liệu
4. Click nút "Chia sẻ" (màu xanh)
5. Chọn người dùng để chia sẻ
6. Click "Chia sẻ"
7. Login với tài khoản được chia sẻ
8. Kiểm tra có thấy tài liệu PRIVATE đó

### Test 3: Kiểm tra ADMIN/MANAGER thấy tất cả
1. Login với tài khoản ADMIN hoặc MANAGER
2. Vào trang Documents
3. Kiểm tra thấy TẤT CẢ tài liệu (PUBLIC, DEPARTMENT, PRIVATE)

## Các thay đổi đã thực hiện

### Backend:
- ✅ Tạo model `SharedDocument`
- ✅ Cập nhật logic phân quyền trong `checkDocumentAccess`
- ✅ Cập nhật logic phân quyền trong `listDocuments`
- ✅ Thêm 4 API endpoints: share, unshare, getSharedUsers, getSharedWithMe
- ✅ Tạo migration cho bảng `shared_documents`

### Frontend:
- ✅ Tạo component `ShareDocumentModal`
- ✅ Thêm nút "Chia sẻ" vào `DocumentDetailModal`
- ✅ Thêm bản dịch tiếng Việt và tiếng Anh

## Quy tắc phân quyền

| Vai trò | PUBLIC | DEPARTMENT | PRIVATE |
|---------|--------|------------|---------|
| **ADMIN** | Tất cả | Tất cả | Tất cả |
| **MANAGER** | Tất cả | Tất cả | Tất cả |
| **STAFF** | Tất cả | Cùng phòng ban | Người tạo hoặc được chia sẻ |

## Troubleshooting

### Lỗi: Database không tồn tại
- Kiểm tra tên database trong file `.env` hoặc `src/config/db.config.js`
- Tên database mặc định là `hospital_docs`

### Lỗi: Model không load
- Khởi động lại server sau khi chạy migration
- Kiểm tra file `src/models/index.js` đã import `SharedDocument`

### Lỗi: Không thấy nút "Chia sẻ"
- Chỉ tài liệu PRIVATE mới có nút chia sẻ
- Chỉ người tạo, ADMIN, hoặc MANAGER mới thấy nút chia sẻ

## Liên hệ

Nếu gặp vấn đề, kiểm tra:
1. Console log của backend
2. Console log của frontend (F12)
3. Audit logs trong hệ thống
