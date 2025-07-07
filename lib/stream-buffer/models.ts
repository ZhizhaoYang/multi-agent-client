export interface SourceBuffer {
  segments: (string | null)[];
  displayCursor: number;
  received: Set<number>;
  isComplete: boolean;
  initialSignal: string | null;
}

export interface IStreamBufferManager {
  addSegment(sourceKey: string, segmentId: number, content: string): string;

  markComplete(sourceKey: string): void;

  getDisplayText(sourceKey: string): string;

  reset(): void;

  deleteSource(sourceKey: string): void;
}
