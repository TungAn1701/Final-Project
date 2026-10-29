# Smart Orthotic Insole Platform - Frontend Web

Ứng dụng Web dành cho Bác sĩ, Kỹ thuật viên lâm sàng và Bệnh nhân trong hệ thống đo dáng đi và thiết kế lót giày y tế.

## 🚀 Công nghệ sử dụng
- **React 19 + Vite 6** (Cấu trúc component module hóa, tốc độ build và HMR siêu tốc)
- **Tailwind CSS v4** (`@tailwindcss/vite` với bảng màu chuẩn EMR/Medical utilitarian: Slate, Navy, Teal)
- **React Router DOM v7** (Phân luồng định tuyến và bảo vệ quyền truy cập `ProtectedRoute`)
- **Axios Interceptors** (Tự động gắn JWT `Authorization: Bearer <token>`, xử lý redirect 401)
- **Lucide React** (Bộ icon y khoa và kỹ thuật chuẩn xác, thanh thoát)

---

## 🔐 Phân quyền người dùng (Role-Based Access Control - RBAC)

| Vai trò | Role Code | Quyền hạn trong hệ thống |
| :--- | :--- | :--- |
| **Bác Sĩ Lâm Sàng** | `CLINICIAN` | **Toàn quyền:** Quản lý bệnh nhân (Thêm, Sửa, Xóa), Bắt đầu phiên đo dáng đi, Ghi nhận bệnh án, Chỉ định thông số vòm lót và độ cứng TPU. |
| **Kỹ Thuật Viên** | `TECHNICIAN` | **Quyền đo & vận hành:** Xem danh sách bệnh nhân, Thêm bệnh nhân mới, Khởi tạo và ghi nhận phiên đo cảm biến FSR 50Hz. *Không được xóa bệnh án và chỉnh sửa chẩn đoán bác sĩ.* |
| **Bệnh Nhân / KH** | `CUSTOMER` | **Xem dữ liệu cá nhân:** Chỉ xem hồ sơ cá nhân (`/my-profile`), chỉ số nhân trắc học bàn chân, gợi ý lót giày và lịch sử các lần đo của chính mình. *Bị chặn 403 nếu cố truy cập dữ liệu bệnh nhân khác.* |

### Tài khoản thử nghiệm nhanh (1-Click Demo Login):
1. **Bác Sĩ:** `dr_nguyen` (BS. CKII Nguyễn Văn An - Khoa Phục hồi Chức năng & Chỉnh hình)
2. **Kỹ Thuật Viên:** `tech_tran` (KTV. Trần Minh Đức - Phòng Đo Cảm Biến FSR)
3. **Bệnh Nhân:** `patient_le` (Lê Hoàng Nam - Mã BN: `CUST-8801`)

*(Giao diện có thanh chuyển đổi quyền nhanh ở góc phải TopBar để kiểm tra tính năng phân quyền tức thì).*

---

## 💻 Hướng dẫn chạy

### 1. Cài đặt thư viện:
```bash
cd frontend
npm install
```

### 2. Khởi chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Truy cập: `http://localhost:5173`

*(Mọi request `/api` và `/ws` được cấu hình tự động proxy sang API Gateway cổng `8000`).*

### 3. Đóng gói cho môi trường Production:
```bash
npm run build
```
Thư mục xuất file: `frontend_web/dist/`
