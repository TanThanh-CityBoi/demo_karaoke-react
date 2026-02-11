import type { Song } from '../types';

const DB_NAME = 'karaoke-db';
const DB_VERSION = 2; // Tăng version để trigger migration
const STORE_SONGS = 'songs';
const STORE_AUDIO = 'audio';
const OLD_STORAGE_KEY = 'karaoke-songs';

let db: IDBDatabase | null = null;

// Khởi tạo IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Tạo store cho songs metadata
      if (!database.objectStoreNames.contains(STORE_SONGS)) {
        database.createObjectStore(STORE_SONGS, { keyPath: 'id' });
      }

      // Tạo store cho audio files
      if (!database.objectStoreNames.contains(STORE_AUDIO)) {
        database.createObjectStore(STORE_AUDIO, { keyPath: 'songId' });
      }
    };
  });
};

// Migration: Chuyển dữ liệu từ localStorage sang IndexedDB
const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (!oldData) return;

    const oldSongs: Song[] = JSON.parse(oldData);
    if (oldSongs.length === 0) return;

    const database = await initDB();

    // Migrate từng song
    for (const song of oldSongs) {
      // Lưu metadata
      const songWithoutAudio = { ...song, audioUrl: '' };
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction([STORE_SONGS], 'readwrite');
        const store = transaction.objectStore(STORE_SONGS);
        const request = store.put(songWithoutAudio);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Lưu audio nếu có
      if (song.audioUrl) {
        await saveAudio(song.id, song.audioUrl);
      }
    }

    // Xóa dữ liệu cũ từ localStorage
    localStorage.removeItem(OLD_STORAGE_KEY);
    console.log(`Migrated ${oldSongs.length} songs from localStorage to IndexedDB`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Chạy migration khi khởi tạo
let migrationDone = false;
const runMigration = async (): Promise<void> => {
  if (migrationDone) return;
  migrationDone = true;
  await migrateFromLocalStorage();
};

// Đảm bảo migration chạy khi init DB
const initDBWithMigration = async (): Promise<IDBDatabase> => {
  const database = await initDB();
  await runMigration();
  return database;
};

// Lưu audio file vào IndexedDB
const saveAudio = async (songId: string, audioData: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_AUDIO], 'readwrite');
    const store = transaction.objectStore(STORE_AUDIO);
    const request = store.put({ songId, audioData });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Lấy audio file từ IndexedDB
const getAudio = async (songId: string): Promise<string | null> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_AUDIO], 'readonly');
    const store = transaction.objectStore(STORE_AUDIO);
    const request = store.get(songId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.audioData : null);
    };
  });
};

// Xóa audio file từ IndexedDB
const deleteAudio = async (songId: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_AUDIO], 'readwrite');
    const store = transaction.objectStore(STORE_AUDIO);
    const request = store.delete(songId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Lấy tất cả songs (chỉ metadata, không có audio)
export const getSongs = async (): Promise<Song[]> => {
  try {
    const database = await initDBWithMigration();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_SONGS], 'readonly');
      const store = transaction.objectStore(STORE_SONGS);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const songs = request.result.map((song: Song) => ({
          ...song,
          audioUrl: '', // Không lưu audioUrl trong metadata
        }));
        resolve(songs);
      };
    });
  } catch {
    return [];
  }
};

// Lưu song metadata vào IndexedDB
const saveSongMetadata = async (song: Song): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_SONGS], 'readwrite');
    const store = transaction.objectStore(STORE_SONGS);
    const request = store.put(song);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Thêm song mới (lưu cả metadata và audio)
export const addSong = async (song: Song): Promise<void> => {
  try {
    await initDBWithMigration();
    // Tách audioUrl ra để lưu riêng
    const audioData = song.audioUrl;
    const songWithoutAudio = { ...song, audioUrl: '' };

    // Lưu metadata
    await saveSongMetadata(songWithoutAudio);

    // Lưu audio vào IndexedDB
    if (audioData) {
      await saveAudio(song.id, audioData);
    }
  } catch (error) {
    console.error('Failed to add song:', error);
    throw error;
  }
};

// Cập nhật song
export const updateSong = async (id: string, updates: Partial<Song>): Promise<void> => {
  try {
    await initDBWithMigration();
    const songs = await getSongs();
    const index = songs.findIndex((s) => s.id === id);
    if (index === -1) return;

    const updatedSong = { ...songs[index], ...updates, updatedAt: Date.now() };

    // Nếu có audioUrl mới, lưu vào IndexedDB
    if (updates.audioUrl) {
      await saveAudio(id, updates.audioUrl);
      updatedSong.audioUrl = '';
    }

    await saveSongMetadata(updatedSong);
  } catch (error) {
    console.error('Failed to update song:', error);
    throw error;
  }
};

// Xóa song
export const deleteSong = async (id: string): Promise<void> => {
  try {
    const database = await initDBWithMigration();

    // Xóa metadata
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORE_SONGS], 'readwrite');
      const store = transaction.objectStore(STORE_SONGS);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    // Xóa audio
    await deleteAudio(id);
  } catch (error) {
    console.error('Failed to delete song:', error);
    throw error;
  }
};

// Lấy song với audio URL
export const getSongWithAudio = async (songId: string): Promise<Song | null> => {
  try {
    await initDBWithMigration();
    const songs = await getSongs();
    const song = songs.find((s) => s.id === songId);
    if (!song) return null;

    const audioData = await getAudio(songId);
    return {
      ...song,
      audioUrl: audioData || '',
    };
  } catch (error) {
    console.error('Failed to get song with audio:', error);
    return null;
  }
};
