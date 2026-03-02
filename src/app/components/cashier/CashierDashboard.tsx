import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../../lib/storage';
import { generateId, generatePlayerLogin, generatePassword } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { LogOut, Users, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatAmount } from '../../lib/utils';

export default function CashierDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [agent, setAgent] = useState(currentUser?.agentId ? storage.getAgentById(currentUser.agentId) : null);
  const [myPlayers, setMyPlayers] = useState<any[]>([]);
  const [isCreatePlayerOpen, setIsCreatePlayerOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [balanceAction, setBalanceAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [balanceAmount, setBalanceAmount] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'cashier' || !currentUser.agentId) {
      navigate('/');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    if (!currentUser?.id) return;

    const allUsers = storage.getUsers();
    const cashierPlayers = allUsers.filter(u => u.role === 'player' && u.cashierId === currentUser.id);
    setMyPlayers(cashierPlayers);
  };

  const handleLogout = () => {
    storage.logout();
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  const handleCreatePlayer = () => {
    if (!currentUser?.agentId || !currentUser?.id) return;

    const login = generatePlayerLogin();
    const password = generatePassword();
    const playerId = generateId('player');

    storage.addUser({
      id: playerId,
      login: login,
      password: password,
      role: 'player',
      agentId: currentUser.agentId,
      cashierId: currentUser.id,
      balance: 0,
      createdAt: new Date().toISOString(),
    });

    // Показываем данные для игрока
    toast.success(
      `Игрок создан!\n\nЛогин: ${login}\nПароль: ${password}\n\nПередайте эти данные игроку.`,
      { duration: 10000 }
    );

    setIsCreatePlayerOpen(false);
    loadData();
  };

  const handleBalanceAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlayer || !currentUser?.agentId || !currentUser?.id) return;

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }

    let newBalance = selectedPlayer.balance || 0;

    if (balanceAction === 'deposit') {
      newBalance += amount;
    } else {
      if (newBalance < amount) {
        toast.error('Недостаточно средств');
        return;
      }
      newBalance -= amount;
    }

    // Обновляем баланс игрока
    storage.updateUser(selectedPlayer.id, { balance: newBalance });

    // Записываем транзакцию
    storage.addTransaction({
      id: generateId('transaction'),
      playerId: selectedPlayer.id,
      cashierId: currentUser.id,
      agentId: currentUser.agentId,
      type: balanceAction,
      amount: amount,
      createdAt: new Date().toISOString(),
    });

    toast.success(
      balanceAction === 'deposit' 
        ? `Баланс пополнен на ${formatAmount(amount)} ₽`
        : `Списано ${formatAmount(amount)} ₽`
    );

    setIsBalanceDialogOpen(false);
    setBalanceAmount('');
    setSelectedPlayer(null);
    loadData();
  };

  const openBalanceDialog = (player: any, action: 'deposit' | 'withdraw') => {
    setSelectedPlayer(player);
    setBalanceAction(action);
    setIsBalanceDialogOpen(true);
  };

  const totalBalance = myPlayers.reduce((sum, p) => sum + (p.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Панель Кассира</h1>
            <p className="text-sm text-muted-foreground">Клуб: {agent?.name} | Логин: {currentUser?.login}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Моих Игроков</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myPlayers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий Баланс</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalBalance)} ₽</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Мои Игроки</CardTitle>
                <CardDescription>Список игроков, созданных вами</CardDescription>
              </div>
              <Dialog open={isCreatePlayerOpen} onOpenChange={setIsCreatePlayerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать Игрока
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать нового игрока</DialogTitle>
                    <DialogDescription>
                      Логин и пароль будут сгенерированы автоматически.
                      Передайте их игроку для входа в систему.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      После создания вы увидите логин и пароль игрока.
                      Обязательно запишите или передайте их игроку сразу.
                    </p>
                  </div>
                  <Button onClick={handleCreatePlayer} className="w-full">
                    Создать
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Логин</TableHead>
                  <TableHead>Баланс</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPlayers.map(player => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.login}</TableCell>
                    <TableCell>{formatAmount(player.balance || 0)} ₽</TableCell>
                    <TableCell>{formatDate(player.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openBalanceDialog(player, 'deposit')}
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Пополнить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openBalanceDialog(player, 'withdraw')}
                        >
                          <ArrowDown className="w-4 h-4 mr-1" />
                          Списать
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Balance Dialog */}
        <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {balanceAction === 'deposit' ? 'Пополнить баланс' : 'Списать средства'}
              </DialogTitle>
              <DialogDescription>
                Игрок: {selectedPlayer?.login}
                <br />
                Текущий баланс: {formatAmount(selectedPlayer?.balance || 0)} ₽
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBalanceAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Сумма (₽)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Введите сумму"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {balanceAction === 'deposit' ? 'Пополнить' : 'Списать'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}