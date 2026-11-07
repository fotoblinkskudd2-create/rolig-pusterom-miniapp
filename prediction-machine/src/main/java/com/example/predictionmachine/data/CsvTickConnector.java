package com.example.predictionmachine.data;

import com.example.predictionmachine.core.Tick;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Reads ticks from a CSV with header {@code timestamp_epoch_s,return,imbalance}.
 * Used for the bundled sample data, so the demo runs with no network and no API keys.
 *
 * <p>TODO: replace or complement with real connectors (see {@code DESIGN.md}, section 3).
 */
public final class CsvTickConnector implements DataConnector {

    private final List<Tick> ticks;

    private CsvTickConnector(List<Tick> ticks) {
        this.ticks = List.copyOf(ticks);
    }

    /** Loads a CSV from the classpath, e.g. {@code "/sample/ticks.csv"}. */
    public static CsvTickConnector fromClasspath(String resourcePath) {
        try (InputStream in = CsvTickConnector.class.getResourceAsStream(resourcePath)) {
            if (in == null) {
                throw new IllegalArgumentException("resource not found: " + resourcePath);
            }
            return parse(in);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    static CsvTickConnector parse(InputStream in) throws IOException {
        List<Tick> out = new ArrayList<>();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String line = r.readLine(); // header
            while ((line = r.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                String[] f = line.split(",");
                out.add(new Tick(
                        Instant.ofEpochSecond(Long.parseLong(f[0].trim())),
                        Double.parseDouble(f[1].trim()),
                        Double.parseDouble(f[2].trim())));
            }
        }
        return new CsvTickConnector(out);
    }

    @Override
    public List<Tick> fetch(Instant from, Instant to) {
        List<Tick> window = new ArrayList<>();
        for (Tick t : ticks) {
            if (!t.timestamp().isBefore(from) && t.timestamp().isBefore(to)) {
                window.add(t);
            }
        }
        return window;
    }
}
