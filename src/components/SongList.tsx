import { Box, Card, Text, Group, Button, Stack, ActionIcon, Badge } from '@mantine/core';
import { IconPlayerPlay, IconEdit, IconTrash, IconMusic } from '@tabler/icons-react';
import type { Song } from '../types';
import classes from './SongList.module.css';

interface SongListProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  onSelect: (song: Song) => void;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
}

export function SongList({ songs, onPlay, onSelect, onEdit, onDelete }: SongListProps) {
  if (songs.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <IconMusic size={48} stroke={1.5} />
        <Text size="lg" c="dimmed" mt="md">
          Chưa có bài hát nào
        </Text>
        <Text size="sm" c="dimmed">
          Thêm bài hát mới để bắt đầu
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      {songs.map((song) => (
        <Card
          key={song.id}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          className={classes.card}
          onClick={() => onSelect(song)}
        >
          <Stack gap="xs">
            <Box style={{ flex: 1 }}>
              <Group gap="xs" mb="xs">
                <Text fw={500} size="lg">
                  {song.title}
                </Text>
                <Badge variant="light" color="green">
                  {song.lyrics.length} dòng
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {song.artist}
              </Text>
            </Box>
            <Group gap="xs">
              <Button
                size="sm"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(song);
                }}
              >
                Phát
              </Button>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(song);
                }}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(song.id);
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
