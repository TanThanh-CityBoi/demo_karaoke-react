# Music App

Ứng dụng phát nhạc kèm lyric với nhiều hiệu ứng chạy chữ, được xây dựng bằng React và Mantine.

## Tính năng

- 🎵 **Quản lý bài hát**: Thêm, sửa, xóa bài hát với lyrics và audio
- 🎨 **Nhiều hiệu ứng lyric**: 
  - Cuộn (Scroll)
  - Làm nổi bật (Highlight)
  - Đánh máy (Typewriter)
  - Mờ dần (Fade)
  - Matrix
- 🎤 **Đồng bộ với audio**: Lyric tự động chạy theo nhịp bài hát
- 💾 **Lưu trữ local**: Dữ liệu được lưu trong IndexedDB (hỗ trợ file lớn, không giới hạn như localStorage)
- 🖥️ **Giao diện Terminal**: Thiết kế cổ điển giống terminal với màu xanh lá

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Hướng dẫn sử dụng

### Thêm bài hát mới

1. Nhấn nút **"Thêm bài hát"** ở header
2. Điền thông tin:
   - **Tên bài hát**: Tên của bài hát
   - **Ca sĩ**: Tên ca sĩ
   - **File audio**: Chọn file audio (mp3, wav, etc.)
3. Thêm lyrics:
   - Nhấn **"Thêm dòng"** để thêm từng dòng lyric
   - Với mỗi dòng, nhập:
     - **Lời bài hát**: Nội dung lyric
     - **Bắt đầu (s)**: Thời gian bắt đầu của dòng (tính bằng giây)
     - **Kết thúc (s)**: Thời gian kết thúc của dòng (tính bằng giây)
4. Nhấn **"Thêm"** để lưu

### Cách lấy thời gian (beat) cho lyric

Để đồng bộ lyric với nhịp bài hát, bạn cần xác định thời gian cho mỗi dòng:

1. **Phương pháp thủ công**:
   - Mở bài hát trong trình phát nhạc
   - Ghi lại thời gian (giây) khi mỗi dòng lyric bắt đầu và kết thúc
   - Nhập các giá trị này vào form

2. **Sử dụng công cụ**:
   - Có thể sử dụng các công cụ như Audacity để xem timeline chính xác
   - Hoặc sử dụng các ứng dụng karaoke có sẵn để lấy timing

3. **Ví dụ**:
   ```
   Dòng 1: "Đêm nay trăng sáng quá" - Bắt đầu: 0s, Kết thúc: 5s
   Dòng 2: "Anh nhớ em biết bao" - Bắt đầu: 5s, Kết thúc: 10s
   Dòng 3: "Nhớ từng ánh mắt" - Bắt đầu: 10s, Kết thúc: 15s
   ```

### Phát bài hát

1. Chọn một bài hát từ danh sách bên trái
2. Nhấn nút **"Phát"**
3. Audio sẽ phát và lyric sẽ tự động chạy theo thời gian đã thiết lập

### Chọn hiệu ứng

Chọn hiệu ứng từ dropdown **"Hiệu ứng lyric"** ở sidebar:
- **Cuộn**: Lyric cuộn với hiệu ứng glow
- **Làm nổi bật**: Lyric được highlight với border và background
- **Đánh máy**: Lyric hiển thị từng ký tự như đánh máy
- **Mờ dần**: Lyric fade in/out
- **Matrix**: Hiệu ứng quét như trong phim Matrix

### Chỉnh sửa/Xóa bài hát

- Nhấn icon **✏️** để chỉnh sửa bài hát
- Nhấn icon **🗑️** để xóa bài hát

## Cấu trúc dự án

```
src/
├── components/
│   ├── AudioPlayer.tsx          # Component phát audio
│   ├── LyricDisplay.tsx         # Component hiển thị lyric với terminal style
│   ├── SongForm.tsx             # Form thêm/sửa bài hát
│   └── SongList.tsx             # Danh sách bài hát
├── utils/
│   └── storage.ts               # Utilities lưu trữ dữ liệu
├── types.ts                      # TypeScript types
├── App.tsx                       # Component chính
└── main.tsx                      # Entry point
```

## Công nghệ sử dụng

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Mantine 8**: UI component library
- **Vite**: Build tool
- **nanoid**: Generate unique IDs

## Lưu ý

- Dữ liệu được lưu trong IndexedDB của trình duyệt (tự động migrate từ localStorage nếu có dữ liệu cũ)
- File audio được lưu riêng trong IndexedDB, không giới hạn kích thước như localStorage
- Ứng dụng tự động chuyển đổi dữ liệu từ localStorage sang IndexedDB khi khởi động lần đầu
- Để có trải nghiệm tốt nhất, nên sử dụng file audio có chất lượng vừa phải

## Phát triển thêm

Có thể mở rộng ứng dụng với:
- Import/Export bài hát (JSON)
- Tự động detect beat từ audio (sử dụng Web Audio API)
- Hỗ trợ format LRC (lyric file format)
- Thêm nhiều hiệu ứng lyric khác
- Chế độ fullscreen cho lyric display
