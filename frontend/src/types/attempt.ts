export interface AttemptPayload {
  quiz_id: number;
  score: number;
  total: number;
}

export interface AttemptResponse {
  id: number;
  quiz_id: number;
  score: number;
  total: number;
  created_at: string;
}

export interface LocalAttemptRecord extends AttemptPayload {
  local_id: string;
  synced: boolean;
  created_at: string;
}
