import { useEffect, useRef, useMemo } from 'react';
import { Box, Text, Tabs, Group, ScrollArea } from '@mantine/core';
import { IconWaveSawTool, IconList } from '@tabler/icons-react';
import type { LyricLine, LyricEffect, TerminalThemeId, Song } from '../types';
import { TERMINAL_THEMES } from '../types';
import { AudioWave } from './AudioWave';
import classes from './LyricDisplay.module.css';

interface LyricDisplayProps {
  currentSong: Song;
  currentTime: number;
  defaultEffect?: LyricEffect;
  theme?: TerminalThemeId;
}

function getThemeVars(themeId: TerminalThemeId): React.CSSProperties {
  const theme = TERMINAL_THEMES.find((t) => t.id === themeId) ?? TERMINAL_THEMES[0];
  return {
    ['--term-primary' as string]: theme.primary,
    ['--term-primary-rgb' as string]: theme.primaryRgb,
    ['--term-dim' as string]: theme.dim,
  };
}

export function LyricDisplay({ currentSong, currentTime, defaultEffect = 'highlight', theme = 'green' }: LyricDisplayProps) {
  const { lyrics } = currentSong;
  const containerRef = useRef<HTMLDivElement>(null);
  const prevActiveIndexRef = useRef(-1);

  // Tính toán activeIndex dựa trên currentTime (sử dụng useMemo để tránh tính toán lại không cần thiết)
  const activeIndex = useMemo(() => {
    return lyrics.findIndex(
      (line, i) =>
        currentTime >= line.startTime &&
        (i === lyrics.length - 1 || currentTime < lyrics[i + 1].startTime)
    );
  }, [currentTime, lyrics]);

  // Tính toán displayText dựa trên effect của dòng
  const displayText = useMemo(() => {
    if (activeIndex >= 0 && activeIndex < lyrics.length) {
      const line = lyrics[activeIndex];
      const lineEffect = line.effect || defaultEffect;
      const progress = (currentTime - line.startTime) / (line.endTime - line.startTime);

      if (lineEffect === 'typewriter') {
        const charsToShow = Math.floor(line.text.length * Math.min(progress, 1));
        return line.text.slice(0, charsToShow);
      }
      return line.text;
    }
    return '';
  }, [currentTime, activeIndex, lyrics, defaultEffect]);

  // Scroll to active line (chỉ khi activeIndex thay đổi)
  useEffect(() => {
    if (activeIndex !== prevActiveIndexRef.current && activeIndex >= 0 && containerRef.current) {
      prevActiveIndexRef.current = activeIndex;
      // Sử dụng requestAnimationFrame để defer DOM update
      requestAnimationFrame(() => {
        const activeElement = containerRef.current?.children[activeIndex] as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }, [activeIndex]);

  const getLineClassName = (index: number, line: LyricLine) => {
    if (index === activeIndex) {
      const lineEffect = line.effect || defaultEffect;
      return `${classes.line} ${classes.active} ${classes[lineEffect]}`;
    }
    if (index < activeIndex) {
      return `${classes.line} ${classes.past}`;
    }
    return `${classes.line} ${classes.upcoming}`;
  };

  const visibleLinesEffect = useMemo(() => {
    const windowSize = 3;
    const start = Math.max(0, activeIndex - 1);
    const end = Math.min(lyrics.length, activeIndex + windowSize);
    return { start, end, lines: lyrics.slice(start, end) };
  }, [lyrics, activeIndex]);

  return (
    <Box className={classes.terminalContainer} style={getThemeVars(theme)}>
      <Box className={classes.terminalWrapper}>
        <Tabs defaultValue="effect" classNames={{ list: classes.tabsList, tab: classes.tab }}>
          <Group className={classes.terminalHeader} justify="space-between" gap={0}>
          <Box flex={1}>
            <Text size="sm" c="dimmed" className={classes.terminalTitle}>
              {currentSong.title} - {currentSong.artist}
            </Text>
          </Box>
          <Tabs.List grow p={0}>
            <Tabs.Tab value="effect" leftSection={<IconWaveSawTool size={16} />}>
            </Tabs.Tab>
            <Tabs.Tab value="full" leftSection={<IconList size={16} />}>
            </Tabs.Tab>
          </Tabs.List>
          </Group>

          <Tabs.Panel value="effect" pt="md">
            <Box h={500} className={classes.terminalBody} style={{ paddingTop: 16 }}>
              {visibleLinesEffect.lines.map((line, i) => {
                const index = visibleLinesEffect.start + i;
                const isActive = index === activeIndex;
                const lineEffect = line.effect || defaultEffect;
                const showTypewriter = isActive && lineEffect === 'typewriter';
                return (
                  <Text
                    key={line.id}
                    className={getLineClassName(index, line)}
                    data-active={isActive}
                  >
                    {showTypewriter ? displayText : line.text}
                    {showTypewriter && <span className={classes.cursor}>_</span>}
                  </Text>
                );
              })}
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="full" pt="md">
            <ScrollArea h={500} className={classes.terminalBody} ref={containerRef} style={{ paddingTop: 16 }}>
              {lyrics.map((line, index) => {
                const isActive = index === activeIndex;
                const lineEffect = line.effect || defaultEffect;
                const showTypewriter = isActive && lineEffect === 'typewriter';
                return (
                  <Text
                    key={line.id}
                    className={getLineClassName(index, line)}
                    data-active={isActive}
                  >
                    {showTypewriter ? displayText : line.text}
                    {showTypewriter && <span className={classes.cursor}>_</span>}
                  </Text>
                );
              })}
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Box>
      <AudioWave theme={theme} />
    </Box>
  );
}
