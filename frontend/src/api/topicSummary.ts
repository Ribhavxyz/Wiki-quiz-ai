import api from "./axios";
import type { TopicSummaryResponse } from "../types/topicSummary";

export const fetchTopicSummary = async (topic: string): Promise<TopicSummaryResponse> => {
  const res = await api.get<TopicSummaryResponse>(
    `/topic-summary?topic=${encodeURIComponent(topic)}`,
  );
  return res.data;
};
