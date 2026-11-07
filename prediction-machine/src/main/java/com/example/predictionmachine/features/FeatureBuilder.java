package com.example.predictionmachine.features;

import com.example.predictionmachine.core.Observation;
import com.example.predictionmachine.core.Tick;

import java.util.ArrayList;
import java.util.List;

/**
 * Turns a raw tick series into supervised {@link Observation}s.
 *
 * <p><b>Leakage rule:</b> the feature vector at index {@code i} reads ticks {@code 0..i} only.
 * The label reads tick {@code i+1}. {@code FeatureBuilderTest} enforces this by changing
 * future ticks and asserting that past features do not move.
 *
 * <p>TODO: add domain features here. Ideas, each needing a point-in-time check:
 * order-book imbalance at several depths, trade-flow toxicity, time-to-resolution for
 * event contracts, poll averages (weighted by sample size and recency), news/sentiment counts
 * from an LLM extractor, commodity inventory surprises relative to consensus.
 */
public final class FeatureBuilder {

    /** Ordered feature names, matching the vector layout produced by {@link #build}. */
    public static final List<String> FEATURE_NAMES = List.of("last_return", "momentum_5", "imbalance");

    /** Number of ticks needed before the first full observation. */
    public static final int WARMUP = 5;

    public List<Observation> build(List<Tick> ticks) {
        List<Observation> out = new ArrayList<>();
        for (int i = WARMUP - 1; i + 1 < ticks.size(); i++) {
            Tick now = ticks.get(i);
            double momentum = 0.0;
            for (int k = i - WARMUP + 1; k <= i; k++) {
                momentum += ticks.get(k).returnValue();
            }
            momentum /= WARMUP;

            double[] x = {now.returnValue(), momentum, now.imbalance()};
            boolean outcome = ticks.get(i + 1).returnValue() > 0.0; // future: label only
            out.add(new Observation(now.timestamp(), x, outcome));
        }
        return out;
    }
}
