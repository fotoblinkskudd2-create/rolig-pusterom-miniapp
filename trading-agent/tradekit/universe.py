"""Ferdige lister. Skriv `tradekit ideas tech` eller egen kommaseparert liste."""

UNIVERSES = {
    "us-mega": ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AVGO", "BRK-B", "JPM"],
    "tech": ["AAPL", "MSFT", "NVDA", "AMD", "AVGO", "ORCL", "CRM", "ADBE", "INTC", "QCOM", "MU", "PLTR"],
    "semis": ["NVDA", "AMD", "AVGO", "QCOM", "MU", "INTC", "TSM", "ASML", "AMAT", "LRCX", "KLAC", "MRVL"],
    "energy": ["XOM", "CVX", "COP", "SLB", "EOG", "OXY", "EQNR.OL", "AKRBP.OL", "VAR.OL", "SHEL", "BP"],
    "banks": ["JPM", "BAC", "WFC", "C", "GS", "MS", "DNB.OL", "SB1NO.OL"],
    "health": ["LLY", "UNH", "JNJ", "ABBV", "MRK", "PFE", "NVO", "TMO", "ISRG", "AMGN"],
    "oslo": ["EQNR.OL", "DNB.OL", "NHY.OL", "TEL.OL", "MOWI.OL", "YAR.OL", "AKRBP.OL", "ORK.OL",
             "KOG.OL", "SALM.OL", "FRO.OL", "NAS.OL", "VAR.OL", "SUBC.OL", "TOM.OL"],
    "sectors": ["XLK", "XLF", "XLE", "XLV", "XLY", "XLP", "XLI", "XLB", "XLU", "XLRE", "XLC"],
    "indices": ["^GSPC", "^NDX", "^DJI", "^RUT", "^STOXX50E", "^GDAXI", "^FTSE", "^N225", "OSEBX.OL"],
    "crypto": ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "BNB-USD", "ADA-USD", "DOGE-USD"],
    "fx": ["EURUSD=X", "USDJPY=X", "GBPUSD=X", "EURNOK=X", "USDNOK=X", "AUDUSD=X"],
    "commodities": ["GC=F", "SI=F", "CL=F", "BZ=F", "NG=F", "HG=F"],
}


def resolve(spec: str) -> list[str]:
    key = spec.strip().lower()
    if key in UNIVERSES:
        return UNIVERSES[key]
    return [s.strip().upper() for s in spec.split(",") if s.strip()]
