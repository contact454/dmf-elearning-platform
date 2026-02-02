export interface VocabularyItem {
  word: string;
  pos: string;
  meaning_vi: string;
  source: string;
  addedAt: string;
}

export interface TopicData {
  topic: string;
  level: string;
  vocabulary: VocabularyItem[];
  count: number;
}

export interface LevelSummary {
  level: string;
  topicCount: number;
  topics: string[];
}
