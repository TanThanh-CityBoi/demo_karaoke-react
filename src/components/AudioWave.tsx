import { useMemo } from 'react';
import { Box } from '@mantine/core';
import type { TerminalThemeId } from '../types';
import { TERMINAL_THEMES } from '../types';
import classes from './AudioWave.module.css';

interface AudioWaveProps {
  theme?: TerminalThemeId;
  barCount?: number;
  height?: number;
}

function getThemeVars(themeId: TerminalThemeId): React.CSSProperties {
  const theme = TERMINAL_THEMES.find((t) => t.id === themeId) ?? TERMINAL_THEMES[0];
  return {
    ['--wave-primary' as string]: theme.primary,
    ['--wave-primary-rgb' as string]: theme.primaryRgb,
    ['--wave-dim' as string]: theme.dim,
  };
}

export function AudioWave({ theme = 'green', barCount = 80, height = 200 }: AudioWaveProps) {
  const themeVars = useMemo(() => getThemeVars(theme), [theme]);

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const seed = (i * 7 + 13) % 100;
      const baseHeight = 18 + (seed % 30);
      const delay = (i * 0.025) % 2.5;
      const duration = 0.8 + ((i * 11) % 7) * 0.1;
      return { id: i, baseHeight, delay, duration };
    });
  }, [barCount]);

  return (
    <Box className={classes.waveContainer} style={{ ...themeVars, height }}>
      <div className={classes.waveInner}>
        {bars.map((bar) => (
          <div
            key={bar.id}
            className={classes.bar}
            style={{
              ['--bar-height' as string]: `${bar.baseHeight}%`,
              ['--bar-delay' as string]: `${bar.delay}s`,
              ['--bar-duration' as string]: `${bar.duration}s`,
            }}
          />
        ))}
      </div>
    </Box>
  );
}
