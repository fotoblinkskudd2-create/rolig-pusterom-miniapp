package com.example.predictionmachine.model;

import com.example.predictionmachine.core.Observation;

import java.util.List;

/**
 * Any model that maps features to P(outcome = true).
 *
 * <p>Models are stateful: {@link #fit} replaces any earlier fit. Use a fresh instance per
 * walk-forward fold, so no state leaks between folds.
 *
 * <p>TODO: implement adapters for Tribuo, XGBoost4J, or an ONNX Runtime-backed model
 * (see {@code DESIGN.md}, section 2).
 */
public interface ProbabilisticClassifier {

    /** Fits on training observations only. Must not look at any other data. */
    void fit(List<Observation> train);

    /** @return P(outcome = true) for the feature vector, in [0, 1]. */
    double predictProbability(double[] features);

    /** @return identifier stored with every forecast for audit. */
    String version();
}
