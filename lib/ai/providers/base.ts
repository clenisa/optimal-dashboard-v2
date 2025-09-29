import type {
  AIModel,
  AIProviderId,
  ProviderConfig,
  ProviderInitializationContext,
  ProviderMessageOptions,
  ProviderStatus,
  ChatCompletionResult
} from '../types'

export abstract class AIProvider {
  public readonly id: AIProviderId
  public readonly name: string
  protected readonly internalConfig: ProviderConfig

  constructor(context: ProviderInitializationContext) {
    this.internalConfig = context.config
    this.id = context.config.id
    this.name = context.config.name
  }

  get enabled(): boolean {
    return this.internalConfig.enabled
  }

  get config(): ProviderConfig {
    return this.internalConfig
  }

  abstract getModels(): Promise<AIModel[]>

  abstract sendMessage(options: ProviderMessageOptions): Promise<ChatCompletionResult>

  abstract checkStatus(): Promise<ProviderStatus>
}
