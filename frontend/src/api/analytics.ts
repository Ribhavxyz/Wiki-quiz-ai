import api from "./axios";
import type { AnalyticsResponse } from "../types/analytics";

export const fetchAnalytics = async (): Promise<AnalyticsResponse> => {
  const res = await api.get<AnalyticsResponse>("/analytics");
  return res.data;
};
