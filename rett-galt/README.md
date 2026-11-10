# rett-galt

Judges a statement as `RETT` (right) or `GALT` (wrong). Python 3, standard library only.

    python3 main.py "Is the sky blue?"      # RETT: ...  (exit 0)
    echo "The earth is flat" | python3 main.py   # GALT: ...  (exit 1)
    python3 tests.py                        # run the test suite

**Judging rule.** `main.py` has a small table (`RULES`) of facts and moral claims.
Each claim is a set of keyword groups in English or Norwegian, plus a verdict.
The statement is lowercased and split into words. A claim matches when each group
has a keyword that starts one of those words, so `boil` also matches `boils`.

- Matched claim → the claim's verdict. A negation word (`not`, `isn't`, `never`, `ikke`, `aldri`) flips it.
- No claim matches → `GALT`: the program never guesses, so "cannot be verified" counts as wrong.
- Empty input, input with no letters (`12345`) or input that isn't text → `GALT` with an explanation.

The claims covered: the sky is blue, water boils at 100 °C, the Earth is round,
the Earth is flat (false), the Sun is cold (false), and stealing, lying and helping others.
If several claims match, the first one in `RULES` wins.
