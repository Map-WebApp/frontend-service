# 1. Sử dụng image Node.js làm base
FROM node:20-alpine

# 2. Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# 3. Sao chép package.json và lock file để cài đặt dependencies
# Điều này giúp tận dụng cache của Docker nếu dependencies không thay đổi
COPY package.json package-lock.json* ./

# 4. Cài đặt các gói phụ thuộc
RUN npm install

# 5. Sao chép toàn bộ mã nguồn còn lại của frontend
COPY . .

# 6. Mở cổng 5173 để Vite dev server có thể nhận kết nối
EXPOSE 5173

# 7. Lệnh để khởi động server khi container chạy
# Cờ --host đảm bảo server có thể được truy cập từ bên ngoài container
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0"]
