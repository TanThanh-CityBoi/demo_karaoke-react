export type LyricEffect = 'scroll' | 'highlight' | 'typewriter' | 'fade' | 'matrix';

export interface LyricLine {
  id: string;
  text: string;
  startTime: number; // Thời gian bắt đầu (giây)
  endTime: number; // Thời gian kết thúc (giây)
  effect?: LyricEffect; // Hiệu ứng cho dòng này (mặc định: highlight)
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string; // URL hoặc base64 của audio file
  lyrics: LyricLine[];
  createdAt: number;
  updatedAt: number;
}
