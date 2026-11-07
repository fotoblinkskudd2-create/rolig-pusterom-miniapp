package com.example.predictionmachine.evaluation;

import com.example.predictionmachine.calibration.Calibrator;
import com.example.predictionmachine.core.Observation;
import com.example.predictionmachine.model.ProbabilisticClassifier;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Expanding-window walk-forward backtest with an embargo and a calibration slice.
 *
 * <p>For each fold, in chronological order:
 * <ol>
 *   <li>Training data is everything before {@code testStart - embargo}. The embargo is the label
 *       horizon: an observation at {@code t} resolves using data from {@code t+1}, so the
 *       training label nearest the test block would otherwise overlap test-period information.</li>
 *   <li>The last {@code calibrationFraction} of that window is held out for the calibrator.
 *       The model is fitted on the earlier part only.</li>
 *   <li>The model and calibrator are fitted, then used to forecast the test block in one pass.
 *       Nothing from the test block is used for any fitting, scaling or hyperparameter choice.</li>
 * </ol>
 *
 * <p>Results are pooled across folds into one out-of-sample series, which is what should be
 * scored. Fold-level numbers are for seeing stability over time.
 *
 * <p>TODO: add purged k-fold / combinatorial purged CV (Lopez de Prado, 2018) for model selection.
 * Walk-forward gives one realised path; CPCV gives a distribution of paths.
 */
public final class WalkForwardBacktester {

    /** Fold-level summary. {@code referenceBrier} is the training base-rate forecast. */
    public record Fold(
            int index,
            Instant testStart,
            Instant testEnd,
            int nTrain,
            int nTest,
            double brierRaw,
            double brierCalibrated,
            double referenceBrier,
            double logLossCalibrated) {
    }

    /** Pooled out-of-sample predictions and per-fold summaries. */
    public record Report(
            List<Fold> folds,
            double[] rawProbabilities,
            double[] calibratedProbabilities,
            boolean[] outcomes) {
    }

    private final int embargo;
    private final double calibrationFraction;

    /**
     * @param embargo             gap in observations between the training data and the test block;
     *                            use the label horizon (1 for next-period labels)
     * @param calibrationFraction share of each training window held out for calibration, e.g. 0.25
     */
    public WalkForwardBacktester(int embargo, double calibrationFraction) {
        if (embargo < 0 || calibrationFraction <= 0.0 || calibrationFraction >= 1.0) {
            throw new IllegalArgumentException("bad embargo or calibrationFraction");
        }
        this.embargo = embargo;
        this.calibrationFraction = calibrationFraction;
    }

    /**
     * @param data              observations sorted by {@code asOf} ascending
     * @param modelFactory      fresh model per fold
     * @param calibratorFactory fresh calibrator per fold
     * @param initialTrainSize  observations used before the first test block
     * @param testWindow        observations per test block
     */
    public Report run(
            List<Observation> data,
            Supplier<ProbabilisticClassifier> modelFactory,
            Supplier<Calibrator> calibratorFactory,
            int initialTrainSize,
            int testWindow) {

        List<Fold> folds = new ArrayList<>();
        List<Double> rawAll = new ArrayList<>();
        List<Double> calAll = new ArrayList<>();
        List<Boolean> yAll = new ArrayList<>();

        int n = data.size();
        int testStart = initialTrainSize;
        int fold = 0;
        while (testStart < n) {
            int testEnd = Math.min(n, testStart + testWindow);
            int trainEnd = testStart - embargo;
            int calibSize = Math.max(1, (int) Math.floor(trainEnd * calibrationFraction));
            int fitEnd = trainEnd - calibSize;

            List<Observation> fitSet = data.subList(0, fitEnd);
            List<Observation> calibSet = data.subList(fitEnd, trainEnd);
            List<Observation> testSet = data.subList(testStart, testEnd);

            ProbabilisticClassifier model = modelFactory.get();
            model.fit(fitSet);
            double[] calRaw = predictAll(model, calibSet);
            Calibrator calibrator = calibratorFactory.get();
            calibrator.fit(calRaw, outcomesOf(calibSet));

            double[] testRaw = predictAll(model, testSet);
            boolean[] testY = outcomesOf(testSet);
            double[] testCal = new double[testRaw.length];
            for (int i = 0; i < testRaw.length; i++) {
                testCal[i] = calibrator.calibrate(testRaw[i]);
            }
            double ref = Metrics.climatologyBrier(Metrics.baseRate(outcomesOf(fitSet)), testY);

            folds.add(new Fold(
                    fold++,
                    testSet.get(0).asOf(),
                    testSet.get(testSet.size() - 1).asOf(),
                    fitSet.size(),
                    testSet.size(),
                    Metrics.brier(testRaw, testY),
                    Metrics.brier(testCal, testY),
                    ref,
                    Metrics.logLoss(testCal, testY)));

            for (int i = 0; i < testY.length; i++) {
                rawAll.add(testRaw[i]);
                calAll.add(testCal[i]);
                yAll.add(testY[i]);
            }
            testStart = testEnd;
        }

        return new Report(folds, toArray(rawAll), toArray(calAll), toBoolean(yAll));
    }

    private static double[] predictAll(ProbabilisticClassifier m, List<Observation> set) {
        double[] out = new double[set.size()];
        for (int i = 0; i < out.length; i++) {
            out[i] = m.predictProbability(set.get(i).features());
        }
        return out;
    }

    private static boolean[] outcomesOf(List<Observation> set) {
        boolean[] y = new boolean[set.size()];
        for (int i = 0; i < y.length; i++) {
            y[i] = set.get(i).outcome();
        }
        return y;
    }

    private static double[] toArray(List<Double> xs) {
        return xs.stream().mapToDouble(Double::doubleValue).toArray();
    }

    private static boolean[] toBoolean(List<Boolean> xs) {
        boolean[] out = new boolean[xs.size()];
        for (int i = 0; i < out.length; i++) {
            out[i] = xs.get(i);
        }
        return out;
    }
}
