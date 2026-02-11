export type LyricEffect = 'scroll' | 'highlight' | 'typewriter' | 'fade' | 'matrix';

export type TerminalThemeId = 'green' | 'amber' | 'cyan' | 'purple' | 'red' | 'ice';

export interface TerminalTheme {
  id: TerminalThemeId;
  label: string;
  primary: string;
  primaryRgb: string;
  dim: string;
}

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
  audioFileName?: string; // Tên file audio gốc
  lyrics: LyricLine[];
  createdAt: number;
  updatedAt: number;
}

export const TERMINAL_THEMES: TerminalTheme[] = [
  { id: 'ice', label: 'Băng', primary: '#e0f7fa', primaryRgb: '224, 247, 250', dim: '#78909c' },
  { id: 'green', label: 'Xanh lá (Classic)', primary: '#00ff00', primaryRgb: '0, 255, 0', dim: '#006600' },
  { id: 'amber', label: 'Hổ phách', primary: '#ffb000', primaryRgb: '255, 176, 0', dim: '#996600' },
  { id: 'cyan', label: 'Xanh lơ', primary: '#00ffff', primaryRgb: '0, 255, 255', dim: '#006666' },
  { id: 'purple', label: 'Tím', primary: '#bf5fff', primaryRgb: '191, 95, 255', dim: '#4a1f66' },
  { id: 'red', label: 'Đỏ', primary: '#ff4444', primaryRgb: '255, 68, 68', dim: '#661111' },
];
