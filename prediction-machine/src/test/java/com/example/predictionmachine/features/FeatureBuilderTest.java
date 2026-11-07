package com.example.predictionmachine.features;

import com.example.predictionmachine.core.Observation;
import com.example.predictionmachine.core.Tick;
import com.example.predictionmachine.data.SyntheticTickGenerator;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class FeatureBuilderTest {

    /**
     * Leakage guard: features at time t must not change when ticks after t are altered.
     * If someone accidentally reads ticks.get(i + 1) into a feature, this fails.
     */
    @Test
    void featuresDoNotDependOnFutureTicks() {
        List<Tick> original = SyntheticTickGenerator.generate(120, 7L, Instant.EPOCH, Duration.ofHours(1));
        int cut = 60;

        List<Tick> tampered = new ArrayList<>(original);
        for (int i = cut + 1; i < tampered.size(); i++) {
            Tick t = tampered.get(i);
            tampered.set(i, new Tick(t.timestamp(), 999.0, -999.0));
        }

        List<Observation> a = new FeatureBuilder().build(original);
        List<Observation> b = new FeatureBuilder().build(tampered);
        int compared = 0;
        for (int i = 0; i < a.size(); i++) {
            if (!a.get(i).asOf().isAfter(original.get(cut).timestamp())) {
                assertArrayEquals(a.get(i).features(), b.get(i).features(), "feature leak at obs " + i);
                compared++;
            }
        }
        assertEquals(cut - FeatureBuilder.WARMUP + 2, compared);
    }

    @Test
    void labelIsNextPeriodReturnSign() {
        List<Tick> ticks = List.of(
                new Tick(Instant.EPOCH.plusSeconds(0), 0.1, 0),
                new Tick(Instant.EPOCH.plusSeconds(1), 0.1, 0),
                new Tick(Instant.EPOCH.plusSeconds(2), 0.1, 0),
                new Tick(Instant.EPOCH.plusSeconds(3), 0.1, 0),
                new Tick(Instant.EPOCH.plusSeconds(4), 0.1, 0),
                new Tick(Instant.EPOCH.plusSeconds(5), -0.2, 0));
        List<Observation> obs = new FeatureBuilder().build(ticks);
        assertEquals(1, obs.size());
        assertEquals(false, obs.get(0).outcome()); // next return is -0.2
    }
}
