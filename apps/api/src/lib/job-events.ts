import { EventEmitter } from "node:events";

class JobEvents extends EventEmitter {
  emitUpdate(jobId: string, payload: unknown) {
    this.emit(jobId, payload);
  }

  onUpdate(jobId: string, listener: (payload: unknown) => void) {
    this.on(jobId, listener);
    return () => this.removeListener(jobId, listener);
  }
}

export const jobEvents = new JobEvents();
