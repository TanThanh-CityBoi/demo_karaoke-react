import { useMemo, useRef, useEffect, useState } from 'react';
import { Button, Slider, Group, Text, Stack, Center } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconPlayerSkipBack, IconPlayerSkipForward } from '@tabler/icons-react';
import type { TerminalThemeId } from '../types';
import { TERMINAL_THEMES } from '../types';
import classes from './AudioPlayer.module.css';

interface AudioPlayerProps {
  audioUrl: string | null;
  onTimeUpdate: (currentTime: number) => void;
  onEnded: () => void;
  theme?: TerminalThemeId;
  /** Khi true, tự phát sau khi load xong (dùng khi user bấm Phát trên card) */
  autoPlay?: boolean;
  /** Gọi sau khi đã bắt đầu phát do autoPlay */
  onAutoPlayStarted?: () => void;
}

function getThemeVars(themeId: TerminalThemeId): React.CSSProperties {
  const theme = TERMINAL_THEMES.find((t) => t.id === themeId) ?? TERMINAL_THEMES[0];
  return {
    ['--player-primary' as string]: theme.primary,
    ['--player-primary-rgb' as string]: theme.primaryRgb,
    ['--player-dim' as string]: theme.dim,
  };
}

export function AudioPlayer({ audioUrl, onTimeUpdate, onEnded, theme = 'green', autoPlay = false, onAutoPlayStarted }: AudioPlayerProps) {
  const themeVars = useMemo(() => getThemeVars(theme), [theme]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  const onAutoPlayStartedRef = useRef(onAutoPlayStarted);
  onAutoPlayStartedRef.current = onAutoPlayStarted;
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;

  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    const audio = audioRef.current;
    const shouldAutoPlay = autoPlayRef.current;
    audio.src = audioUrl;
    audio.load();

    if (shouldAutoPlay) {
      const tryPlay = () => {
        audio.play().then(() => {
          setIsPlaying(true);
          onAutoPlayStartedRef.current?.();
        }).catch((err) => {
          console.error('AutoPlay failed:', err);
        });
      };
      if (audio.readyState >= 3) {
        tryPlay();
      } else {
        const handler = () => tryPlay();
        audio.addEventListener('canplay', handler, { once: true });
        return () => audio.removeEventListener('canplay', handler);
      }
    } else {
      setIsPlaying(false);
    }
    // Chỉ chạy khi đổi bài - không chạy khi autoPlay đổi (tránh reload và dừng phát)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Khi bấm Phát trên card cùng bài đã chọn: audioUrl không đổi, cần play()
  useEffect(() => {
    if (!autoPlay || !audioUrl || !audioRef.current) return;
    const audio = audioRef.current;
    if (audio.src && audio.readyState >= 2) {
      audio.play().then(() => {
        setIsPlaying(true);
        onAutoPlayStartedRef.current?.();
      }).catch((err) => console.error('Play failed:', err));
    }
  }, [autoPlay, audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Play failed:', err);
      });
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

    audio.currentTime = value;
    setCurrentTime(value);
  };

  const SKIP_SECONDS = 10;

  const skipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - SKIP_SECONDS);
    setCurrentTime(audio.currentTime);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + SKIP_SECONDS);
    setCurrentTime(audio.currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Stack gap="sm" className={classes.playerContainer} style={themeVars}>
      <audio ref={audioRef} preload="metadata" />
      <Stack gap={0}>
      <Group justify='space-between'>
        <Text size="sm" c="dimmed" className={classes.timeText} ta={'start'}>
          {formatTime(currentTime)}
        </Text>
        <Text size="sm" c="dimmed" className={classes.timeText} ta={'end'}>
          {formatTime(duration)}
        </Text>
      </Group>
      
      <Slider
        label={(value) => formatTime(value)}
        value={currentTime}
        max={duration || 100}
        onChange={handleSeek}
        disabled={!audioUrl || duration === 0}
        className={classes.slider}
        color={'var(--player-primary)'}
        size="md"
        thumbChildren={<Center fz={18}>🐳</Center>}
        thumbSize={32}
        styles={{ thumb: { borderWidth: 2, padding: 3 } }}
      />
      </Stack>

      <Group gap="md" align="center" wrap="nowrap" py="md" justify='center'>
        <Button
          variant="subtle"
          color={'var(--player-primary)'}
          onClick={skipBack}
          disabled={!audioUrl}
          title="Tua lại 10s"
        >
          <IconPlayerSkipBack size={20} />
        </Button>
        <Button
          variant="filled"
          color={'var(--player-primary)'}
          onClick={togglePlay}
          disabled={!audioUrl}
        >
          {isPlaying ? <IconPlayerPause color={'var(--player-dim)'} size={20} /> : <IconPlayerPlay color={'var(--player-dim)'} size={20} />}
        </Button>
        <Button
          variant="subtle"
          color={'var(--player-primary)'}
          onClick={skipForward}
          disabled={!audioUrl}
          title="Tua nhanh 10s"
        >
          <IconPlayerSkipForward size={20} />
        </Button>
        <Button
          variant="outline"
          color={'var(--player-primary)'}
          onClick={stop}
          disabled={!audioUrl}
          leftSection={<IconPlayerStop size={20} />}
        >
          Stop
        </Button>
      </Group>
    </Stack>
  );
}
