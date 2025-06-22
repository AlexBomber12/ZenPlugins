import { ZenMoney } from '../../sdk';
import { RawOverview, RawMovement } from './models';
import { convertAccounts, convertTransactions } from './converters';

export async function loadAccountsAndTx(
  jar: unknown,
  fromDate?: string
): Promise<{ overview: RawOverview[]; movements: Record<string, RawMovement[]> }> {
  // … логика запроса …
  return { overview: [], movements: {} }; // заглушка
}

// ------------------------------------------------------------------
// Было:   if (!overview?.[accId]) { ... }
// Нужно:  явно проверяем пустую строку ↓

export function getAccountBalance(
  overview: Record<string, RawOverview>,
  accId: string
): number | undefined {
  if (typeof accId !== 'string' || accId === '' || !overview[accId]) {
    return undefined;
  }
  return overview[accId].accountBalance?.value;
}
