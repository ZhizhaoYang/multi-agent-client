import { SourceBuffer, IStreamBufferManager } from './models';

/**
 * StreamBufferManager
 *
 * Manages multiple source buffers to ensure segments are displayed in order.
 * Handles out-of-order arrival, deduplication, and consecutive display.
 */
export class StreamBufferManager implements IStreamBufferManager {
  private buffers = new Map<string, SourceBuffer>();

  /**
   * Add a segment to the specified source buffer
   */
  addSegment(sourceKey: string, segmentId: number, content: string): string {
    const buffer = this.getOrCreateBuffer(sourceKey);

    // Handle segment_id=0 as initial signal
    if (segmentId === 0) {
      // Skip duplicates
      if (buffer.received.has(segmentId)) {
        return this.getDisplayText(sourceKey);
      }

      // Store initial signal and mark as received
      buffer.initialSignal = content;
      buffer.received.add(segmentId);
      return this.getDisplayText(sourceKey);
    }

    // Skip duplicates for regular segments
    if (buffer.received.has(segmentId)) {
      return this.getDisplayText(sourceKey);
    }

    // Clear initial signal when real content starts arriving
    if (segmentId >= 1 && buffer.initialSignal !== null) {
      buffer.initialSignal = null;
    }

    // Insert segment and update cursor
    this.insertSegment(buffer, segmentId, content);
    this.updateCursor(buffer, segmentId);

    return this.getDisplayText(sourceKey);
  }

  /**
   * Mark a source stream as complete
   */
  markComplete(sourceKey: string): void {
    const buffer = this.buffers.get(sourceKey);
    if (buffer) {
      buffer.isComplete = true;
      // Clear initial signal when stream completes
      buffer.initialSignal = null;
    }
  }

  /**
   * Get current displayable text for a source
   */
  getDisplayText(sourceKey: string): string {
    const buffer = this.buffers.get(sourceKey);
    if (!buffer) {
      return "";
    }

    const realContent = buffer.segments
      .slice(0, buffer.displayCursor + 1)
      .filter(segment => segment !== null)
      .join('');

    // If no real content but we have an initial signal, show it
    if (realContent === "" && buffer.initialSignal !== null) {
      return buffer.initialSignal;
    }

    return realContent;
  }

  /**
   * Reset all buffers (clear everything)
   */
  reset(): void {
    this.buffers.clear();
  }

  /**
   * Delete specific source buffer
   */
  deleteSource(sourceKey: string): void {
    this.buffers.delete(sourceKey);
  }

  private getOrCreateBuffer(sourceKey: string): SourceBuffer {
    if (!this.buffers.has(sourceKey)) {
      this.buffers.set(sourceKey, {
        segments: [],
        displayCursor: -1,
        received: new Set(),
        isComplete: false,
        initialSignal: null
      });
    }
    return this.buffers.get(sourceKey)!;
  }

  /**
   * Insert segment at correct position in buffer
   */
  private insertSegment(buffer: SourceBuffer, segmentId: number, content: string): void {
    const index = segmentId - 1; // Convert to 0-based index

    // Extend array if needed to accommodate this segment
    while (buffer.segments.length <= index) {
      buffer.segments.push(null);
    }

    // Insert content and mark as received
    buffer.segments[index] = content;
    buffer.received.add(segmentId);
  }

  /**
   * Update display cursor using optimized incremental advancement
   */
  private updateCursor(buffer: SourceBuffer, insertedSegmentId: number): void {
    const insertedIndex = insertedSegmentId - 1;

    // Quick optimization: only advance if we got the next expected segment
    if (insertedIndex !== buffer.displayCursor + 1) {
      return; // Most calls will exit here instantly
    }

    // Advance cursor incrementally while we have consecutive segments
    let cursor = buffer.displayCursor;
    while (cursor + 1 < buffer.segments.length &&
           buffer.segments[cursor + 1] !== null) {
      cursor++;
    }

    buffer.displayCursor = cursor;
  }
}