package com.example.predictionmachine;

import com.example.predictionmachine.calibration.PlattCalibrator;
import com.example.predictionmachine.core.Forecast;
import com.example.predictionmachine.core.Observation;
import com.example.predictionmachine.core.Tick;
import com.example.predictionmachine.data.CsvTickConnector;
import com.example.predictionmachine.evaluation.Metrics;
import com.example.predictionmachine.evaluation.ReliabilityDiagram;
import com.example.predictionmachine.evaluation.WalkForwardBacktester;
import com.example.predictionmachine.features.FeatureBuilder;
import com.example.predictionmachine.model.LogisticRegression;
import com.example.predictionmachine.service.ForecastService;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

/**
 * End-to-end demo: bundled ticks -> features -> chronological split -> model -> calibration
 * -> held-out Brier/log loss/reliability -> walk-forward backtest -> one forecast with a band.
 *
 * <p>Run: {@code mvn -q package && java -jar target/prediction-machine-0.1.0-SNAPSHOT.jar}
 *
 * <p>Exits with status 1 if the calibrated model does not beat the base-rate reference on the
 * held-out slice. A failed sanity check on this data is a bug signal, not a market insight.
 */
public final class App {

    private static final int BINS = 10;

    private App() {
    }

    public static void main(String[] args) {
        // 1. INGESTION. TODO: swap CsvTickConnector for a live connector; keep the same Tick contract.
        List<Tick> ticks = CsvTickConnector.fromClasspath("/sample/ticks.csv")
                .fetch(Instant.EPOCH, Instant.MAX);

        // 2. FEATURES. Point-in-time by construction (see FeatureBuilder).
        List<Observation> obs = new FeatureBuilder().build(ticks);
        System.out.printf(Locale.ROOT, "observations: %d, features: %s%n", obs.size(), FeatureBuilder.FEATURE_NAMES);

        // 3. CHRONOLOGICAL SPLIT with a 1-step embargo between blocks (label horizon = 1).
        int n = obs.size();
        int trainEnd = (int) (n * 0.6);
        int calEnd = (int) (n * 0.8);
        List<Observation> fitSet = obs.subList(0, trainEnd);
        List<Observation> calSet = obs.subList(trainEnd + 1, calEnd);
        List<Observation> testSet = obs.subList(calEnd + 1, n);
        System.out.printf(Locale.ROOT, "split: fit=%d, calib=%d, test=%d (embargo 1 between blocks)%n",
                fitSet.size(), calSet.size(), testSet.size());

        // 4. MODEL on the fit slice only.
        LogisticRegression model = new LogisticRegression();
        model.fit(fitSet);

        // 5. CALIBRATION on the calibration slice only.
        double[] calRaw = predictAll(model, calSet);
        boolean[] calY = outcomes(calSet);
        PlattCalibrator calibrator = new PlattCalibrator();
        calibrator.fit(calRaw, calY);
        System.out.printf(Locale.ROOT, "platt: slope=%.3f intercept=%.3f (slope~1, intercept~0 => already calibrated)%n",
                calibrator.slope(), calibrator.intercept());

        // 6. HELD-OUT EVALUATION on the test slice, which nothing above has touched.
        double[] testRaw = predictAll(model, testSet);
        boolean[] testY = outcomes(testSet);
        double[] testCal = new double[testRaw.length];
        for (int i = 0; i < testRaw.length; i++) {
            testCal[i] = calibrator.calibrate(testRaw[i]);
        }
        double climatology = Metrics.climatologyBrier(Metrics.baseRate(outcomes(fitSet)), testY);

        System.out.println();
        System.out.println("HELD-OUT TEST SLICE");
        System.out.printf(Locale.ROOT, "  base rate (train) : %.3f%n", Metrics.baseRate(outcomes(fitSet)));
        System.out.printf(Locale.ROOT, "  Brier raw         : %.4f%n", Metrics.brier(testRaw, testY));
        System.out.printf(Locale.ROOT, "  Brier calibrated  : %.4f%n", Metrics.brier(testCal, testY));
        System.out.printf(Locale.ROOT, "  Brier climatology : %.4f (reference)%n", climatology);
        System.out.printf(Locale.ROOT, "  Brier skill (cal) : %+.4f%n",
                Metrics.brierSkillScore(Metrics.brier(testCal, testY), climatology));
        System.out.printf(Locale.ROOT, "  log loss raw/cal  : %.4f / %.4f%n",
                Metrics.logLoss(testRaw, testY), Metrics.logLoss(testCal, testY));
        System.out.printf(Locale.ROOT, "  ECE (%d bins)      : raw %.4f / cal %.4f%n", BINS,
                Metrics.expectedCalibrationError(testRaw, testY, BINS),
                Metrics.expectedCalibrationError(testCal, testY, BINS));
        printReliability(testCal, testY);

        // 7. WALK-FORWARD BACKTEST over the whole series (fresh model + calibrator per fold).
        WalkForwardBacktester backtester = new WalkForwardBacktester(1, 0.25);
        WalkForwardBacktester.Report report = backtester.run(
                obs, LogisticRegression::new, PlattCalibrator::new, 1500, 250);
        System.out.println();
        System.out.println("WALK-FORWARD (expanding window, 250-step test blocks)");
        System.out.println("  fold  nTrain  nTest  Brier(cal)  Brier(ref)  logLoss(cal)");
        for (WalkForwardBacktester.Fold f : report.folds()) {
            System.out.printf(Locale.ROOT, "  %4d  %6d  %5d  %10.4f  %10.4f  %12.4f%n",
                    f.index(), f.nTrain(), f.nTest(), f.brierCalibrated(), f.referenceBrier(), f.logLossCalibrated());
        }
        double pooledCal = Metrics.brier(report.calibratedProbabilities(), report.outcomes());
        double pooledRef = Metrics.climatologyBrier(Metrics.baseRate(report.outcomes()), report.outcomes());
        System.out.printf(Locale.ROOT, "  pooled out-of-sample: Brier(cal)=%.4f, Brier(ref)=%.4f, skill=%+.4f%n",
                pooledCal, pooledRef, Metrics.brierSkillScore(pooledCal, pooledRef));

        // 8. SERVING. Train the packaged pipeline and forecast the most recent decision point.
        ForecastService service = ForecastService.train(fitSet, calSet, BINS);
        Observation latest = obs.get(obs.size() - 1);
        Forecast f = service.predict(latest.asOf(), latest.features());
        System.out.println();
        System.out.println("FORECAST (estimate, not a guarantee)");
        System.out.printf(Locale.ROOT, "  asOf=%s  p=%.3f  %d%% band=[%.3f, %.3f]  reliable=%s  model=%s%n",
                f.asOf(), f.probability(), Math.round(f.confidenceLevel() * 100), f.lower(), f.upper(),
                f.intervalReliable(), f.modelVersion());

        // 9. SANITY CHECK.
        boolean pass = pooledCal < pooledRef;
        System.out.println();
        System.out.println(pass ? "SANITY CHECK: PASS (calibrated model beats base-rate reference)"
                               : "SANITY CHECK: FAIL (no skill over base rate)");
        if (!pass) {
            System.exit(1);
        }
    }

    private static double[] predictAll(LogisticRegression model, List<Observation> set) {
        double[] out = new double[set.size()];
        for (int i = 0; i < out.length; i++) {
            out[i] = model.predictProbability(set.get(i).features());
        }
        return out;
    }

    private static boolean[] outcomes(List<Observation> set) {
        boolean[] y = new boolean[set.size()];
        for (int i = 0; i < y.length; i++) {
            y[i] = set.get(i).outcome();
        }
        return y;
    }

    private static void printReliability(double[] p, boolean[] y) {
        System.out.println("  reliability (calibrated, test):");
        System.out.println("    bin          n   mean_pred  observed");
        for (ReliabilityDiagram.Bin b : ReliabilityDiagram.of(p, y, BINS)) {
            if (b.count() == 0) {
                continue;
            }
            System.out.printf(Locale.ROOT, "    [%.1f,%.1f) %4d   %.3f      %.3f%n",
                    b.lower(), b.upper(), b.count(), b.meanPredicted(), b.observedRate());
        }
    }
}
