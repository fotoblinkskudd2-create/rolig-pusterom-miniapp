"""rett-galt: judge a statement as RETT (right) or GALT (wrong)."""

import re
import sys

# Each rule: (keyword groups, verdict, reason). A group matches if any of its
# alternatives is a prefix of a word in the statement; all groups must match.
RULES = [
    ((("sky", "himmel"), ("blue", "blå")), True,
     "The daytime sky appears blue (Rayleigh scattering)."),
    ((("water", "vann"), ("boil", "koke"), ("100",)), True,
     "Water boils at 100 °C at sea-level pressure."),
    ((("earth", "jord"), ("round", "rund", "sphere", "kule")), True,
     "The Earth is (approximately) a sphere."),
    ((("earth", "jord"), ("flat",)), False,
     "The Earth is not flat."),
    ((("sun", "sol"), ("cold", "kald")), False,
     "The Sun is extremely hot, not cold."),
    ((("stealing", "steal", "stjele"), ("wrong", "galt", "feil")), True,
     "Stealing is widely held to be morally wrong."),
    ((("lying", "lie", "lyve", "lyge"), ("wrong", "galt", "feil")), True,
     "Lying is widely held to be morally wrong."),
    ((("helping", "help", "hjelpe"), ("good", "godt", "bra", "right", "rett")),
     True, "Helping others is widely held to be morally good."),
]

NEGATIONS = {"not", "isn't", "isnt", "never", "ikke", "aldri"}
WORD_PATTERN = re.compile(r"[a-zæøå0-9']+")


def tokenize(text):
    return WORD_PATTERN.findall(text.lower())


def matches(groups, words):
    return all(
        any(word.startswith(alt) for word in words for alt in group)
        for group in groups
    )


def judge(statement):
    """Return (verdict, reason): True for RETT, False for GALT."""
    if not isinstance(statement, str):
        return False, f"Input is not text ({type(statement).__name__})."
    if not statement.strip():
        return False, "Input is empty."
    if not re.search(r"[^\W\d_]", statement):
        return False, "Input is malformed: it contains no words."

    words = tokenize(statement)
    negated = any(word in NEGATIONS for word in words)
    for groups, verdict, reason in RULES:
        if matches(groups, words):
            if negated:
                return not verdict, f"Negated claim. {reason}"
            return verdict, reason
    return False, "Cannot be verified: no rule covers this statement."


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    statement = " ".join(argv) if argv else sys.stdin.read()
    verdict, reason = judge(statement)
    print(f"{'RETT' if verdict else 'GALT'}: {reason}")
    return 0 if verdict else 1


if __name__ == "__main__":
    sys.exit(main())
