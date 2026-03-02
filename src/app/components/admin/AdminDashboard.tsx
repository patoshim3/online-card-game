import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../../lib/storage';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { LogOut, Users, Building2, Wallet, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatAmount } from '../../lib/utils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [agents, setAgents] = useState(storage.getAgents());
  const [allUsers, setAllUsers] = useState(storage.getUsers());
  const [allTables, setAllTables] = useState(storage.getTables());
  const [allTransactions, setAllTransactions] = useState(storage.getTransactions());

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    storage.logout();
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  const cashiers = allUsers.filter(u => u.role === 'cashier');
  const players = allUsers.filter(u => u.role === 'player');
  const totalBalance = players.reduce((sum, p) => sum + (p.balance || 0), 0);
  const totalTransactions = allTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-500 p-3 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Панель Администратора
                </h1>
                <p className="text-sm text-slate-500">Добро пожаловать, {currentUser?.login}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Building2 className="w-32 h-32 -mt-4 -mr-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">Всего Агентов</CardTitle>
              <Building2 className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{agents.length}</div>
              <p className="text-xs text-white/70 mt-1">Активных клубов</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Users className="w-32 h-32 -mt-4 -mr-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">Всего Кассиров</CardTitle>
              <Users className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{cashiers.length}</div>
              <p className="text-xs text-white/70 mt-1">В системе</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Users className="w-32 h-32 -mt-4 -mr-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">Всего Игроков</CardTitle>
              <Users className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{players.length}</div>
              <p className="text-xs text-white/70 mt-1">Зарегистрировано</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Wallet className="w-32 h-32 -mt-4 -mr-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">Общий Баланс</CardTitle>
              <Wallet className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{formatAmount(totalBalance)} ₽</div>
              <p className="text-xs text-white/70 mt-1">Всех игроков</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="agents">Агенты</TabsTrigger>
            <TabsTrigger value="cashiers">Кассиры</TabsTrigger>
            <TabsTrigger value="players">Игроки</TabsTrigger>
            <TabsTrigger value="tables">Столы</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Все Агенты (Клубы)</CardTitle>
                <CardDescription>Список всех зарегистрированных агентов в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Кассиров</TableHead>
                      <TableHead>Игроков</TableHead>
                      <TableHead>Столов</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map(agent => {
                      const agentCashiers = cashiers.filter(c => c.agentId === agent.id);
                      const agentPlayers = players.filter(p => p.agentId === agent.id);
                      const agentTables = allTables.filter(t => t.agentId === agent.id);
                      
                      return (
                        <TableRow key={agent.id}>
                          <TableCell className="font-mono text-xs">{agent.id}</TableCell>
                          <TableCell className="font-medium">{agent.name}</TableCell>
                          <TableCell>{agentCashiers.length}</TableCell>
                          <TableCell>{agentPlayers.length}</TableCell>
                          <TableCell>{agentTables.length}</TableCell>
                          <TableCell>{formatDate(agent.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashiers">
            <Card>
              <CardHeader>
                <CardTitle>Все Кассиры</CardTitle>
                <CardDescription>Список всех кассиров во всех клубах</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Логин</TableHead>
                      <TableHead>Клуб</TableHead>
                      <TableHead>Игроков</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashiers.map(cashier => {
                      const agent = agents.find(a => a.id === cashier.agentId);
                      const cashierPlayers = players.filter(p => p.cashierId === cashier.id);
                      
                      return (
                        <TableRow key={cashier.id}>
                          <TableCell className="font-medium">{cashier.login}</TableCell>
                          <TableCell>{agent?.name || 'N/A'}</TableCell>
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
                <CardTitle>Все Игроки</CardTitle>
                <CardDescription>Список всех игроков во всех клубах</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Логин</TableHead>
                      <TableHead>Клуб</TableHead>
                      <TableHead>Кассир</TableHead>
                      <TableHead>Баланс</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map(player => {
                      const agent = agents.find(a => a.id === player.agentId);
                      const cashier = cashiers.find(c => c.id === player.cashierId);
                      
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.login}</TableCell>
                          <TableCell>{agent?.name || 'N/A'}</TableCell>
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
                <CardTitle>Все Игровые Столы</CardTitle>
                <CardDescription>Список всех столов во всех клубах</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Клуб</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Игроков</TableHead>
                      <TableHead>Макс. игроков</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTables.map(table => {
                      const agent = agents.find(a => a.id === table.agentId);
                      
                      return (
                        <TableRow key={table.id}>
                          <TableCell className="font-medium">{table.name}</TableCell>
                          <TableCell>{agent?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={table.status === 'playing' ? 'default' : 'secondary'}>
                              {table.status === 'waiting' ? 'Ожидание' : table.status === 'playing' ? 'Играют' : 'Завершена'}
                            </Badge>
                          </TableCell>
                          <TableCell>{table.currentPlayers.length}</TableCell>
                          <TableCell>{table.maxPlayers}</TableCell>
                          <TableCell>{formatDate(table.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Все Транзакции</CardTitle>
                <CardDescription>История всех финансовых операций</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Общий оборот</p>
                      <p className="text-2xl font-bold">{formatAmount(totalTransactions)} ₽</p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Игрок</TableHead>
                      <TableHead>Клуб</TableHead>
                      <TableHead>Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.slice().reverse().map(transaction => {
                      const player = players.find(p => p.id === transaction.playerId);
                      const agent = agents.find(a => a.id === transaction.agentId);
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                              {transaction.type === 'deposit' ? 'Пополнение' : transaction.type === 'withdraw' ? 'Списание' : 'Перевод'}
                            </Badge>
                          </TableCell>
                          <TableCell>{player?.login || 'N/A'}</TableCell>
                          <TableCell>{agent?.name || 'N/A'}</TableCell>
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