import { env } from "@ai-stack/core";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { trace } from "@opentelemetry/api";

let initialized = false;

export const initTracing = () => {
  if (initialized || !env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return;
  }
  const provider = new NodeTracerProvider();
  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
      })
    )
  );
  provider.register();
  initialized = true;
};

export const tracer = () => trace.getTracer("ai-orchestrator");
