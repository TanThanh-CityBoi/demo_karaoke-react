import { useRef, useEffect, useState } from 'react';
import { Box, Button, Slider, Group, Text } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop } from '@tabler/icons-react';
import classes from './AudioPlayer.module.css';

interface AudioPlayerProps {
  audioUrl: string | null;
  onTimeUpdate: (currentTime: number) => void;
  onEnded: () => void;
}

export function AudioPlayer({ audioUrl, onTimeUpdate, onEnded }: AudioPlayerProps) {
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

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box className={classes.playerContainer}>
      <audio ref={audioRef} preload="metadata" />
      <Group gap="md" align="center" wrap="nowrap">
        <Button
          variant="filled"
          color="green"
          onClick={togglePlay}
          disabled={!audioUrl}
          leftSection={isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button
          variant="outline"
          color="red"
          onClick={stop}
          disabled={!audioUrl}
          leftSection={<IconPlayerStop size={20} />}
        >
          Stop
        </Button>
        <Text size="sm" c="dimmed" className={classes.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </Group>
      <Slider
        value={currentTime}
        max={duration || 100}
        onChange={handleSeek}
        disabled={!audioUrl || duration === 0}
        className={classes.slider}
        color="green"
        size="md"
      />
    </Box>
  );
}
