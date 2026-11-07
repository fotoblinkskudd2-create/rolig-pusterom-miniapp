package com.example.predictionmachine.calibration;

/**
 * Platt scaling: {@code p_cal = sigmoid(a * logit(p_raw) + b)}, with (a, b) fitted by minimising
 * log loss on the calibration slice.
 *
 * <p>Two parameters, so it is stable on a few hundred samples. It assumes the miscalibration
 * is sigmoid-shaped; an isotonic calibrator (monotone, non-parametric) is better with
 * several thousand samples and is a TODO here.
 */
public final class PlattCalibrator implements Calibrator {

    private static final double EPS = 1e-6;

    private double a = 1.0;
    private double b = 0.0;

    @Override
    public void fit(double[] raw, boolean[] outcomes) {
        if (raw.length != outcomes.length || raw.length == 0) {
            throw new IllegalArgumentException("need equal-length, non-empty arrays");
        }
        int n = raw.length;
        double[] x = new double[n];
        for (int i = 0; i < n; i++) {
            x[i] = logit(raw[i]);
        }
        a = 1.0;
        b = 0.0;
        double lr = 0.05;
        for (int iter = 0; iter < 5000; iter++) {
            double ga = 0.0;
            double gb = 0.0;
            for (int i = 0; i < n; i++) {
                double p = sigmoid(a * x[i] + b);
                double err = p - (outcomes[i] ? 1.0 : 0.0);
                ga += err * x[i];
                gb += err;
            }
            a -= lr * ga / n;
            b -= lr * gb / n;
        }
    }

    @Override
    public double calibrate(double raw) {
        return sigmoid(a * logit(raw) + b);
    }

    /** Fitted slope; close to 1 means the raw model was already well calibrated. */
    public double slope() {
        return a;
    }

    /** Fitted intercept; close to 0 means no systematic bias. */
    public double intercept() {
        return b;
    }

    static double logit(double p) {
        double c = Math.min(1.0 - EPS, Math.max(EPS, p));
        return Math.log(c / (1.0 - c));
    }

    static double sigmoid(double t) {
        return 1.0 / (1.0 + Math.exp(-t));
    }
}
