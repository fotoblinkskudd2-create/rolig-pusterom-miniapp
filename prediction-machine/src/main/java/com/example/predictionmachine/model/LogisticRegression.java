package com.example.predictionmachine.model;

import com.example.predictionmachine.core.Observation;

import java.util.List;

/**
 * L2-regularised logistic regression, full-batch gradient descent, pure JDK.
 *
 * <p>Feature standardisation uses means and standard deviations from the training set only.
 * Computing them over the full dataset would leak test-period information into training.
 *
 * <p>This is a deliberately small baseline. Keep it: every fancier model must beat it on
 * held-out Brier score to justify its complexity.
 */
public final class LogisticRegression implements ProbabilisticClassifier {

    private final double learningRate;
    private final int epochs;
    private final double l2;

    private double[] mean;
    private double[] std;
    private double[] weights;
    private double bias;

    public LogisticRegression() {
        this(0.5, 500, 1e-3);
    }

    public LogisticRegression(double learningRate, int epochs, double l2) {
        this.learningRate = learningRate;
        this.epochs = epochs;
        this.l2 = l2;
    }

    @Override
    public void fit(List<Observation> train) {
        if (train.isEmpty()) {
            throw new IllegalArgumentException("empty training set");
        }
        int n = train.size();
        int d = train.get(0).features().length;

        mean = new double[d];
        std = new double[d];
        for (Observation o : train) {
            double[] x = o.features();
            for (int j = 0; j < d; j++) {
                mean[j] += x[j] / n;
            }
        }
        for (Observation o : train) {
            double[] x = o.features();
            for (int j = 0; j < d; j++) {
                std[j] += (x[j] - mean[j]) * (x[j] - mean[j]) / n;
            }
        }
        for (int j = 0; j < d; j++) {
            std[j] = Math.sqrt(std[j]) > 1e-12 ? Math.sqrt(std[j]) : 1.0;
        }

        double[][] z = new double[n][];
        boolean[] y = new boolean[n];
        for (int i = 0; i < n; i++) {
            z[i] = standardise(train.get(i).features());
            y[i] = train.get(i).outcome();
        }

        weights = new double[d];
        bias = 0.0;
        for (int e = 0; e < epochs; e++) {
            double[] gw = new double[d];
            double gb = 0.0;
            for (int i = 0; i < n; i++) {
                double err = sigmoid(dot(weights, z[i]) + bias) - (y[i] ? 1.0 : 0.0);
                for (int j = 0; j < d; j++) {
                    gw[j] += err * z[i][j];
                }
                gb += err;
            }
            for (int j = 0; j < d; j++) {
                weights[j] -= learningRate * (gw[j] / n + l2 * weights[j]);
            }
            bias -= learningRate * gb / n;
        }
    }

    @Override
    public double predictProbability(double[] features) {
        if (weights == null) {
            throw new IllegalStateException("model not fitted");
        }
        double p = sigmoid(dot(weights, standardise(features)) + bias);
        return Math.min(1.0 - 1e-9, Math.max(1e-9, p));
    }

    @Override
    public String version() {
        return "logistic-l2-v1";
    }

    private double[] standardise(double[] x) {
        double[] z = new double[x.length];
        for (int j = 0; j < x.length; j++) {
            z[j] = (x[j] - mean[j]) / std[j];
        }
        return z;
    }

    static double sigmoid(double t) {
        return 1.0 / (1.0 + Math.exp(-t));
    }

    private static double dot(double[] a, double[] b) {
        double s = 0.0;
        for (int i = 0; i < a.length; i++) {
            s += a[i] * b[i];
        }
        return s;
    }
}
