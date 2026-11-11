export type Listing = {
  id: string
  title: string
  category: string
  price: number
  condition: string
  conditionShort: string
  location: string
  sellerKind: 'Sinh viên' | 'Cửa hàng'
  sellerName?: string
  sellerEmailVerified?: boolean
  description: string
  descriptionLong: string
  image: string
  imageAlt: string
}

export const categories = [
  'Tất cả',
  'Giáo trình',
  'Máy tính',
  'Vở và giấy',
  'Dụng cụ học tập',
]

export const listings: Listing[] = [
  {
    id: 'giao-trinh-marketing',
    title: 'Giáo trình Marketing căn bản',
    category: 'Giáo trình',
    price: 50000,
    condition: 'Đã qua sử dụng · còn tốt',
    conditionShort: 'Còn tốt',
    location: 'Quận 4',
    sellerKind: 'Sinh viên',
    description: 'Có ghi chú một số chương, tình trạng được mô tả trong tin.',
    descriptionLong: 'Sách đã qua sử dụng. Người bán cần bổ sung ảnh và mô tả chi tiết tình trạng trước khi đăng tin thật.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmOPDQKP0dDnMHavEFBaAWY8MkdYG3kAy1fV4rNc1K-I4ClZf6YjqxNOYygLbppehzHsg6eErpO8jFigks2Zvnac2YCbt8wpuHSe-PnsxCy6qgHM57MzWBpvjkASIp7uruPSVUioJZzIk6It0DBzTxe45eBBIPOl61m8NHu2vUOaP8U5v6b9gXkUCCdBpuIGpvsyRHsbRqAqg_HpBDpdq3ef7jsst3i-yII6T-LRs3',
    imageAlt: 'Giáo trình Marketing đặt trên bàn học',
  },
  {
    id: 'may-tinh-casio',
    title: 'Máy tính Casio fx-580VN X',
    category: 'Máy tính',
    price: 280000,
    condition: 'Đã qua sử dụng · còn tốt',
    conditionShort: 'Còn tốt',
    location: 'Quận 7',
    sellerKind: 'Sinh viên',
    description: 'Máy tính cầm tay, phù hợp mang theo khi đi học.',
    descriptionLong: 'Sản phẩm mẫu để minh họa cách hiển thị thông tin trên StuMarket. Người bán và giá chưa được xác nhận.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3_xe2aRbYBe-vSE2s9z5K142imW0aEM-dLNqrJ-VrIpjMPOFcDvtshLtfFiWouhxRxVFlP_6y_Bh5gTuvkbpfvt_HnEK8hnTQpA1_4ik39FSbth8_iUYOdx9mEjxAeCA0StDv_AyFbF-MHgZQf81IVBfjw-DWa9r9brKljSkpqM-FLn-0b2n7zcHkGgM9nF6BbSRP-2FlKQRCzcCV3-QGGCKD5BbEa8M5afT7dHsa',
    imageAlt: 'Máy tính khoa học đặt cạnh vở học tập',
  },
  {
    id: 'vo-so-tay',
    title: 'Bộ vở ghi và bút gel',
    category: 'Vở và giấy',
    price: 45000,
    condition: 'Mới',
    conditionShort: 'Mới',
    location: 'An Phú Đông',
    sellerKind: 'Cửa hàng',
    description: 'Vở ghi và bút viết dùng cho học tập hằng ngày.',
    descriptionLong: 'Sản phẩm văn phòng phẩm mẫu. Cửa hàng và tình trạng hàng chưa được xác nhận.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDESTrX86W2HqFVhg9TRiMbXWVC9K8vQMXuMi_6l3mTk6tnaS6Zl-glA5FAdIquDNI000Q1ewrfrVGlBVMsYMP6KxL8IthfWWySXoV0S3FKRCHWq9bSbMgyIxjDA-hYaLzdVpQ5sXw52c8n3OqRFfqHMFXzHyWI1yZVrMFN7Rh53dz83uca9oEOoHiPWuvyeBMHabUPUAzjE3JNkVyfKr_DsIwJzRrAWLlWTzGD9Gp9',
    imageAlt: 'Vở xoắn và bút gel trên kệ văn phòng phẩm',
  },
  {
    id: 'giao-trinh-toan-cao-cap',
    title: 'Giáo trình Toán cao cấp',
    category: 'Giáo trình',
    price: 60000,
    condition: 'Đã qua sử dụng · có ghi chú',
    conditionShort: 'Có ghi chú',
    location: 'Quận 12',
    sellerKind: 'Sinh viên',
    description: 'Giáo trình có ghi chú; xem ảnh để biết tình trạng cụ thể.',
    descriptionLong: 'Giáo trình dùng trong học tập, có ghi chú. Hãy hỏi người bán để xác nhận phiên bản và tình trạng trước khi hẹn nhận.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr_mCR03aB9QbcA0f8YbgA-s5oh1fNVaCW7NZAarxiS6yV-OQnDLj9i2R0aP_jT-Jyrz3SnaqyXMS1hQxRlA60dACykToYEZo398HATKIuBKRulIxtJBQGRKXq1krSddlr-Gs1ANA1TpPtXYl38pf8ST4mOGctlvh80e7lLL-RZEJfw_J5-pwe-W5RYfpMvYp59cLZobQ7UYt9xbO9FF4JUZ24e4CRTCr0mwNKnjlb',
    imageAlt: 'Sách toán học đặt cùng bút trên bàn học',
  },
  {
    id: 'nguyen-ly-ke-toan',
    title: 'Giáo trình Nguyên lý kế toán',
    category: 'Giáo trình',
    price: 55000,
    condition: 'Đã qua sử dụng · còn tốt',
    conditionShort: 'Còn tốt',
    location: 'Quận 4',
    sellerKind: 'Sinh viên',
    description: 'Sách học tập đã qua sử dụng, xem ảnh để kiểm tra.',
    descriptionLong: 'Giáo trình mẫu để minh họa cách xem ảnh, tình trạng và thông tin người bán.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8aipXOpZXCRHZtbyoCZlPN717S4uF2f0f96ZPUG8FS-l7SDOIL3C2VMFDd0FJEXYMmLZ0z0lLmw8lO1NzZEXdNlTDaGcoGFA5hkNRgp9NyOIlUkM8J-4zEJpWSpCkgFyTnbo4rbcePXw_rwCZYmyDN_jfDvq0LE4LyKGpGRVlPb2nAUGcr2nT_pQXI2VBfZaLfRLnj57IZcJJT6-1G4dgRUqttRgvmUlsFeCDjGKP',
    imageAlt: 'Giáo trình Nguyên lý kế toán đặt trên bàn',
  },
  {
    id: 'dung-cu-ve-ky-thuat',
    title: 'Bộ dụng cụ vẽ kỹ thuật',
    category: 'Dụng cụ học tập',
    price: 75000,
    condition: 'Đã qua sử dụng · còn tốt',
    conditionShort: 'Còn tốt',
    location: 'Quận 7',
    sellerKind: 'Cửa hàng',
    description: 'Bộ thước, compa và bút chì kỹ thuật.',
    descriptionLong: 'Bộ dụng cụ học tập mẫu. Giá và thông tin cửa hàng chưa được xác nhận.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzBTrSoZ24TVzG-GUfeFSITx3GC3urIcJiIC5cXoEPbrV9sbu4YffcDorTvjGn_GrEwmAlEDI3NLoS7K44cORbAWpep9dX4Lolo4uwyNVJwPS7S-bEvo0IPcT53zlbe5IYr1HkWVphDLEs5MD0QmkXva3dDpZgIIjaNvArzBy6sTth5MUMAKamMA8qw_NOQVfwUvG4cvaN_TF6TeNuECvhtucyP_lwH2vpd-Un-PEz',
    imageAlt: 'Thước kẻ và compa đặt trên giấy vẽ kỹ thuật',
  },
]
