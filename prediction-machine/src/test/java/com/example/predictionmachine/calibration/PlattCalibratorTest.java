package com.example.predictionmachine.calibration;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlattCalibratorTest {

    @Test
    void outputStaysInUnitIntervalAndIsMonotone() {
        Random rnd = new Random(1);
        int n = 500;
        double[] raw = new double[n];
        boolean[] y = new boolean[n];
        for (int i = 0; i < n; i++) {
            raw[i] = rnd.nextDouble();
            y[i] = rnd.nextDouble() < raw[i] * 0.5 + 0.25; // deliberately miscalibrated
        }
        PlattCalibrator c = new PlattCalibrator();
        c.fit(raw, y);
        double prev = -1;
        for (double p = 0.0; p <= 1.0; p += 0.05) {
            double q = c.calibrate(p);
            assertTrue(q >= 0.0 && q <= 1.0, "out of range: " + q);
            assertTrue(q >= prev, "not monotone at " + p);
            prev = q;
        }
    }

    @Test
    void identityDataGivesSlopeNearOne() {
        Random rnd = new Random(2);
        int n = 4000;
        double[] raw = new double[n];
        boolean[] y = new boolean[n];
        for (int i = 0; i < n; i++) {
            raw[i] = 0.05 + 0.9 * rnd.nextDouble();
            y[i] = rnd.nextDouble() < raw[i];
        }
        PlattCalibrator c = new PlattCalibrator();
        c.fit(raw, y);
        assertEquals(1.0, c.slope(), 0.25);
        assertEquals(0.0, c.intercept(), 0.25);
    }
}
