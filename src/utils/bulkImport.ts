import { nanoid } from "nanoid";
import type { LyricEffect, LyricLine } from "../types";

/**
 * Convert lyric with time to LyricLine[]
 * @param bulkImportText 
 *  format: [effect] [startTime:endTime] Text lyric \n
 *  example: [highlight] [0:5] Text
 *  example: [scroll] [5:10] Text
 *  example: [typewriter] [10:15] Text
 *  example: [fade] [15:20] Text
 *  example: [matrix] [20:25] Text
 * @returns LyricLine[]
 */
export const convertLyricWithTimeToLyricLine = (bulkImportText: string): LyricLine[]=> {
    if (!bulkImportText.trim()) return [];

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
          effect: parsed.effect || 'highlight',
        });
      }
    });
   return parsedLines;
  };


    // Parse lyric text theo format [startTime:endTime] Text
export const parseLyricText = (text: string): { startTime: number; endTime: number; lyricText: string, effect: LyricEffect } | null => {
		const match = text.match(/^\[([\w]+)\]\s*\[(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)\]\s*(.+)$/);
		if (match) {
		  return {
			effect: match[1].trim() as LyricEffect,
			startTime: parseFloat(match[2]),
			endTime: parseFloat(match[3]),
			lyricText: match[4].trim(),
		  };
		}
		return null;
	  };