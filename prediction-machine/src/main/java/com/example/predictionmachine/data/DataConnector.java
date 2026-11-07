package com.example.predictionmachine.data;

import com.example.predictionmachine.core.Tick;

import java.time.Instant;
import java.util.List;

/**
 * Source of raw market ticks. One implementation per upstream source.
 *
 * <p>Contract: returned ticks are sorted by timestamp ascending, de-duplicated, and contain only
 * data that was publicly available at its timestamp. Implementations must not "fix up" history
 * (for example by back-filling gaps with later values); that is a leakage path.
 *
 * <p>TODO: add a {@code fetchAsOf(Instant asOf)} variant for point-in-time reconstruction once
 * sources publish revision or availability times (economic releases, polls, and some
 * market-data vendors revise history).
 */
public interface DataConnector {

    /**
     * @param from inclusive start
     * @param to   exclusive end
     * @return ticks in [from, to), sorted ascending by timestamp
     */
    List<Tick> fetch(Instant from, Instant to);
}
