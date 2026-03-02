// Локальное хранилище данных для демонстрации
// В продакшене это должно быть заменено на серверную базу данных

export interface User {
  id: string;
  login: string;
  password: string; // В реальности должен быть hash
  role: 'admin' | 'agent' | 'cashier' | 'player';
  agentId?: string; // ID агента (для кассиров и игроков)
  cashierId?: string; // ID кассира (для игроков)
  balance?: number; // Для игроков
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  createdAt: string;
}

export interface Cashier {
  id: string;
  login: string;
  agentId: string;
  createdAt: string;
}

export interface Player {
  id: string;
  login: string;
  agentId: string;
  cashierId: string;
  balance: number;
  isOnline: boolean;
  friends: string[]; // IDs друзей
  createdAt: string;
}

export interface GameTable {
  id: string;
  name: string;
  agentId: string;
  maxPlayers: number;
  currentPlayers: string[]; // Player IDs
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

export interface Transaction {
  id: string;
  playerId: string;
  cashierId: string;
  agentId: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  toPlayerId?: string; // Для переводов
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tableId: string;
  playerId: string;
  playerLogin: string;
  message: string;
  createdAt: string;
}

class Storage {
  private getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User[]>('users', []);
  }

  setUsers(users: User[]): void {
    this.setItem('users', users);
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  }

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setUsers(users);
    }
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByLogin(login: string): User | undefined {
    return this.getUsers().find(u => u.login === login);
  }

  // Agents
  getAgents(): Agent[] {
    return this.getItem<Agent[]>('agents', []);
  }

  setAgents(agents: Agent[]): void {
    this.setItem('agents', agents);
  }

  addAgent(agent: Agent): void {
    const agents = this.getAgents();
    agents.push(agent);
    this.setAgents(agents);
  }

  getAgentById(id: string): Agent | undefined {
    return this.getAgents().find(a => a.id === id);
  }

  // Game Tables
  getTables(): GameTable[] {
    return this.getItem<GameTable[]>('tables', []);
  }

  setTables(tables: GameTable[]): void {
    this.setItem('tables', tables);
  }

  addTable(table: GameTable): void {
    const tables = this.getTables();
    tables.push(table);
    this.setTables(tables);
  }

  updateTable(tableId: string, updates: Partial<GameTable>): void {
    const tables = this.getTables();
    const index = tables.findIndex(t => t.id === tableId);
    if (index !== -1) {
      tables[index] = { ...tables[index], ...updates };
      this.setTables(tables);
    }
  }

  getTableById(id: string): GameTable | undefined {
    return this.getTables().find(t => t.id === id);
  }

  getTablesByAgent(agentId: string): GameTable[] {
    return this.getTables().filter(t => t.agentId === agentId);
  }

  // Transactions
  getTransactions(): Transaction[] {
    return this.getItem<Transaction[]>('transactions', []);
  }

  setTransactions(transactions: Transaction[]): void {
    this.setItem('transactions', transactions);
  }

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.setTransactions(transactions);
  }

  getTransactionsByPlayer(playerId: string): Transaction[] {
    return this.getTransactions().filter(t => t.playerId === playerId || t.toPlayerId === playerId);
  }

  getTransactionsByAgent(agentId: string): Transaction[] {
    return this.getTransactions().filter(t => t.agentId === agentId);
  }

  // Chat Messages
  getChatMessages(): ChatMessage[] {
    return this.getItem<ChatMessage[]>('chatMessages', []);
  }

  setChatMessages(messages: ChatMessage[]): void {
    this.setItem('chatMessages', messages);
  }

  addChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    messages.push(message);
    this.setChatMessages(messages);
  }

  getChatMessagesByTable(tableId: string): ChatMessage[] {
    return this.getChatMessages().filter(m => m.tableId === tableId);
  }

  // Current User Session
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  // Initialize with demo data
  initializeDemoData(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      // Создаем главного администратора
      this.addUser({
        id: 'admin-1',
        login: 'admin',
        password: 'admin123', // В реальности должен быть hash
        role: 'admin',
        createdAt: new Date().toISOString(),
      });

      // Создаем агента (клуб)
      this.addAgent({
        id: 'agent-1',
        name: 'Клуб "Туз"',
        createdAt: new Date().toISOString(),
      });

      this.addUser({
        id: 'agent-user-1',
        login: 'agent1',
        password: 'agent123',
        role: 'agent',
        agentId: 'agent-1',
        createdAt: new Date().toISOString(),
      });

      // Создаем кассира
      this.addUser({
        id: 'cashier-1',
        login: 'cashier1',
        password: 'cashier123',
        role: 'cashier',
        agentId: 'agent-1',
        createdAt: new Date().toISOString(),
      });

      // Создаем игрока
      this.addUser({
        id: 'player-1',
        login: 'player001',
        password: 'pass123',
        role: 'player',
        agentId: 'agent-1',
        cashierId: 'cashier-1',
        balance: 1000,
        createdAt: new Date().toISOString(),
      });

      // Создаем игровой стол
      this.addTable({
        id: 'table-1',
        name: 'Стол №1',
        agentId: 'agent-1',
        maxPlayers: 4,
        currentPlayers: [],
        status: 'waiting',
        createdAt: new Date().toISOString(),
      });
    }
  }
}

export const storage = new Storage();
