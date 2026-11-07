package com.example.predictionmachine.evaluation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MetricsTest {

    private static final boolean[] Y = {true, false, true, false};

    @Test
    void perfectForecastHasZeroBrierAndNearZeroLogLoss() {
        double[] p = {1.0, 0.0, 1.0, 0.0};
        assertEquals(0.0, Metrics.brier(p, Y), 1e-12);
        assertEquals(0.0, Metrics.logLoss(p, Y), 1e-9);
    }

    @Test
    void constantHalfForecastScoresQuarter() {
        double[] p = {0.5, 0.5, 0.5, 0.5};
        assertEquals(0.25, Metrics.brier(p, Y), 1e-12);
        assertEquals(Math.log(2), Metrics.logLoss(p, Y), 1e-12);
    }

    @Test
    void climatologyBrierIsBaseRateTimesComplement() {
        double base = Metrics.baseRate(Y); // 0.5
        assertEquals(base * (1 - base), Metrics.climatologyBrier(base, Y), 1e-12);
    }

    @Test
    void skillScoreIsZeroAgainstItself() {
        assertEquals(0.0, Metrics.brierSkillScore(0.2, 0.2), 1e-12);
    }
}
