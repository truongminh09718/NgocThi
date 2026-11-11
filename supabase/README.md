# Tư liệu nâng cấp Supabase cho StuMarket

> StuMarket hiện chạy như demo cục bộ, không cần Supabase. Tài liệu này chỉ dùng nếu nhóm sau này quyết định chuyển sang dữ liệu thật; không cần làm theo cho bản demo hiện tại.

Migration nền tảng nằm trong `migrations/202611110001_initial_marketplace.sql`. Nó tạo hồ sơ công khai chỉ gồm tên hiển thị, ảnh đại diện và trạng thái email đã xác minh; gian hàng chờ duyệt; tin đăng; hàng đợi báo cáo; và bucket ảnh công khai có giới hạn 5 MB, chỉ nhận JPEG/PNG/WebP. Chính sách RLS giới hạn chỉnh sửa theo chủ sở hữu; quyền quản trị dựa trên `app_metadata.role = admin` do máy chủ đặt.

Giao diện đã có kết nối có điều kiện: khi có cấu hình Supabase, trang chủ/chi tiết/cửa hàng đọc các tin `active`, và biểu mẫu đăng bán tải một ảnh lên Storage rồi tạo tin. Khi thiếu cấu hình, giao diện vẫn dùng bộ tin minh họa; khi đã cấu hình nhưng truy vấn lỗi, không tự đổi sang dữ liệu minh họa. Tin đăng thật chỉ hoạt động sau khi migration đã được áp dụng.

## Cách áp dụng khi nhóm đã tạo dự án

1. Tạo dự án trong tổ chức Supabase do nhóm dự án quản lý và bật xác thực email.
2. Trong SQL Editor, xem lại rồi chạy migration một lần trên dự án mới. Không chạy thẳng lên dự án đang có dữ liệu hoặc bucket trùng tên trước khi rà soát cấu hình.
3. Trong Authentication → Email Templates, chỉnh mẫu Magic Link để gửi mã OTP bằng `{{ .Token }}`. Supabase dùng cùng mẫu này cho Magic Link và email OTP; giao diện hiện nhập mã sáu chữ số bằng `verifyOtp`.
4. Cấu hình Custom SMTP trước khi gửi email cho người dùng NTTU ngoài nhóm dự án. SMTP mặc định của Supabase chỉ gửi đến địa chỉ được cho phép trong nhóm dự án, nên không đủ cho thử nghiệm với sinh viên. Tài khoản SMTP phải do nhóm sở hữu/quản lý.
5. Trong URL Configuration, đặt URL chạy local và các URL triển khai chính xác; không dùng wildcard rộng trong môi trường thật.
6. Lấy Project URL và publishable key, chép `.env.example` thành `.env.local`, rồi điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`. Publishable key được phép nằm ở giao diện khi RLS đã bật. Tuyệt đối không đưa `service_role`/secret key hoặc mật khẩu SMTP vào biến `VITE_*`.
7. Xác nhận miền email bị chặn phía máy chủ bằng trigger `require_nttu_email`; kiểm tra email không phải NTTU không thể đăng ký. Huy hiệu được tạo từ email đã xác nhận trong Supabase Auth, không khẳng định sinh viên đang theo học.
8. Chỉ sau khi nhóm chỉ định quản trị viên, đặt `app_metadata.role = admin` cho tài khoản đó từ môi trường máy chủ/quản trị tin cậy. Không cho trình duyệt tự ghi `app_metadata`.

## Danh sách kiểm tra trước khi bật người dùng thật

- [ ] Dự án nằm trong tổ chức nhóm; một thành viên phụ trách vận hành và thanh toán.
- [ ] Email OTP gửi được đến tài khoản thử nghiệm NTTU ngoài nhóm dự án; mẫu hiển thị mã và thời hạn đã chọn.
- [ ] Email ngoài `@nttu.edu.vn` bị chặn cả ở giao diện lẫn trigger `require_nttu_email`.
- [ ] Người chưa xác minh không thể đăng tin hoặc tải ảnh lên Storage.
- [ ] Người đăng nhập chỉ có thể sửa hồ sơ, tin và ảnh thuộc tài khoản của mình.
- [ ] Người xem công khai chỉ thấy tin đang hoạt động và cửa hàng đã duyệt.
- [ ] Bật RLS trên các bảng và bucket; không dùng `service_role` trong trình duyệt.
- [ ] Đã đặt URL local và URL triển khai được phép chính xác.

Chạy các kiểm tra bằng tài khoản thử nghiệm do nhóm kiểm soát, không dùng hồ sơ hoặc giấy tờ sinh viên thật để kiểm thử quyền.

## Phạm vi migration hiện tại

Migration này dựng nền dữ liệu và quyền cho hồ sơ, cửa hàng, tin đăng, báo cáo và ảnh. Nó **chưa** triển khai hội thoại, giao dịch hoàn tất/đánh giá, kiểm duyệt giao diện hay quy trình khôi phục/xóa tài khoản. Biểu mẫu hiện hỗ trợ một ảnh cho mỗi tin; chỉnh sửa/xóa tin sẽ làm ở bước sau. Chưa có dự án Supabase/SMTP và chưa có `.env.local`, do đó migration chưa được áp dụng, dữ liệu thật chưa được bật. Giữ giao diện ở chế độ dữ liệu minh họa cho tới khi hoàn tất thiết lập và kiểm tra RLS.

Ảnh trong bucket `listing-images` là nội dung công khai theo URL. Chỉ dùng cho ảnh sản phẩm đã đăng; không tải lên giấy tờ tùy thân, email, số điện thoại hay tài liệu riêng tư. Nếu nhóm muốn duyệt ảnh trước khi công khai, cần chuyển bucket sang private và dùng URL có thời hạn.

## Tài liệu Supabase

- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Passwordless email sign-in và OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Cấu hình SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
