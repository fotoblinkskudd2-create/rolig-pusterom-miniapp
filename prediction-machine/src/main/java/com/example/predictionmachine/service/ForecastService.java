package com.example.predictionmachine.service;

import com.example.predictionmachine.calibration.BinnedIntervalEstimator;
import com.example.predictionmachine.calibration.Calibrator;
import com.example.predictionmachine.calibration.PlattCalibrator;
import com.example.predictionmachine.core.Forecast;
import com.example.predictionmachine.core.Observation;
import com.example.predictionmachine.model.LogisticRegression;
import com.example.predictionmachine.model.ProbabilisticClassifier;

import java.time.Instant;
import java.util.List;

/**
 * The serving-side pipeline: raw model -> calibrator -> uncertainty band -> {@link Forecast}.
 *
 * <p>Built once from a fit set and a calibration set, then used read-only. Retrain on a schedule
 * and version-stamp each model. Never edit a deployed instance in place.
 *
 * <p>TODO: wrap in an HTTP endpoint (see {@code DESIGN.md}, section 2, "model serving") and add
 * persistence: serialise the fitted parameters, not Java objects, so models survive JDK upgrades.
 */
public final class ForecastService {

    /** Nominal level of the band returned by {@link #predict}. */
    public static final double CONFIDENCE = 0.95;

    private final ProbabilisticClassifier model;
    private final Calibrator calibrator;
    private final BinnedIntervalEstimator bands;

    public ForecastService(ProbabilisticClassifier model, Calibrator calibrator, BinnedIntervalEstimator bands) {
        this.model = model;
        this.calibrator = calibrator;
        this.bands = bands;
    }

    /**
     * Trains the default pipeline: logistic regression, Platt calibration, binned Wilson bands.
     *
     * @param fitSet   training observations, strictly before {@code calibSet}
     * @param calibSet calibration observations, strictly before any data you will forecast
     * @param bins     number of probability bins for the uncertainty band (10 is a sane default)
     */
    public static ForecastService train(List<Observation> fitSet, List<Observation> calibSet, int bins) {
        LogisticRegression model = new LogisticRegression();
        model.fit(fitSet);

        double[] raw = new double[calibSet.size()];
        boolean[] y = new boolean[calibSet.size()];
        for (int i = 0; i < raw.length; i++) {
            raw[i] = model.predictProbability(calibSet.get(i).features());
            y[i] = calibSet.get(i).outcome();
        }
        PlattCalibrator calibrator = new PlattCalibrator();
        calibrator.fit(raw, y);

        double[] calibrated = new double[raw.length];
        for (int i = 0; i < raw.length; i++) {
            calibrated[i] = calibrator.calibrate(raw[i]);
        }
        BinnedIntervalEstimator bands = BinnedIntervalEstimator.fit(calibrated, y, bins, 20);
        return new ForecastService(model, calibrator, bands);
    }

    public Forecast predict(Instant asOf, double[] features) {
        double raw = model.predictProbability(features);
        double p = Math.min(1.0, Math.max(0.0, calibrator.calibrate(raw)));
        BinnedIntervalEstimator.Band band = bands.bandFor(p);
        return new Forecast(
                asOf,
                p,
                band.lower(),
                band.upper(),
                CONFIDENCE,
                model.version() + "+platt",
                band.reliable());
    }
}
