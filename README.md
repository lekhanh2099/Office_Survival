# 🧑‍💻 Office Survival — v1.0 (Professional Game Edition)

Game thẻ bài sinh tồn chốn công sở hài hước phi lý phong cách rogue-lite, được cấu trúc theo chuẩn dự án game hiện đại với **Vite + TypeScript + PWA + Sẵn sàng đóng gói iOS (Capacitor)**.

---

## 🚀 Khởi chạy & Phát triển (Trên Mac / PC)

Dự án sử dụng **Node.js** và **Vite** siêu nhẹ, khởi động tức thì trong mili-giây:

```bash
# 1. Cài đặt thư viện (chỉ cần chạy lần đầu)
npm install

# 2. Khởi chạy môi trường phát triển (Hot Reload tức thì)
npm run dev

# 3. Đóng gói sản phẩm (Production Build)
npm run build

# 4. Xem trước bản đóng gói
npm run preview
```

> **Ghi chú**: Bản đơn file độc lập cũ vẫn được lưu an toàn tại [index.standalone.html](file:///Users/lekhanh/Desktop/personal/works/Office_Survival/index.standalone.html) để bạn có thể mở trực tiếp không cần server nếu muốn.

---

## 📁 Cấu trúc mã nguồn chuẩn (Modular Game Architecture)

Toàn bộ code đã được tách lớp chuyên nghiệp, tường minh và định kiểu chặt chẽ (Strongly Typed):

```text
Office_Survival/
├── public/                     # Tài nguyên tĩnh
│   ├── icon.svg                # Icon ứng dụng (chuẩn PWA & iOS)
│   ├── manifest.webmanifest    # Cấu hình PWA (cài đặt app không viền)
│   └── sw.js                   # Service Worker (Cache offline 100%)
├── src/
│   ├── audio/
│   │   └── SoundManager.ts     # Bộ tổng hợp âm thanh Web Audio (0 dependency)
│   ├── core/
│   │   ├── GameEngine.ts       # Vòng lặp game, chọn thẻ, tính điểm, cơ chế thua
│   │   ├── GameState.ts        # Quản trị State, lưu/tải localStorage, kỷ lục
│   │   └── RNG.ts              # Bộ sinh số ngẫu nhiên xorshift32 an toàn
│   ├── data/
│   │   ├── cards.ts            # 58 thẻ sự kiện công sở & chuỗi nghiệp quật
│   │   ├── perks.ts            # 8 vật phẩm / phúc lợi công ty
│   │   ├── modifiers.ts        # 5 modifier biến đổi ngày
│   │   └── achievements.ts     # 10 danh hiệu thành tích
│   ├── styles/
│   │   └── main.css            # Design tokens, typography chuẩn tiếng Việt, animation
│   ├── types/
│   │   └── game.ts             # TypeScript interfaces (Card, Choice, Perk, State...)
│   ├── ui/
│   │   ├── Modals.ts           # Modal Sổ tay, Kỷ lục, Lịch sử, Luật chơi
│   │   ├── Renderer.ts         # Render giao diện HUD, Thẻ bài, Kết quả, Tan ca
│   │   └── Toast.ts            # Thông báo nổi (Toast notifications)
│   └── main.ts                 # Điểm khởi nhập chính của ứng dụng
├── index.html                  # File HTML gốc của Vite
├── package.json                # Cấu hình dự án & scripts
├── tsconfig.json               # Cấu hình TypeScript hiện đại
└── vite.config.ts              # Cấu hình build & base path
```

---

## 📱 Cài đặt chơi như App Native trên iPhone (PWA)

Không cần tải qua App Store, bạn có thể cài game trực tiếp vào màn hình chính iPhone:
1. Đăng thư mục `dist/` lên bất kỳ host tĩnh HTTPS nào (như **GitHub Pages**, **Vercel**, hoặc **Netlify** — hoàn toàn miễn phí).
2. Mở đường link bằng trình duyệt **Safari** trên iPhone.
3. Bấm vào nút **Chia sẻ** (biểu tượng hình vuông có mũi tên trỏ lên ở thanh dưới).
4. Chọn **"Thêm vào Màn hình chính"** (*Add to Home Screen*).
5. Ứng dụng sẽ xuất hiện trên màn hình chính như một ứng dụng iOS xịn: **toàn màn hình, không có thanh địa chỉ duyệt web, chơi offline không cần mạng**.

---

## 🍎 Đóng gói thành ứng dụng iOS Native (Xcode trên Mac)

Khi bạn muốn đóng gói thành file app iOS chính thức để đưa lên TestFlight hoặc App Store, bạn có thể tích hợp **Capacitor** cực kỳ đơn giản trên máy Mac:

```bash
# 1. Cài đặt Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Khởi tạo cấu hình ứng dụng
npx cap init "Office Survival" "com.officesurvival.game" --web-dir dist

# 3. Build mã nguồn web
npm run build

# 4. Thêm nền tảng iOS & mở Xcode
npx cap add ios
npx cap open ios
```
Lệnh trên sẽ tự động mở Xcode trên máy Mac của bạn, sẵn sàng cắm iPhone vào chạy thử hoặc xuất bản file `.ipa`!

---

## 🎮 Cách chơi & Phím tắt máy tính

- **1 / 2 / 3** hoặc **A / B / C**: Chọn nhanh phương án A, B, C.
- **Enter** hoặc **Space**: Tiếp tục sự kiện / Sang ngày mới.
- **H**: Mở nhanh nhật ký công sở.
- **M**: Bật / Tắt âm thanh nhanh.
- **Esc**: Đóng popup sổ tay / kỷ lục.
