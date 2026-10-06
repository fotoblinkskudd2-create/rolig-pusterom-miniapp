import type { FastifyReply } from "fastify";

/** Server-Sent Events over et kapret Fastify-svar. Skriver aldri etter at klienten er borte. */
export class SseStream {
  private closedFlag = false;
  private heartbeat: NodeJS.Timeout;
  private closeHandlers: (() => void)[] = [];

  constructor(private readonly reply: FastifyReply) {
    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
      connection: "keep-alive",
    });
    raw.flushHeaders?.();
    const onClose = () => {
      if (this.closedFlag) return;
      this.closedFlag = true;
      clearInterval(this.heartbeat);
      for (const h of this.closeHandlers) h();
    };
    raw.on("close", onClose);
    raw.on("error", onClose);
    this.heartbeat = setInterval(() => this.comment("ping"), 15_000);
    this.heartbeat.unref();
  }

  get closed(): boolean {
    return this.closedFlag;
  }

  onClose(fn: () => void): void {
    if (this.closedFlag) fn();
    else this.closeHandlers.push(fn);
  }

  send(event: string, data: unknown): void {
    if (this.closedFlag) return;
    this.reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  comment(text: string): void {
    if (this.closedFlag) return;
    this.reply.raw.write(`: ${text}\n\n`);
  }

  end(): void {
    clearInterval(this.heartbeat);
    if (this.closedFlag) return;
    this.closeHandlers = [];
    this.closedFlag = true;
    this.reply.raw.end();
  }
}
