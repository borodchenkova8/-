const DB_NAME = "habit-tracker";
const DB_VERSION = 1;
const STORE_NAME = "habits";
const LS_KEY = "habit_tracker_data";
const DB_CLEARED_FLAG = "habit_db_cleared_v1";

interface LocalHabit {
  id: string;
  title: string;
  description?: string;
  type: "discrete" | "numeric";
  goal: number;
  cells: Record<string, boolean>;
  numericValue?: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveToLocalStorage(habits: LocalHabit[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(habits));
  } catch {
    // localStorage may be full or unavailable
  }
}

export async function saveHabits(habits: LocalHabit[]): Promise<void> {
  saveToLocalStorage(habits);

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.clear();

    for (const habit of habits) {
      store.put(habit);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch {
    // IndexedDB unavailable, localStorage already saved
  }
}

export async function loadHabits(): Promise<LocalHabit[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    const habits = await new Promise<LocalHabit[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (habits.length > 0) {
      return habits;
    }
  } catch {
    // IndexedDB unavailable, fall through
  }

  return null;
}

export function loadFromLocalStorage(): LocalHabit[] | null {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const parsed: LocalHabit[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // corrupted data
  }
  return null;
}

export function clearOldDataOnce(): void {
  try {
    if (localStorage.getItem(DB_CLEARED_FLAG)) return;
    localStorage.removeItem(LS_KEY);
    localStorage.setItem(DB_CLEARED_FLAG, "true");
  } catch {
    // ignore
  }

  try {
    indexedDB.deleteDatabase(DB_NAME);
  } catch {
    // ignore
  }
}
