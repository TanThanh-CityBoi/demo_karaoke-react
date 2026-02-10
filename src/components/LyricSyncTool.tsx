import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Stack,
  Button,
  Group,
  Text,
  Paper,
  TextInput,
  Slider,
} from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconCheck } from '@tabler/icons-react';
import type { LyricLine } from '../types';

interface LyricSyncToolProps {
  opened: boolean;
  onClose: () => void;
  lyrics: LyricLine[];
  audioUrl: string;
  onSyncComplete: (syncedLyrics: LyricLine[]) => void;
}

export function LyricSyncTool({
  opened,
  onClose,
  lyrics,
  audioUrl,
  onSyncComplete,
}: LyricSyncToolProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[]>([]);

  // Initialize lyrics when modal opens
  useEffect(() => {
    if (opened) {
      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setSyncedLyrics([...lyrics]);
        setCurrentLineIndex(0);
        setCurrentTime(0);
        setIsPlaying(false);
      }, 0);
    }
  }, [opened, lyrics]);

  // Setup audio element and event listeners - chỉ khi modal mở
  useEffect(() => {
    if (!opened) return;

    let timeoutId: number | null = null;
    let cleanup: (() => void) | null = null;

    const setupListeners = () => {
      const audio = audioRef.current;
      if (!audio) {
        // Retry sau 50ms nếu audio chưa mount
        timeoutId = setTimeout(setupListeners, 50);
        return;
      }

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      const handleCanPlay = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = () => {
        console.error('Audio error:', audio.error);
        setIsPlaying(false);
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      // Add all event listeners
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      console.log('Event listeners added to audio element');

      // Store cleanup function
      cleanup = () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    };

    setupListeners();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, [opened]);

  // Load audio when audioUrl changes
  useEffect(() => {
    if (!opened || !audioUrl) return;

    const loadAudio = () => {
      const audio = audioRef.current;
      if (!audio) {
        setTimeout(loadAudio, 50);
        return;
      }

      audio.src = audioUrl;
      audio.load();
    };

    loadAudio();
  }, [audioUrl, opened]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        if (!audio.src || audio.src !== audioUrl) {
          audio.src = audioUrl;
          audio.load();
        }
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;
    audio.currentTime = value;
    setCurrentTime(value);

    if (wasPlaying) {
      audio.play().catch(console.error);
    }
  };

  const markStartTime = () => {
    if (currentLineIndex < syncedLyrics.length) {
      const updated = [...syncedLyrics];
      updated[currentLineIndex] = {
        ...updated[currentLineIndex],
        startTime: currentTime,
      };
      setSyncedLyrics(updated);
    }
  };

  const markEndTime = () => {
    if (currentLineIndex < syncedLyrics.length) {
      const updated = [...syncedLyrics];
      updated[currentLineIndex] = {
        ...updated[currentLineIndex],
        endTime: currentTime,
      };
      setSyncedLyrics(updated);
      
      // Auto move to next line
      if (currentLineIndex < syncedLyrics.length - 1) {
        setCurrentLineIndex(currentLineIndex + 1);
      }
    }
  };

  const nextLine = () => {
    if (currentLineIndex < syncedLyrics.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
    }
  };

  const prevLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  const handleComplete = () => {
    onSyncComplete(syncedLyrics);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLine = syncedLyrics[currentLineIndex];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Đồng bộ timing cho lyrics"
      size="xl"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        {/* Audio element - đặt ở đầu để đảm bảo được mount sớm */}
        <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />
        
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>Audio Player</Text>
              <Text size="sm" c="dimmed">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </Group>
            {!audioUrl && (
              <Text size="sm" c="red">
                ⚠ Chưa có file audio. Vui lòng chọn file audio trong form trước khi đồng bộ timing.
              </Text>
            )}
            <Group>
              <Button
                leftSection={isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                onClick={togglePlay}
                disabled={!audioUrl}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                leftSection={<IconPlayerStop size={16} />}
                onClick={stop}
                variant="outline"
                disabled={!audioUrl}
              >
                Stop
              </Button>
            </Group>
            <Slider
              value={currentTime}
              max={duration || 100}
              onChange={handleSeek}
              disabled={!audioUrl}
              label={(value) => formatTime(value)}
            />
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>
                Dòng {currentLineIndex + 1} / {syncedLyrics.length}
              </Text>
              <Group gap="xs">
                <Button size="xs" variant="light" onClick={prevLine} disabled={currentLineIndex === 0}>
                  ← Trước
                </Button>
                <Button size="xs" variant="light" onClick={nextLine} disabled={currentLineIndex === syncedLyrics.length - 1}>
                  Sau →
                </Button>
              </Group>
            </Group>
            <Text size="lg" fw={500} style={{ minHeight: 60 }}>
              {currentLine?.text || ''}
            </Text>
            <Group>
              <TextInput
                label="Bắt đầu (s)"
                value={currentLine?.startTime.toFixed(2) || '0.00'}
                readOnly
                style={{ flex: 1 }}
              />
              <TextInput
                label="Kết thúc (s)"
                value={currentLine?.endTime.toFixed(2) || '0.00'}
                readOnly
                style={{ flex: 1 }}
              />
            </Group>
            <Group>
              <Button
                leftSection={<IconCheck size={16} />}
                onClick={markStartTime}
                variant="outline"
                color="green"
                style={{ flex: 1 }}
              >
                Đánh dấu BẮT ĐẦU ({formatTime(currentTime)})
              </Button>
              <Button
                leftSection={<IconCheck size={16} />}
                onClick={markEndTime}
                variant="outline"
                color="blue"
                style={{ flex: 1 }}
              >
                Đánh dấu KẾT THÚC ({formatTime(currentTime)})
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper p="sm" withBorder>
          <Stack gap="xs">
            <Text size="sm" fw={500}>Hướng dẫn:</Text>
            <Text size="xs" c="dimmed">
              1. Nhấn Play để phát audio
              <br />
              2. Khi đến dòng lyric cần sync, nhấn "Đánh dấu BẮT ĐẦU"
              <br />
              3. Khi dòng lyric kết thúc, nhấn "Đánh dấu KẾT THÚC" (sẽ tự động chuyển sang dòng tiếp theo)
              <br />
              4. Có thể dùng slider để tua lại và chỉnh sửa timing
              <br />
              5. Nhấn "Hoàn thành" khi sync xong tất cả
            </Text>
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleComplete} disabled={syncedLyrics.some(l => !l.startTime || !l.endTime)}>
            Hoàn thành
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
