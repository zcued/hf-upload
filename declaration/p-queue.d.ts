declare class Queue {
    _queue: Array<Function>;
    idMap: Map<string, Function>;
    constructor();
    enqueue(run: Function, options: {
        id: any;
    }): void;
    dequeue(): Function;
    clearWithId(id: any): void;
    clear(): void;
    get size(): number;
}
export default class PQueue {
    queue: Queue;
    _pendingCount: number;
    _concurrency: number;
    _resolveEmpty: () => void;
    constructor(opts: any);
    _next(): void;
    add(fn: any, opts: any): Promise<unknown>;
    clear(): void;
    clearWithId(id: any): void;
    onEmpty(): Promise<unknown>;
    get size(): number;
    get pending(): number;
}
export {};
