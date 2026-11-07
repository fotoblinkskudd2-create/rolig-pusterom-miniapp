package com.example.predictionmachine.core;

import java.time.Instant;

/**
 * One raw market observation for one period, as delivered by a {@code DataConnector}.
 *
 * <p>{@code returnValue} is the return realised over the period ending at {@code timestamp}.
 * {@code imbalance} is a signal that was known at the close of that same period
 * (for example order-book imbalance). Nothing in a Tick is "future" relative to its timestamp.
 *
 * <p>TODO: real connectors will map venue-specific payloads (order book snapshots, trade prints,
 * poll rows, event-price histories) onto this shape, or onto a richer record that carries
 * {@code availableAt}, the time the value was actually public. Point-in-time correctness
 * depends on that second timestamp.
 *
 * @param timestamp   end of the period, UTC
 * @param returnValue realised return of the period (simple or log, be consistent)
 * @param imbalance   signal known at {@code timestamp}
 */
public record Tick(Instant timestamp, double returnValue, double imbalance) {
}
