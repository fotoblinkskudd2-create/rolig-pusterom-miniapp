export interface PdfSide {
  tekst(x: number, y: number, t: string, o?: { str?: number; font?: "normal" | "fet" | "mono"; hoyre?: boolean }): PdfSide;
  linje(x1: number, y1: number, x2: number, y2: number, tykk?: number): PdfSide;
  rekt(x: number, y: number, b: number, h: number, tykk?: number): PdfSide;
  ops: string[];
}
export class Pdf {
  constructor(o?: { bredde?: number; hoyde?: number; tittel?: string });
  side(): PdfSide;
  bytes(): Uint8Array;
}
