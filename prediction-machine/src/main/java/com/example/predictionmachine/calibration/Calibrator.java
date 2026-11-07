package com.example.predictionmachine.calibration;

/**
 * Maps raw model probabilities to calibrated ones, so that "70%" means roughly 70% of the time.
 *
 * <p>Fit on a <b>calibration slice</b> that is disjoint from the model's training data and
 * precedes the test data. Fitting on training data makes calibration look better than it is.
 */
public interface Calibrator {

    /**
     * @param raw      raw model probabilities on the calibration slice
     * @param outcomes resolved outcomes, same length
     */
    void fit(double[] raw, boolean[] outcomes);

    /** @return calibrated probability in [0, 1]. */
    double calibrate(double raw);
}
