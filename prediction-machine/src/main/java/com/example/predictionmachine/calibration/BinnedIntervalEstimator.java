package com.example.predictionmachine.calibration;

/**
 * Uncertainty band around a calibrated probability, from the calibration slice.
 *
 * <p>Method: split [0,1] into equal bins. For a new forecast {@code p}, find its bin, count how many
 * calibration outcomes fell there, and compute a 95% Wilson score interval for the observed
 * frequency. The band is the union of that interval and {@code p}, so it always contains {@code p}.
 *
 * <p><b>What this is:</b> sampling uncertainty about how often outcomes occur among past forecasts
 * in the same probability range. <b>What it is not:</b> a full Bayesian posterior, a guaranteed
 * coverage interval for future outcomes, or an allowance for regime change. Calibration
 * can be right on the calibration slice and wrong next month.
 *
 * <p>When a bin has fewer than {@code minCount} calibration cases, the band is the full [0, 1]
 * and {@code reliable} is false. That is deliberate: refuse to give a narrow band that
 * the data cannot support.
 *
 * <p>TODO: replace with isotonic or Beta-calibrated intervals, or with a bootstrap over
 * walk-forward folds, once you have enough history.
 */
public final class BinnedIntervalEstimator {

    /** 97.5th percentile of the standard normal, for a two-sided 95% interval. */
    private static final double Z95 = 1.959963984540054;

    /** A band for one forecast. */
    public record Band(double lower, double upper, boolean reliable) {
    }

    private final int bins;
    private final int minCount;
    private final int[] counts;
    private final int[] positives;

    private BinnedIntervalEstimator(int bins, int minCount, int[] counts, int[] positives) {
        this.bins = bins;
        this.minCount = minCount;
        this.counts = counts;
        this.positives = positives;
    }

    public static BinnedIntervalEstimator fit(double[] calibrated, boolean[] outcomes, int bins, int minCount) {
        if (calibrated.length != outcomes.length || bins < 1) {
            throw new IllegalArgumentException("bad inputs");
        }
        int[] counts = new int[bins];
        int[] positives = new int[bins];
        for (int i = 0; i < calibrated.length; i++) {
            int b = binOf(calibrated[i], bins);
            counts[b]++;
            positives[b] += outcomes[i] ? 1 : 0;
        }
        return new BinnedIntervalEstimator(bins, minCount, counts, positives);
    }

    public Band bandFor(double p) {
        int b = binOf(p, bins);
        int n = counts[b];
        if (n < minCount) {
            return new Band(0.0, 1.0, false);
        }
        double[] w = wilson(positives[b], n);
        return new Band(Math.min(p, w[0]), Math.max(p, w[1]), true);
    }

    /** 95% Wilson score interval for k successes out of n trials. */
    static double[] wilson(int k, int n) {
        double phat = (double) k / n;
        double z2 = Z95 * Z95;
        double denom = 1.0 + z2 / n;
        double center = (phat + z2 / (2.0 * n)) / denom;
        double half = Z95 * Math.sqrt(phat * (1.0 - phat) / n + z2 / (4.0 * n * n)) / denom;
        return new double[] {Math.max(0.0, center - half), Math.min(1.0, center + half)};
    }

    private static int binOf(double p, int bins) {
        return Math.min(bins - 1, Math.max(0, (int) Math.floor(p * bins)));
    }
}
