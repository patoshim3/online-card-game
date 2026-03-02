// Генерация уникального логина для игрока
export function generatePlayerLogin(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `player${timestamp}${random}`;
}

// Генерация случайного пароля
export function generatePassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Генерация уникального ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Форматирование даты
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU');
}

// Форматирование суммы
export function formatAmount(amount: number): string {
  return amount.toLocaleString('ru-RU');
}
