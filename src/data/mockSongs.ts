import type { Song, LyricLine } from '../types';
import { nanoid } from 'nanoid';

// Import audio file từ assets
import audioFileUrl from '../assets/audio/Nàng Thơ.mp3?url';

// Convert audio URL to base64
const loadAudioAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load audio:', error);
    return '';
  }
};

// Mock data cho bài "Nàng Thơ"
export const createNangThoMockData = async (): Promise<Song> => {
  // Load audio file từ assets
  const audioUrl = await loadAudioAsBase64(audioFileUrl);

  // Timing đã được điều chỉnh dựa trên cấu trúc bài hát thực tế
  // Bạn có thể chỉnh sửa timing trong form nếu cần đồng bộ chính xác hơn
  const lyrics: LyricLine[] = [
    // Verse 1 (0-30s) - Điều chỉnh timing
    { id: nanoid(), text: 'Em, ngày em đánh rơi nụ cười vào anh', startTime: 0, endTime: 5, effect: 'fade' },
    { id: nanoid(), text: 'Có nghĩ sau này em sẽ chờ', startTime: 5, endTime: 10, effect: 'fade' },
    { id: nanoid(), text: 'Và vô tư cho đi hết những ngây thơ', startTime: 10, endTime: 15.5, effect: 'fade' },
    { id: nanoid(), text: 'Anh, một người hát mãi những điều mong manh', startTime: 15.5, endTime: 21, effect: 'fade' },
    { id: nanoid(), text: 'Lang thang tìm niềm vui đã lỡ', startTime: 21, endTime: 25.5, effect: 'fade' },
    { id: nanoid(), text: 'Chẳng buồn dặn lòng quên hết những chơ vơ', startTime: 25.5, endTime: 30, effect: 'fade' },
    
    // Verse 2 (30-46s)
    { id: nanoid(), text: 'Ta yêu nhau bằng nỗi nhớ chưa khô trên những bức thư', startTime: 30, endTime: 36.5, effect: 'highlight' },
    { id: nanoid(), text: 'Ta đâu bao giờ có lỗi khi không nghe tim chối từ', startTime: 36.5, endTime: 42.5, effect: 'highlight' },
    { id: nanoid(), text: 'Chỉ tiếc rằng', startTime: 42.5, endTime: 46, effect: 'fade' },
    
    // Chorus 1 (46-88s)
    { id: nanoid(), text: 'Em không là nàng thơ', startTime: 46, endTime: 50.5, effect: 'scroll' },
    { id: nanoid(), text: 'Anh cũng không còn là nhạc sĩ mộng mơ', startTime: 50.5, endTime: 56.5, effect: 'scroll' },
    { id: nanoid(), text: 'Tình này nhẹ như gió', startTime: 56.5, endTime: 61, effect: 'highlight' },
    { id: nanoid(), text: 'Lại trĩu lên tim ta những vết hằn', startTime: 61, endTime: 67, effect: 'highlight' },
    { id: nanoid(), text: 'Tiếng yêu này mỏng manh', startTime: 67, endTime: 72, effect: 'fade' },
    { id: nanoid(), text: 'Giờ tan vỡ, thôi cũng đành', startTime: 72, endTime: 77, effect: 'fade' },
    { id: nanoid(), text: 'Xếp riêng những ngày tháng hồn nhiên', startTime: 77, endTime: 83, effect: 'typewriter' },
    { id: nanoid(), text: 'Trả lại...', startTime: 83, endTime: 88, effect: 'fade' },
    
    // Verse 3 (88-124s)
    { id: nanoid(), text: 'Mai, rồi em sẽ quên ngày mình khờ dại', startTime: 88, endTime: 94, effect: 'fade' },
    { id: nanoid(), text: 'Mong em kỷ niệm này cất lại', startTime: 94, endTime: 99, effect: 'fade' },
    { id: nanoid(), text: 'Mong em ngày buồn thôi ướt đẫm trên vai', startTime: 99, endTime: 105, effect: 'fade' },
    { id: nanoid(), text: 'Mai, ngày em sải bước bên đời thênh thang', startTime: 105, endTime: 111.5, effect: 'fade' },
    { id: nanoid(), text: 'Chỉ cần một điều em hãy nhớ', startTime: 111.5, endTime: 116.5, effect: 'highlight' },
    { id: nanoid(), text: 'Có một người từng yêu em tha thiết vô bờ', startTime: 116.5, endTime: 124, effect: 'highlight' },
    
    // Chorus 2 (124-168s)
    { id: nanoid(), text: 'Em không là nàng thơ', startTime: 124, endTime: 129, effect: 'scroll' },
    { id: nanoid(), text: 'Anh cũng không còn là nhạc sĩ mộng mơ', startTime: 129, endTime: 135, effect: 'scroll' },
    { id: nanoid(), text: 'Tình này nhẹ như gió', startTime: 135, endTime: 139.5, effect: 'highlight' },
    { id: nanoid(), text: 'Lại trĩu lên tim ta những vết hằn', startTime: 139.5, endTime: 145, effect: 'highlight' },
    { id: nanoid(), text: 'Tiếng yêu này mỏng manh', startTime: 145, endTime: 150, effect: 'fade' },
    { id: nanoid(), text: 'Giờ tan vỡ, thôi cũng đành', startTime: 150, endTime: 155, effect: 'fade' },
    { id: nanoid(), text: 'Xếp riêng những ngày tháng hồn nhiên', startTime: 155, endTime: 161, effect: 'typewriter' },
    { id: nanoid(), text: 'Trả hết cho em', startTime: 161, endTime: 168, effect: 'matrix' },
  ];

  return {
    id: 'nang-tho-mock',
    title: 'Nàng Thơ',
    artist: 'Hoàng Dũng',
    audioUrl,
    lyrics,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};
