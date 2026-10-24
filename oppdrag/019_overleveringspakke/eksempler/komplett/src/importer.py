import sys


def summer(linjer):
    return round(sum(float(l.split(";")[1].replace(",", ".")) for l in linjer if l.strip()), 2)


if __name__ == "__main__":
    print(summer(open(sys.argv[1], encoding="utf-8").read().splitlines()[1:]))
