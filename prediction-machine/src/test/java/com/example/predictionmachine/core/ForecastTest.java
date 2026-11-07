package com.example.predictionmachine.core;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertThrows;

class ForecastTest {

    @Test
    void rejectsIntervalThatDoesNotContainPoint() {
        assertThrows(IllegalArgumentException.class,
                () -> new Forecast(Instant.EPOCH, 0.6, 0.7, 0.8, 0.95, "v", true));
    }

    @Test
    void rejectsProbabilityOutsideUnitInterval() {
        assertThrows(IllegalArgumentException.class,
                () -> new Forecast(Instant.EPOCH, 1.2, 1.0, 1.0, 0.95, "v", true));
    }
}
