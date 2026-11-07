package com.example.predictionmachine.core;

import java.time.Instant;

/**
 * A calibrated probability with an uncertainty band. This is an estimate, never a guarantee.
 *
 * <p>Invariant: {@code lower <= probability <= upper}, all within [0, 1].
 *
 * @param asOf               decision time the forecast was made at
 * @param probability        calibrated probability that the outcome is {@code true}
 * @param lower              lower bound of the uncertainty band
 * @param upper              upper bound of the uncertainty band
 * @param confidenceLevel    nominal level of the band, e.g. 0.95
 * @param modelVersion       identifier of model + calibrator, for audit
 * @param intervalReliable   false when the band had too little calibration data and is a fallback
 */
public record Forecast(
        Instant asOf,
        double probability,
        double lower,
        double upper,
        double confidenceLevel,
        String modelVersion,
        boolean intervalReliable) {

    public Forecast {
        if (!(probability >= 0.0 && probability <= 1.0)) {
            throw new IllegalArgumentException("probability out of [0,1]: " + probability);
        }
        if (!(lower >= 0.0 && lower <= probability && probability <= upper && upper <= 1.0)) {
            throw new IllegalArgumentException(
                    "interval must satisfy 0 <= lower <= p <= upper <= 1: " + lower + ", " + upper);
        }
    }
}
