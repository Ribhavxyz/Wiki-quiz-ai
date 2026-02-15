import api from "./axios";
import type { AttemptPayload, AttemptResponse } from "../types/attempt";

export const createAttempt = async (payload: AttemptPayload): Promise<AttemptResponse> => {
  const res = await api.post<AttemptResponse>("/attempts", payload);
  return res.data;
};
