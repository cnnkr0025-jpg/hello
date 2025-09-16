import type { ProviderAdapter } from "../types";

export abstract class BaseAdapter implements ProviderAdapter {
  abstract name: ProviderAdapter["name"];
  abstract taskType: ProviderAdapter["taskType"];

  abstract createJob: ProviderAdapter["createJob"];
  abstract getJob: ProviderAdapter["getJob"];
  cancelJob?: ProviderAdapter["cancelJob"];
}
