package com.example.predictionmachine.evaluation;

/**
 * Proper scoring rules and calibration error for binary probability forecasts.
 *
 * <ul>
 *   <li><b>Brier score</b>: mean (p - y)^2. Lower is better. 0 is perfect; a constant forecast
 *       at the base rate b scores b(1-b).</li>
 *   <li><b>Log loss</b>: mean -[y log p + (1-y) log(1-p)]. Lower is better. Punishes confident
 *       misses hard, so it exposes overconfidence that Brier hides.</li>
 *   <li><b>Brier skill score</b>: 1 - Brier / Brier_reference. Above 0 means better than the
 *       reference (usually the base rate). Use it to answer "does this model know anything?"</li>
 *   <li><b>Expected calibration error (ECE)</b>: bin-weighted mean |confidence - observed rate|.
 *       A summary of the reliability diagram. It depends on bin count, so report that too.</li>
 * </ul>
 *
 * <p>Both Brier and log loss are <i>strictly proper</i>: in expectation, the score is optimised
 * only by reporting the true probability. That is why they are used for forecast evaluation,
 * whereas accuracy is not.
 */
public final class Metrics {

    private static final double EPS = 1e-12;

    private Metrics() {
    }

    public static double brier(double[] p, boolean[] y) {
        requireSameLength(p, y);
        double s = 0.0;
        for (int i = 0; i < p.length; i++) {
            double d = p[i] - (y[i] ? 1.0 : 0.0);
            s += d * d;
        }
        return s / p.length;
    }

    public static double logLoss(double[] p, boolean[] y) {
        requireSameLength(p, y);
        double s = 0.0;
        for (int i = 0; i < p.length; i++) {
            double c = Math.min(1.0 - EPS, Math.max(EPS, p[i]));
            s -= y[i] ? Math.log(c) : Math.log(1.0 - c);
        }
        return s / p.length;
    }

    /** Brier score of always predicting {@code baseRate}, on the given outcomes. */
    public static double climatologyBrier(double baseRate, boolean[] y) {
        double s = 0.0;
        for (boolean o : y) {
            double d = baseRate - (o ? 1.0 : 0.0);
            s += d * d;
        }
        return s / y.length;
    }

    public static double brierSkillScore(double brier, double referenceBrier) {
        return referenceBrier == 0.0 ? 0.0 : 1.0 - brier / referenceBrier;
    }

    public static double expectedCalibrationError(double[] p, boolean[] y, int bins) {
        int n = p.length;
        double ece = 0.0;
        for (ReliabilityDiagram.Bin b : ReliabilityDiagram.of(p, y, bins)) {
            if (b.count() > 0) {
                ece += (double) b.count() / n * Math.abs(b.meanPredicted() - b.observedRate());
            }
        }
        return ece;
    }

    public static double baseRate(boolean[] y) {
        int k = 0;
        for (boolean o : y) {
            if (o) {
                k++;
            }
        }
        return (double) k / y.length;
    }

    private static void requireSameLength(double[] p, boolean[] y) {
        if (p.length != y.length || p.length == 0) {
            throw new IllegalArgumentException("need equal-length, non-empty arrays");
        }
    }
}
