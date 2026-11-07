package com.example.predictionmachine.core;

import java.time.Instant;

/**
 * One supervised example: features known at {@code asOf} and a binary outcome that
 * is resolved after {@code asOf}.
 *
 * <p>Note: records holding arrays use identity equality for the array. Compare
 * {@code features} with {@link java.util.Arrays#equals(double[], double[])} when needed.
 *
 * @param asOf     decision time; every feature must be computable from data at or before this instant
 * @param features feature vector, ordered as {@code FeatureBuilder.FEATURE_NAMES}
 * @param outcome  the resolved binary label (the event happened / the price went up next period)
 */
public record Observation(Instant asOf, double[] features, boolean outcome) {

    public Observation {
        if (features == null || features.length == 0) {
            throw new IllegalArgumentException("features must be non-empty");
        }
        features = features.clone();
    }

    /** Defensive copy on read, so callers cannot mutate the stored vector. */
    @Override
    public double[] features() {
        return features.clone();
    }
}
