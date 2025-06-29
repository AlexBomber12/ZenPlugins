/* src/sdk.ts
 * минимальный shim для локального webpack-preview.
 * В «боевом» приложении эти функции заменяются реальным объектом ZenMoney.
 */
import { randomUUID } from 'crypto'

export const ZenMoney = {
  // генератор UUID (заглушка – подходит для превью)
  uuid: () => randomUUID(),

  // заглушка «повтори запрос» (для превью просто выполняем функцию)
  repeat: async <T>(fn: () => Promise<T>): Promise<T> => await fn(),

  // HTTP-запросы SDK нам не нужны в превью – если дойдёт до сюда, значит забыли мок
  request: async () => {
    throw new Error('ZenMoney.request() called in webpack preview')
  },

  // Лог выводим в консоль браузера
  log: (...args: unknown[]) => console.log('[ZenMoney]', ...args)
}
export type ZenMoneySDK = typeof ZenMoney
