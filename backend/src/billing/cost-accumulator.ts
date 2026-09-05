/**
 * Копит costUsd со всех LLM-вызовов одного хода чата (основной ReAct-цикл +
 * под-вызов сборки капсулы), чтобы списать один раз за весь ход, а не за
 * каждый внутренний вызов модели.
 */
export class CostAccumulator {
  private totalUsd = 0;

  add(usd: number): void {
    this.totalUsd += usd;
  }

  get total(): number {
    return this.totalUsd;
  }
}
