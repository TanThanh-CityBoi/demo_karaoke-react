import { useState, useEffect } from 'react';
import {
  Container,
  AppShell,
  Burger,
  Group,
  Button,
  Title,
  Stack,
  Select,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconMusic } from '@tabler/icons-react';
import type { Song, LyricEffect, TerminalThemeId } from './types';
import { TERMINAL_THEMES } from './types';
import { getSongs, addSong, updateSong, deleteSong, getSongWithAudio } from './utils/storage';
import { createNangThoMockData } from './data/mockSongs';
import { LyricDisplay } from './components/LyricDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import { SongList } from './components/SongList';
import { SongForm } from './components/SongForm';
import classes from './App.module.css';

const EFFECTS: { value: LyricEffect; label: string }[] = [
  { value: 'scroll', label: 'Cuộn' },
  { value: 'highlight', label: 'Làm nổi bật' },
  { value: 'typewriter', label: 'Đánh máy' },
  { value: 'fade', label: 'Mờ dần' },
  { value: 'matrix', label: 'Matrix' },
];

const TERMINAL_THEME_OPTIONS = TERMINAL_THEMES.map((t) => ({ value: t.id, label: t.label }));

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState<LyricEffect>('highlight');
  const [terminalTheme, setTerminalTheme] = useState<TerminalThemeId>('ice');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  useEffect(() => {
    const loadSongs = async () => {
      let loadedSongs = await getSongs();
      
      // Kiểm tra xem đã có bài mock chưa, nếu chưa thì thêm vào
      const hasMockSong = loadedSongs.some(s => s.id === 'nang-tho-mock');
      if (!hasMockSong) {
        try {
          const mockSong = await createNangThoMockData();
          await addSong(mockSong);
          loadedSongs = await getSongs();
        } catch (error) {
          console.error('Failed to load mock data:', error);
        }
      }
      
      setSongs(loadedSongs);
    };
    loadSongs();
  }, []);

  const handleAddSong = () => {
    setEditingSong(null);
    openForm();
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    openForm();
  };

  const handleSubmitSong = async (song: Song) => {
    try {
      if (editingSong) {
        await updateSong(song.id, song);
        notifications.show({
          title: 'Thành công',
          message: 'Đã cập nhật bài hát',
          color: 'green',
        });
      } else {
        await addSong(song);
        notifications.show({
          title: 'Thành công',
          message: 'Đã thêm bài hát mới',
          color: 'green',
        });
      }
      const loadedSongs = await getSongs();
      setSongs(loadedSongs);
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể lưu bài hát. Vui lòng thử lại.',
        color: 'red',
      });
      console.error('Failed to save song:', error);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bài hát này?')) {
      try {
        await deleteSong(id);
        const loadedSongs = await getSongs();
        setSongs(loadedSongs);
        if (currentSong?.id === id) {
          setCurrentSong(null);
        }
        notifications.show({
          title: 'Đã xóa',
          message: 'Bài hát đã được xóa',
          color: 'blue',
        });
      } catch (error) {
        notifications.show({
          title: 'Lỗi',
          message: 'Không thể xóa bài hát. Vui lòng thử lại.',
          color: 'red',
        });
        console.error('Failed to delete song:', error);
      }
    }
  };

  const handlePlaySong = async (song: Song) => {
    try {
      // Load audio từ IndexedDB
      const songWithAudio = await getSongWithAudio(song.id);
      if (songWithAudio) {
        setCurrentSong(songWithAudio);
      } else {
        notifications.show({
          title: 'Lỗi',
          message: 'Không thể tải audio của bài hát',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tải bài hát. Vui lòng thử lại.',
        color: 'red',
      });
      console.error('Failed to load song:', error);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleAudioEnded = () => {
    setCurrentTime(0);
    notifications.show({
      title: 'Hoàn thành',
      message: 'Bài hát đã kết thúc',
      color: 'blue',
    });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <IconMusic size={24} />
            <Title order={3}>Music App</Title>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddSong}
          >
            Thêm bài hát
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="md">
          <Select
            label="Hiệu ứng lyric"
            value={selectedEffect}
            onChange={(value) => setSelectedEffect(value as LyricEffect)}
            data={EFFECTS}
          />
          <Select
            label="Theme terminal"
            value={terminalTheme}
            onChange={(value) => setTerminalTheme((value as TerminalThemeId) ?? 'green')}
            data={TERMINAL_THEME_OPTIONS}
          />
          <SongList
            songs={songs}
            onPlay={handlePlaySong}
            onEdit={handleEditSong}
            onDelete={handleDeleteSong}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container fluid>
          <Stack gap="md">
            <Paper p="md" withBorder className={classes.lyricContainer}>
              {currentSong ? (
                <LyricDisplay
                  currentSong={currentSong}
                  currentTime={currentTime}
                  defaultEffect={selectedEffect}
                  theme={terminalTheme}
                />
              ) : (
                <div className={classes.emptyLyric}>
                  <IconMusic size={64} stroke={1.5} />
                  <Title order={3} c="dimmed" mt="md">
                    Chọn một bài hát để phát
                  </Title>
                </div>
              )}
            </Paper>
            {
              currentSong && (
                <AudioPlayer
                    audioUrl={currentSong.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    theme={terminalTheme}
                />
              )
            }
          </Stack>
        </Container>
      </AppShell.Main>

      <SongForm
        opened={formOpened}
        onClose={() => {
          closeForm();
          setEditingSong(null);
        }}
        onSubmit={handleSubmitSong}
        initialSong={editingSong}
      />
    </AppShell>
  );
}

export default App;
