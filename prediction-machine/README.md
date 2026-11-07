# prediction-machine

Starter for a calibrated probabilistic forecasting system in Java 17. Zero runtime dependencies.

```bash
mvn -B verify                                             # compile + 11 unit tests
java -jar target/prediction-machine-0.1.0-SNAPSHOT.jar    # end-to-end demo on bundled synthetic data
```

- Design, tool choices, data sources, legal cautions, evaluation method: **[DESIGN.md](DESIGN.md)**
- The bundled data (`src/main/resources/sample/ticks.csv`) is synthetic. Results from it show that the
  pipeline works, not that any market is predictable. Regenerate with `SyntheticTickGenerator`.

Not financial advice. Not a trading system. Probabilities are estimates with uncertainty bands, not guarantees.
