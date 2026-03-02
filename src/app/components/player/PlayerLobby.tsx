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
import { LogOut, Users, Wallet, UserPlus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatAmount } from '../../lib/utils';

export default function PlayerLobby() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [agent, setAgent] = useState(currentUser?.agentId ? storage.getAgentById(currentUser.agentId) : null);
  const [clubPlayers, setClubPlayers] = useState<any[]>([]);
  const [clubTables, setClubTables] = useState<any[]>([]);
  const [myTransactions, setMyTransactions] = useState<any[]>([]);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'player' || !currentUser.agentId) {
      navigate('/');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const loadData = () => {
    if (!currentUser?.agentId || !currentUser?.id) return;

    const allUsers = storage.getUsers();
    // Игроки того же клуба (агента)
    const players = allUsers.filter(u => u.role === 'player' && u.agentId === currentUser.agentId);
    setClubPlayers(players);

    // Столы клуба
    const tables = storage.getTablesByAgent(currentUser.agentId);
    setClubTables(tables);

    // Мои транзакции
    const transactions = storage.getTransactionsByPlayer(currentUser.id);
    setMyTransactions(transactions);

    // Обновляем текущего пользователя (баланс)
    const updatedUser = storage.getUserById(currentUser.id);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const handleLogout = () => {
    storage.logout();
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  const handleJoinTable = (tableId: string) => {
    const table = storage.getTableById(tableId);
    if (!table || !currentUser) return;

    if (table.currentPlayers.includes(currentUser.id)) {
      navigate(`/game/${tableId}`);
      return;
    }

    if (table.currentPlayers.length >= table.maxPlayers) {
      toast.error('Стол заполнен');
      return;
    }

    // Присоединяемся к столу
    const updatedPlayers = [...table.currentPlayers, currentUser.id];
    storage.updateTable(tableId, { 
      currentPlayers: updatedPlayers,
      status: updatedPlayers.length >= 2 ? 'playing' : 'waiting'
    });

    toast.success('Вы присоединились к столу');
    navigate(`/game/${tableId}`);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.agentId || !currentUser?.id) return;

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }

    if ((currentUser.balance || 0) < amount) {
      toast.error('Недостаточно средств');
      return;
    }

    const toPlayer = storage.getUserById(selectedPlayerId);
    if (!toPlayer) {
      toast.error('Игрок не найден');
      return;
    }

    // Списываем у отправителя
    storage.updateUser(currentUser.id, { balance: (currentUser.balance || 0) - amount });

    // Начисляем получателю
    storage.updateUser(toPlayer.id, { balance: (toPlayer.balance || 0) + amount });

    // Записываем транзакцию
    storage.addTransaction({
      id: generateId('transaction'),
      playerId: currentUser.id,
      cashierId: currentUser.cashierId!,
      agentId: currentUser.agentId,
      type: 'transfer',
      amount: amount,
      toPlayerId: toPlayer.id,
      createdAt: new Date().toISOString(),
    });

    toast.success(`Переведено ${formatAmount(amount)} ₽ игроку ${toPlayer.login}`);
    setIsTransferDialogOpen(false);
    setTransferAmount('');
    setSelectedPlayerId('');
    loadData();
  };

  const otherPlayers = clubPlayers.filter(p => p.id !== currentUser?.id);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Игровое Лобби</h1>
                <p className="text-sm text-emerald-400">{agent?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Ваш баланс</p>
                <p className="text-2xl font-bold text-white">{formatAmount(currentUser?.balance || 0)} <span className="text-lg text-emerald-400">₽</span></p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="tables" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1 backdrop-blur-sm">
            <TabsTrigger 
              value="tables" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-200"
            >
              Игровые Столы
            </TabsTrigger>
            <TabsTrigger 
              value="players"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-200"
            >
              Игроки
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-200"
            >
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubTables.map(table => (
                <Card key={table.id} className="group bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative">
                  {/* Table felt effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <CardTitle className="text-white text-xl">{table.name}</CardTitle>
                      <Badge 
                        variant={table.status === 'playing' ? 'default' : 'secondary'}
                        className={`${
                          table.status === 'playing' 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
                            : 'bg-slate-700 text-slate-300'
                        } px-3 py-1`}
                      >
                        {table.status === 'waiting' ? 'Ожидание' : table.status === 'playing' ? 'Играют' : 'Завершена'}
                      </Badge>
                    </div>
                    
                    {/* Player slots visualization */}
                    <div className="flex items-center gap-2 mb-4">
                      {Array.from({ length: table.maxPlayers }).map((_, i) => (
                        <div 
                          key={i}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            i < table.currentPlayers.length
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : 'border-slate-600 bg-slate-700/30'
                          }`}
                        >
                          {i < table.currentPlayers.length ? (
                            <Users className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    <CardDescription className="text-slate-400">
                      {table.currentPlayers.length} / {table.maxPlayers} игроков за столом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Button
                      onClick={() => handleJoinTable(table.id)}
                      disabled={table.currentPlayers.length >= table.maxPlayers && !table.currentPlayers.includes(currentUser?.id || '')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
                    >
                      {table.currentPlayers.includes(currentUser?.id || '') ? 'Продолжить игру' : table.currentPlayers.length >= table.maxPlayers ? 'Стол заполнен' : 'Присоединиться'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="players">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Игроки Клуба</CardTitle>
                    <CardDescription className="text-white/60">Все игроки вашего клуба</CardDescription>
                  </div>
                  <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-2" />
                        Перевести средства
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Перевод средств</DialogTitle>
                        <DialogDescription>
                          Ваш баланс: {formatAmount(currentUser?.balance || 0)} ₽
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleTransfer} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="to-player">Получатель</Label>
                          <select
                            id="to-player"
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            required
                          >
                            <option value="">Выберите игрока</option>
                            {otherPlayers.map(player => (
                              <option key={player.id} value={player.id}>
                                {player.login}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transfer-amount">Сумма (₽)</Label>
                          <Input
                            id="transfer-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={currentUser?.balance || 0}
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="Введите сумму"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Перевести
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/70">Логин</TableHead>
                      <TableHead className="text-white/70">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clubPlayers.map(player => (
                      <TableRow key={player.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white">
                          {player.login}
                          {player.id === currentUser?.id && <Badge className="ml-2 bg-blue-600">Вы</Badge>}
                        </TableCell>
                        <TableCell className="text-white/70">
                          <Badge variant="secondary" className="bg-green-600/50">
                            Онлайн
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">История Транзакций</CardTitle>
                <CardDescription className="text-white/60">Ваши финансовые операции</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/70">Дата</TableHead>
                      <TableHead className="text-white/70">Тип</TableHead>
                      <TableHead className="text-white/70">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTransactions.slice().reverse().map(transaction => (
                      <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white/70">{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.type === 'deposit' ? 'default' : 'secondary'}
                            className={transaction.type === 'deposit' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {transaction.type === 'deposit' ? 'Пополнение' : transaction.type === 'withdraw' ? 'Списание' : 'Перевод'}
                          </Badge>
                        </TableCell>
                        <TableCell className={transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)} ₽
                        </TableCell>
                      </TableRow>
                    ))}
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