/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Events are named via string or symbol
 *
 * @module aws-crt
 * @category Events
 */
declare type EventKey = string | symbol;
/**
 * Provides buffered event emitting semantics, similar to many Node-style streams.
 * Subclasses will override {@link BufferedEventEmitter.on} and trigger uncorking.
 * NOTE: It is HIGHLY recommended that uncorking should always be done via
 * ```process.nextTick()```, not during the {@link BufferedEventEmitter.on} call.
 *
 * See also: [Node writable streams](https://nodejs.org/api/stream.html#stream_writable_cork)
 *
 * @module aws-crt
 * @category Events
 */
export declare class BufferedEventEmitter extends EventEmitter {
    private corked;
    private eventQueue?;
    private lastQueuedEvent?;
    constructor();
    /**
     * Forces all written events to be buffered in memory. The buffered data will be
     * flushed when {@link BufferedEventEmitter.uncork} is called.
     */
    cork(): void;
    /**
     * Flushes all data buffered since {@link BufferedEventEmitter.cork} was called.
     *
     * NOTE: It is HIGHLY recommended that uncorking should always be done via
     * ``` process.nextTick```, not during the ```EventEmitter.on()``` call.
     */
    uncork(): void;
    /**
     * Synchronously calls each of the listeners registered for the event key supplied
     * in registration order. If the {@link BufferedEventEmitter} is currently corked,
     * the event will be buffered until {@link BufferedEventEmitter.uncork} is called.
     * @param event The name of the event
     * @param args Event payload
     */
    emit(event: EventKey, ...args: any[]): boolean;
}
export {};
