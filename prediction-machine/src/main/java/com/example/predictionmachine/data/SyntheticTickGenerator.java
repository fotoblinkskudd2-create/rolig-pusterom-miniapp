package com.example.predictionmachine.data;

import com.example.predictionmachine.core.Tick;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

/**
 * Generates a seeded, reproducible synthetic market: a slowly varying latent drift
 * (AR(1)) drives returns; the imbalance signal is a noisy view of that drift.
 *
 * <p>This is a teaching fixture, NOT a model of any real market. Real markets are
 * far less predictable and non-stationary. Do not report results from it as evidence
 * of skill.
 *
 * <p>Run as a program to regenerate the bundled CSV:
 * {@code java -cp target/classes com.example.predictionmachine.data.SyntheticTickGenerator src/main/resources/sample/ticks.csv}
 */
public final class SyntheticTickGenerator {

    private static final double PHI = 0.97;         // drift persistence
    private static final double DRIFT_INNOV = 0.002; // drift innovation std
    private static final double RET_NOISE = 0.01;   // idiosyncratic return noise
    private static final double IMB_NOISE = 0.8;    // imbalance measurement noise
    private static final double DRIFT_SD = DRIFT_INNOV / Math.sqrt(1 - PHI * PHI);

    private SyntheticTickGenerator() {
    }

    public static List<Tick> generate(int n, long seed, Instant start, Duration step) {
        Random rnd = new Random(seed);
        List<Tick> ticks = new ArrayList<>(n);
        double drift = 0.0;
        for (int i = 0; i < n; i++) {
            drift = PHI * drift + DRIFT_INNOV * rnd.nextGaussian();
            double ret = drift + RET_NOISE * rnd.nextGaussian();
            double imbalance = drift / DRIFT_SD + IMB_NOISE * rnd.nextGaussian();
            ticks.add(new Tick(start.plus(step.multipliedBy(i)), ret, imbalance));
        }
        return ticks;
    }

    public static void main(String[] args) throws IOException {
        Path out = Path.of(args.length > 0 ? args[0] : "ticks.csv");
        List<Tick> ticks = generate(3000, 42L, Instant.parse("2024-01-01T00:00:00Z"), Duration.ofHours(1));
        try (PrintWriter w = new PrintWriter(Files.newBufferedWriter(out, StandardCharsets.UTF_8))) {
            w.println("timestamp_epoch_s,return,imbalance");
            for (Tick t : ticks) {
                w.println(String.format(Locale.ROOT, "%d,%.8f,%.6f",
                        t.timestamp().getEpochSecond(), t.returnValue(), t.imbalance()));
            }
        }
        System.out.println("wrote " + ticks.size() + " ticks to " + out.toAbsolutePath());
    }
}
