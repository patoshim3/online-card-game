import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../../lib/storage';
import { generateId } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { LogOut, Users, Wallet, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatAmount, generatePassword } from '../../lib/utils';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [agent, setAgent] = useState(currentUser?.agentId ? storage.getAgentById(currentUser.agentId) : null);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isCreateCashierOpen, setIsCreateCashierOpen] = useState(false);
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [newCashierLogin, setNewCashierLogin] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableMaxPlayers, setNewTableMaxPlayers] = useState('4');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agent' || !currentUser.agentId) {
      navigate('/');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    if (!currentUser?.agentId) return;

    const allUsers = storage.getUsers();
    const agentCashiers = allUsers.filter(u => u.role === 'cashier' && u.agentId === currentUser.agentId);
    const agentPlayers = allUsers.filter(u => u.role === 'player' && u.agentId === currentUser.agentId);
    const agentTables = storage.getTablesByAgent(currentUser.agentId);
    const agentTransactions = storage.getTransactionsByAgent(currentUser.agentId);

    setCashiers(agentCashiers);
    setPlayers(agentPlayers);
    setTables(agentTables);
    setTransactions(agentTransactions);
  };

  const handleLogout = () => {
    storage.logout();
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  const handleCreateCashier = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.agentId) return;

    // Проверяем уникальность логина
    if (storage.getUserByLogin(newCashierLogin)) {
      toast.error('Логин уже существует');
      return;
    }

    const password = generatePassword();
    const cashierId = generateId('cashier');

    storage.addUser({
      id: cashierId,
      login: newCashierLogin,
      password: password,
      role: 'cashier',
      agentId: currentUser.agentId,
      createdAt: new Date().toISOString(),
    });

    toast.success(`Кассир создан! Логин: ${newCashierLogin}, Пароль: ${password}`);
    setIsCreateCashierOpen(false);
    setNewCashierLogin('');
    loadData();
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.agentId) return;

    const tableId = generateId('table');

    storage.addTable({
      id: tableId,
      name: newTableName,
      agentId: currentUser.agentId,
      maxPlayers: parseInt(newTableMaxPlayers),
      currentPlayers: [],
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });

    toast.success(`Стол "${newTableName}" создан!`);
    setIsCreateTableOpen(false);
    setNewTableName('');
    setNewTableMaxPlayers('4');
    loadData();
  };

  const totalBalance = players.reduce((sum, p) => sum + (p.balance || 0), 0);
  const totalTransactions = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Панель Агента</h1>
            <p className="text-sm text-muted-foreground">Клуб: {agent?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Кассиров</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashiers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Игроков</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий Баланс</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalBalance)} ₽</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Оборот</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalTransactions)} ₽</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cashiers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cashiers">Кассиры</TabsTrigger>
            <TabsTrigger value="players">Игроки</TabsTrigger>
            <TabsTrigger value="tables">Столы</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          </TabsList>

          <TabsContent value="cashiers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Кассиры Клуба</CardTitle>
                    <CardDescription>Управление кассирами вашего клуба</CardDescription>
                  </div>
                  <Dialog open={isCreateCashierOpen} onOpenChange={setIsCreateCashierOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Создать Кассира
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Создать нового кассира</DialogTitle>
                        <DialogDescription>Введите логин. Пароль будет сгенерирован автоматически.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateCashier} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cashier-login">Логин</Label>
                          <Input
                            id="cashier-login"
                            value={newCashierLogin}
                            onChange={(e) => setNewCashierLogin(e.target.value)}
                            placeholder="cashier123"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Создать</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Логин</TableHead>
                      <TableHead>Игроков</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashiers.map(cashier => {
                      const cashierPlayers = players.filter(p => p.cashierId === cashier.id);
                      
                      return (
                        <TableRow key={cashier.id}>
                          <TableCell className="font-medium">{cashier.login}</TableCell>
                          <TableCell>{cashierPlayers.length}</TableCell>
                          <TableCell>{formatDate(cashier.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>Все Игроки Клуба</CardTitle>
                <CardDescription>Список всех игроков в вашем клубе</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Логин</TableHead>
                      <TableHead>Кассир</TableHead>
                      <TableHead>Баланс</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map(player => {
                      const cashier = cashiers.find(c => c.id === player.cashierId);
                      
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.login}</TableCell>
                          <TableCell>{cashier?.login || 'N/A'}</TableCell>
                          <TableCell>{formatAmount(player.balance || 0)} ₽</TableCell>
                          <TableCell>{formatDate(player.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Игровые Столы</CardTitle>
                    <CardDescription>Столы вашего клуба</CardDescription>
                  </div>
                  <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Создать Стол
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Создать новый игровой стол</DialogTitle>
                        <DialogDescription>Настройте параметры стола</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTable} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="table-name">Название</Label>
                          <Input
                            id="table-name"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                            placeholder="Стол №1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-players">Максимум игроков</Label>
                          <Input
                            id="max-players"
                            type="number"
                            min="2"
                            max="8"
                            value={newTableMaxPlayers}
                            onChange={(e) => setNewTableMaxPlayers(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Создать</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Игроков</TableHead>
                      <TableHead>Макс. игроков</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.map(table => (
                      <TableRow key={table.id}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>
                          <Badge variant={table.status === 'playing' ? 'default' : 'secondary'}>
                            {table.status === 'waiting' ? 'Ожидание' : table.status === 'playing' ? 'Играют' : 'Завершена'}
                          </Badge>
                        </TableCell>
                        <TableCell>{table.currentPlayers.length}</TableCell>
                        <TableCell>{table.maxPlayers}</TableCell>
                        <TableCell>{formatDate(table.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>История Транзакций</CardTitle>
                <CardDescription>Все финансовые операции в клубе</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Игрок</TableHead>
                      <TableHead>Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice().reverse().map(transaction => {
                      const player = players.find(p => p.id === transaction.playerId);
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                              {transaction.type === 'deposit' ? 'Пополнение' : transaction.type === 'withdraw' ? 'Списание' : 'Перевод'}
                            </Badge>
                          </TableCell>
                          <TableCell>{player?.login || 'N/A'}</TableCell>
                          <TableCell className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)} ₽
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}