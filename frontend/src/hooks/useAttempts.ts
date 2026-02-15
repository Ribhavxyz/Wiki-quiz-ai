import { useCallback, useEffect, useMemo, useState } from "react";
import { createAttempt } from "../api/attempts";
import type { AttemptPayload, LocalAttemptRecord } from "../types/attempt";

const STORAGE_KEY = "wiki_quiz_attempts_v2";

const readStorage = (): LocalAttemptRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const writeStorage = (records: LocalAttemptRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const validateAttemptPayload = (payload: AttemptPayload) => {
  if (!Number.isInteger(payload.quiz_id) || payload.quiz_id <= 0) {
    throw new Error("Invalid quiz_id");
  }
  if (!Number.isFinite(payload.score) || payload.score < 0) {
    throw new Error("Invalid score");
  }
  if (!Number.isFinite(payload.total) || payload.total <= 0) {
    throw new Error("Invalid total");
  }
  if (payload.score > payload.total) {
    throw new Error("Score cannot be greater than total");
  }
};

export const useAttempts = () => {
  const [records, setRecords] = useState<LocalAttemptRecord[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setRecords(readStorage());
  }, []);

  const persistRecords = useCallback((next: LocalAttemptRecord[]) => {
    setRecords(next);
    writeStorage(next);
  }, []);

  const addAttempt = useCallback(
    async (payload: AttemptPayload) => {
      validateAttemptPayload(payload);

      const localRecord: LocalAttemptRecord = {
        ...payload,
        local_id: crypto.randomUUID(),
        synced: false,
        created_at: new Date().toISOString(),
      };

      const withNew = [localRecord, ...records];
      persistRecords(withNew);

      try {
        await createAttempt(payload);
        const syncedList = withNew.map((item) =>
          item.local_id === localRecord.local_id ? { ...item, synced: true } : item,
        );
        persistRecords(syncedList);
        setSyncError(null);
      } catch {
        setSyncError("Attempt saved locally. Sync will retry when online.");
      }
    },
    [persistRecords, records],
  );

  const retryPending = useCallback(async () => {
    const pending = records.filter((item) => !item.synced);
    if (!pending.length) return;

    setSyncing(true);
    try {
      const successful = new Set<string>();
      for (const item of pending) {
        try {
          await createAttempt({
            quiz_id: item.quiz_id,
            score: item.score,
            total: item.total,
          });
          successful.add(item.local_id);
        } catch {
          continue;
        }
      }

      const updated = records.map((item) =>
        successful.has(item.local_id) ? { ...item, synced: true } : item,
      );
      persistRecords(updated);

      if (updated.some((item) => !item.synced)) {
        setSyncError("Some attempts are still pending sync.");
      } else {
        setSyncError(null);
      }
    } finally {
      setSyncing(false);
    }
  }, [persistRecords, records]);

  useEffect(() => {
    const onOnline = () => {
      void retryPending();
    };
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, [retryPending]);

  const pendingCount = useMemo(
    () => records.filter((item) => !item.synced).length,
    [records],
  );

  return {
    records,
    pendingCount,
    syncError,
    syncing,
    addAttempt,
    retryPending,
  };
};
