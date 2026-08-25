import type { IPublishStrategy } from '../../core/interfaces/IPublishStrategy';
import { PublerPublishStrategy } from './PublerPublishStrategy';
import { XIntentPublishStrategy } from './XIntentPublishStrategy';

export class PublishStrategyFactory {
  private static strategies: Map<string, IPublishStrategy> = new Map<string, IPublishStrategy>([
    ['publer', new PublerPublishStrategy()],
    ['x-intent', new XIntentPublishStrategy()],
  ]);

  static getStrategy(platformId: string): IPublishStrategy {
    const strategy = this.strategies.get(platformId);
    if (!strategy) {
      throw new Error(`Estrategia de publicación no encontrada para la plataforma: ${platformId}`);
    }
    return strategy;
  }

  static getAvailableStrategies(): IPublishStrategy[] {
    return Array.from(this.strategies.values());
  }
}
