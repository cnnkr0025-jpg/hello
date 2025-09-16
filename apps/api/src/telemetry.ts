import { env } from "@ai/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const exporter = env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? new OTLPTraceExporter({ url: env.OTEL_EXPORTER_OTLP_ENDPOINT })
  : new ConsoleSpanExporter();

export const sdk = new NodeSDK({
  traceExporter: exporter,
});

export async function startTelemetry() {
  await sdk.start();
}

export async function shutdownTelemetry() {
  await sdk.shutdown();
}
