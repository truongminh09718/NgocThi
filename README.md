# StuMarket · bản demo tương tác

Website demo marketplace NTTU, xây bằng React, TypeScript và Vite. Không cần Supabase, tài khoản thật, OTP, SMTP hay máy chủ dữ liệu.

## Chạy website

1. Cài Node.js 22 trở lên.
2. Mở thư mục `stu-market` trong terminal.
3. Chạy `npm install` rồi `npm run dev`.
4. Mở địa chỉ local do Vite hiển thị (thường là `http://localhost:5173`).

## Xuất bản website

Kho này được cấu hình để xuất bản qua GitHub Pages tại `https://truongminh09718.github.io/NgocThi/`. Trong GitHub, đặt **Settings → Pages → Build and deployment → Source** thành **GitHub Actions**. Mỗi lần cập nhật nhánh `main`, quy trình sẽ dựng và xuất bản lại website.

## Các thao tác có thể thử

- Tìm sản phẩm theo từ khóa, lọc danh mục và mở trang chi tiết.
- Lưu tin, xem trang **Tin đã lưu**, tải lại trang để xác nhận dữ liệu vẫn còn.
- Đăng ký/đăng nhập tài khoản demo bằng email và mật khẩu; không gửi email xác minh.
- Đăng tin demo, chọn ảnh tùy ý hoặc dùng ảnh mẫu. Ảnh được thu nhỏ/nén rồi lưu trong bộ nhớ trình duyệt.
- Nhắn người bán; tin nhắn và phản hồi tự động đều là nội dung mô phỏng.
- Đánh dấu một tin do bạn tạo là đã bán và chọn số sao đánh giá mô phỏng.

## Dữ liệu và quyền riêng tư

- Sản phẩm ban đầu là dữ liệu minh họa.
- Tài khoản demo, tin mới, ảnh đã nén, tin yêu thích, cuộc trò chuyện và tên hiển thị lưu trong `localStorage` trên thiết bị/trình duyệt hiện tại. Mật khẩu được băm cục bộ trước khi lưu, nhưng đây không phải hệ thống tài khoản an toàn.
- Tài khoản chỉ đăng nhập được trong đúng trình duyệt/thiết bị đã đăng ký. Xóa dữ liệu trang web sẽ xóa cả tài khoản demo; không thể khôi phục mật khẩu.
- Tin, tên, ảnh do người dùng thêm, tin nhắn và đánh giá không được ứng dụng tải lên máy chủ. Một số ảnh mẫu và font chữ được tải từ nguồn internet.
- Dọn dữ liệu trang web trong trình duyệt sẽ xóa các nội dung demo đã tạo.
- Không dùng bản demo để đăng thông tin cá nhân, hẹn giao dịch thật hoặc chuyển tiền.

## Phần chưa có trong bản demo

OTP thật, tài khoản dùng chung trên máy chủ, đồng bộ giữa thiết bị, chat giữa người dùng thật, duyệt cửa hàng, thanh toán tiền thật, đánh giá có kiểm chứng và quản trị chưa được triển khai. Không dùng email/mật khẩu thật hoặc mật khẩu đang sử dụng ở dịch vụ khác.

Tài khoản, tin đăng và giao dịch thông thường vẫn chạy cục bộ. Supabase chỉ được gọi cho luồng kiểm thử VNPAY khi đã cấu hình các biến môi trường công khai ở giao diện và triển khai Edge Functions.

## VNPAY Sandbox

Mã tích hợp thử nghiệm nằm trong `supabase/functions/`, migration `supabase/migrations/202611120001_vnpay_sandbox.sql` và hướng dẫn cấu hình tại `supabase/payments/README.md`. Đây là luồng Sandbox dành cho sáu sản phẩm mẫu, không thu tiền thật. Cần Supabase project và thông tin merchant VNPAY Sandbox để triển khai; tuyệt đối không đặt hash secret hoặc service-role key ở phía trình duyệt.
