import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Modal,
  TextInput,
  Button,
  Textarea,
  Group,
  Stack,
  Text,
  FileButton,
  ActionIcon,
  Select,
  Tabs,
} from '@mantine/core';
import { IconTrash, IconPlus, IconClock } from '@tabler/icons-react';
import type { Song, LyricLine, LyricEffect } from '../types';
import { nanoid } from 'nanoid';
import { getSongWithAudio } from '../utils/storage';
import { LyricSyncTool } from './LyricSyncTool';
import { useDisclosure } from '@mantine/hooks';

const EFFECTS: { value: LyricEffect; label: string }[] = [
  { value: 'scroll', label: 'Cuộn' },
  { value: 'highlight', label: 'Làm nổi bật' },
  { value: 'typewriter', label: 'Đánh máy' },
  { value: 'fade', label: 'Mờ dần' },
  { value: 'matrix', label: 'Matrix' },
];

interface SongFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (song: Song) => void;
  initialSong?: Song | null;
}

export function SongForm({ opened, onClose, onSubmit, initialSong }: SongFormProps) {
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [syncToolOpened, { open: openSyncTool, close: closeSyncTool }] = useDisclosure(false);
  const form = useForm<Omit<Song, 'id' | 'createdAt' | 'updatedAt'>>({
    initialValues: {
      title: '',
      artist: '',
      audioUrl: '',
      lyrics: [],
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (initialSong) {
        setLoadingAudio(true);
        try {
          // Load audio từ IndexedDB khi edit
          const songWithAudio = await getSongWithAudio(initialSong.id);
          console.debug("🚀 ~ loadInitialData ~ songWithAudio:", songWithAudio)
          form.setValues({
            title: initialSong.title,
            artist: initialSong.artist,
            audioUrl: songWithAudio?.audioUrl || '',
            lyrics: initialSong.lyrics,
          });
        } catch (error) {
          console.error('Failed to load audio:', error);
          form.setValues({
            title: initialSong.title,
            artist: initialSong.artist,
            audioUrl: '',
            lyrics: initialSong.lyrics,
          });
        } finally {
          setLoadingAudio(false);
        }
      } else {
        form.reset();
      }
    };

    if (opened) {
      loadInitialData();
    }
  }, [initialSong, opened]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        form.setFieldValue('audioUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLyricLine = () => {
    const newLine: LyricLine = {
      id: nanoid(),
      text: '',
      startTime: 0,
      endTime: 5,
      effect: 'highlight',
    };
    form.insertListItem('lyrics', newLine);
  };

  // Parse lyric text theo format [startTime:endTime] Text
  const parseLyricText = (text: string): { startTime: number; endTime: number; lyricText: string } | null => {
    const match = text.match(/^\[(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)\]\s*(.+)$/);
    if (match) {
      return {
        startTime: parseFloat(match[1]),
        endTime: parseFloat(match[2]),
        lyricText: match[3].trim(),
      };
    }
    return null;
  };

  const [bulkImportText, setBulkImportText] = useState('');

  const handleBulkImport = () => {
    if (!bulkImportText.trim()) return;

    const lines = bulkImportText.split('\n').filter(line => line.trim());
    const parsedLines: LyricLine[] = [];

    lines.forEach((line) => {
      const parsed = parseLyricText(line.trim());
      if (parsed) {
        parsedLines.push({
          id: nanoid(),
          text: parsed.lyricText,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          effect: 'highlight',
        });
      }
    });

    if (parsedLines.length > 0) {
      // Thêm vào lyrics hiện có
      form.setFieldValue('lyrics', [...form.values.lyrics, ...parsedLines]);
      setBulkImportText('');
    }
  };

  const removeLyricLine = (index: number) => {
    form.removeListItem('lyrics', index);
  };

  const handleSubmit = (values: typeof form.values) => {
    const song: Song = {
      id: initialSong?.id || nanoid(),
      ...values,
      createdAt: initialSong?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSubmit(song);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialSong ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}
      size="xl"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Tên bài hát"
            placeholder="Nhập tên bài hát"
            required
            {...form.getInputProps('title')}
          />
          <TextInput
            label="Ca sĩ"
            placeholder="Nhập tên ca sĩ"
            required
            {...form.getInputProps('artist')}
          />
          <FileButton onChange={handleFileChange} accept="audio/*">
            {(props) => (
              <Button {...props} variant="outline" loading={loadingAudio}>
                {initialSong && form.values.audioUrl ? 'Thay đổi file audio' : 'Chọn file audio'}
              </Button>
            )}
          </FileButton>
          {form.values.audioUrl && (
            <Text size="sm" c="green">
              ✓ {initialSong ? 'Đã có file audio (chọn file mới để thay đổi)' : 'Đã chọn file audio'}
            </Text>
          )}
          {initialSong && !form.values.audioUrl && !loadingAudio && (
            <Text size="sm" c="orange">
              ⚠ Chưa có file audio. Vui lòng chọn file audio.
            </Text>
          )}

          <Group justify="space-between" mt="md">
            <Text fw={500}>Lời bài hát</Text>
            <Group gap="xs">
              {form.values.audioUrl && form.values.lyrics.length > 0 && (
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconClock size={16} />}
                  onClick={openSyncTool}
                >
                  Đồng bộ timing
                </Button>
              )}
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={addLyricLine}
              >
                Thêm dòng
              </Button>
            </Group>
          </Group>

          <Tabs defaultValue="manual">
            <Tabs.List>
              <Tabs.Tab value="manual">Nhập thủ công</Tabs.Tab>
              <Tabs.Tab value="bulk">Nhập hàng loạt</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="manual" pt="md">
              <Stack gap="sm">
                {form.values.lyrics.map((line, index) => (
                  <Group key={line.id} align="flex-start" wrap="nowrap">
                    <Textarea
                      placeholder="Nhập lời bài hát"
                      style={{ flex: 1 }}
                      {...form.getInputProps(`lyrics.${index}.text`)}
                    />
                    <TextInput
                      type="number"
                      step="0.1"
                      placeholder="Bắt đầu (s)"
                      style={{ width: 100 }}
                      {...form.getInputProps(`lyrics.${index}.startTime`)}
                    />
                    <TextInput
                      type="number"
                      step="0.1"
                      placeholder="Kết thúc (s)"
                      style={{ width: 100 }}
                      {...form.getInputProps(`lyrics.${index}.endTime`)}
                    />
                    <Select
                      placeholder="Hiệu ứng"
                      style={{ width: 120 }}
                      data={EFFECTS}
                      value={line.effect || 'highlight'}
                      onChange={(value) => form.setFieldValue(`lyrics.${index}.effect`, value as LyricEffect)}
                    />
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeLyricLine(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="bulk" pt="md">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Nhập lyric theo format: <code>[startTime:endTime] Text</code>
                  <br />
                  Ví dụ: <code>[0:5] Cũng đã đến lúc nghẹn ngào</code>
                </Text>
                <Textarea
                  placeholder={`[0:5] Cũng đã đến lúc nghẹn ngào
[5:10] Nói lời chào đến mối tình đầu
[10:15] Một cuốn sách ngọt ngào mà đôi ta từng viết
[15:20] Em như bông hoa mặt trời
[20:25] Có nụ cười đốt cháy lòng người
[25:30] Có lẽ em là thanh xuân của tôi`}
                  rows={10}
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                />
                <Button
                  variant="light"
                  onClick={handleBulkImport}
                  disabled={!bulkImportText.trim()}
                >
                  Thêm vào danh sách
                </Button>
                <Text size="xs" c="dimmed">
                  Mỗi dòng phải theo format [startTime:endTime] Text. Sau khi nhập xong, nhấn nút "Thêm vào danh sách"
                </Text>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {form.values.lyrics.length === 0 && (
            <Text c="dimmed" size="sm" ta="center" py="md">
              Chưa có dòng lyric nào. Nhấn "Thêm dòng" để bắt đầu.
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={(!form.values.audioUrl && !initialSong) || form.values.lyrics.length === 0}
              loading={loadingAudio}
            >
              {initialSong ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Group>
        </Stack>
      </form>

      <LyricSyncTool
        opened={syncToolOpened}
        onClose={closeSyncTool}
        lyrics={form.values.lyrics}
        audioUrl={form.values.audioUrl}
        onSyncComplete={(syncedLyrics) => {
          form.setFieldValue('lyrics', syncedLyrics);
        }}
      />
    </Modal>
  );
}
