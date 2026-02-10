import { useEffect, useRef, useMemo } from 'react';
import { Box, Text } from '@mantine/core';
import type { LyricLine, LyricEffect } from '../types';
import classes from './LyricDisplay.module.css';

interface LyricDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  defaultEffect?: LyricEffect; // Effect mặc định nếu dòng không có effect riêng
}

export function LyricDisplay({ lyrics, currentTime, defaultEffect = 'highlight' }: LyricDisplayProps) {
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

  return (
    <Box className={classes.terminalContainer} ref={containerRef}>
      <Box className={classes.terminalHeader}>
        <Text size="xs" c="dimmed" className={classes.terminalTitle}>
          KARAOKE TERMINAL v1.0
        </Text>
      </Box>
      <Box className={classes.terminalBody}>
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
      </Box>
    </Box>
  );
}
