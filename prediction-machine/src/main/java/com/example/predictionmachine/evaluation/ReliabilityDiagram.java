package com.example.predictionmachine.evaluation;

import java.util.ArrayList;
import java.util.List;

/**
 * Reliability diagram data: for each probability bin, compare the mean forecast with the
 * observed frequency of {@code true}.
 *
 * <p>A calibrated model lies on the diagonal. Points below it mean the model is overconfident
 * (it said 80%, and it happened 60% of the time). Points above mean underconfidence.
 *
 * <p>Each bin is a sample: with a small count, its observed rate is noisy. Show the count
 * alongside the point, or draw error bars (see {@code BinnedIntervalEstimator}).
 */
public final class ReliabilityDiagram {

    /**
     * @param lower         lower edge of the bin (inclusive)
     * @param upper         upper edge (exclusive, except the last bin)
     * @param count         forecasts in the bin
     * @param meanPredicted mean forecast in the bin; {@code NaN} if empty
     * @param observedRate  observed frequency of {@code true}; {@code NaN} if empty
     */
    public record Bin(double lower, double upper, int count, double meanPredicted, double observedRate) {
    }

    private ReliabilityDiagram() {
    }

    public static List<Bin> of(double[] p, boolean[] y, int bins) {
        if (p.length != y.length) {
            throw new IllegalArgumentException("length mismatch");
        }
        double[] sumP = new double[bins];
        int[] sumY = new int[bins];
        int[] cnt = new int[bins];
        for (int i = 0; i < p.length; i++) {
            int b = Math.min(bins - 1, (int) Math.floor(p[i] * bins));
            sumP[b] += p[i];
            sumY[b] += y[i] ? 1 : 0;
            cnt[b]++;
        }
        List<Bin> out = new ArrayList<>(bins);
        for (int b = 0; b < bins; b++) {
            double lo = (double) b / bins;
            double hi = (double) (b + 1) / bins;
            if (cnt[b] == 0) {
                out.add(new Bin(lo, hi, 0, Double.NaN, Double.NaN));
            } else {
                out.add(new Bin(lo, hi, cnt[b], sumP[b] / cnt[b], (double) sumY[b] / cnt[b]));
            }
        }
        return out;
    }
}
