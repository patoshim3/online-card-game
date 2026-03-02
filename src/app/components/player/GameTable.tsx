import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { storage } from '../../lib/storage';
import { generateId } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

export default function GameTable() {
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [table, setTable] = useState(tableId ? storage.getTableById(tableId) : null);
  const [players, setPlayers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'player' || !tableId) {
      navigate('/player');
      return;
    }

    loadData();

    // Симуляция real-time обновлений
    const interval = setInterval(() => {
      loadData();
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    if (!tableId) return;

    const updatedTable = storage.getTableById(tableId);
    if (!updatedTable) {
      navigate('/player');
      return;
    }
    setTable(updatedTable);

    // Загружаем игроков за столом
    const allUsers = storage.getUsers();
    const tablePlayers = updatedTable.currentPlayers
      .map(playerId => allUsers.find(u => u.id === playerId))
      .filter(Boolean);
    setPlayers(tablePlayers);

    // Загружаем сообщения чата
    const messages = storage.getChatMessagesByTable(tableId);
    setChatMessages(messages);
  };

  const handleLeaveTable = () => {
    if (!table || !currentUser) return;

    const updatedPlayers = table.currentPlayers.filter(id => id !== currentUser.id);
    storage.updateTable(table.id, { 
      currentPlayers: updatedPlayers,
      status: updatedPlayers.length === 0 ? 'waiting' : updatedPlayers.length >= 2 ? 'playing' : 'waiting'
    });

    toast.success('Вы покинули стол');
    navigate('/player');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser || !tableId) return;

    storage.addChatMessage({
      id: generateId('message'),
      tableId: tableId,
      playerId: currentUser.id,
      playerLogin: currentUser.login,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    });

    setNewMessage('');
    loadData();
  };

  if (!table) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleLeaveTable} 
                className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Покинуть стол
              </Button>
              <div className="h-10 w-px bg-slate-700"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">{table.name}</h1>
                <p className="text-sm text-slate-400">{players.length} / {table.maxPlayers} игроков</p>
              </div>
            </div>
            <Badge className={`px-4 py-2 text-sm font-semibold ${
              table.status === 'waiting' 
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {table.status === 'waiting' ? '⏳ Ожидание игроков' : '🎮 Игра идёт'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-700/50 bg-slate-800/30">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Игровое Поле
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Poker table with realistic felt texture */}
                <div className="aspect-video rounded-3xl relative overflow-hidden shadow-2xl" style={{
                  background: 'linear-gradient(145deg, #1a5f3d 0%, #0d4429 100%)',
                  boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.3)'
                }}>
                  {/* Poker table border */}
                  <div className="absolute inset-4 rounded-3xl border-8 border-amber-900/40" style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                  }}>
                    {/* Inner felt */}
                    <div className="absolute inset-4 rounded-2xl" style={{
                      background: 'radial-gradient(ellipse at center, #1a5f3d 0%, #0d4429 100%)',
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)'
                    }}>
                      {/* Center area */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          {table.status === 'waiting' ? (
                            <div className="space-y-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                                <Users className="relative w-20 h-20 text-emerald-400/60 mx-auto" />
                              </div>
                              <div>
                                <p className="text-white/90 text-xl font-semibold">Ожидание игроков...</p>
                                <p className="text-white/50 text-sm mt-2">
                                  Минимум 2 игрока для начала игры
                                </p>
                              </div>
                              <div className="flex justify-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-center gap-3 text-5xl mb-4">
                                <span className="transform hover:scale-110 transition-transform">♠️</span>
                                <span className="transform hover:scale-110 transition-transform delay-75">♥️</span>
                                <span className="transform hover:scale-110 transition-transform delay-150">♣️</span>
                                <span className="transform hover:scale-110 transition-transform delay-225">♦️</span>
                              </div>
                              <div>
                                <p className="text-white/90 text-2xl font-bold">Игра началась!</p>
                                <p className="text-emerald-400 text-sm mt-2">
                                  Здесь будет игровое поле с картами
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Player positions around the table */}
                      <div className="absolute inset-0">
                        {players.map((player, index) => {
                          const positions = [
                            { className: 'bottom-6 left-1/2 -translate-x-1/2', name: 'Вы' },
                            { className: 'top-6 left-1/2 -translate-x-1/2', name: player.login },
                            { className: 'left-6 top-1/2 -translate-y-1/2', name: player.login },
                            { className: 'right-6 top-1/2 -translate-y-1/2', name: player.login },
                          ];
                          
                          const pos = positions[index];
                          const isCurrentPlayer = player.id === currentUser?.id;
                          
                          return (
                            <div
                              key={player.id}
                              className={`absolute ${pos.className} pointer-events-auto`}
                            >
                              <div className={`backdrop-blur-sm rounded-xl px-4 py-3 border-2 shadow-lg transition-all duration-300 ${
                                isCurrentPlayer 
                                  ? 'bg-emerald-500/30 border-emerald-400/50 shadow-emerald-500/50' 
                                  : 'bg-slate-800/60 border-slate-600/50'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    isCurrentPlayer
                                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/50'
                                      : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
                                  }`}>
                                    {player.login.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold text-sm">
                                      {player.login}
                                    </p>
                                    {isCurrentPlayer && (
                                      <p className="text-emerald-400 text-xs font-medium">{pos.name}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players List */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Игроки за столом</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 p-2 rounded bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {player.login.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {player.login}
                        </p>
                        {player.id === currentUser?.id && (
                          <p className="text-green-400 text-xs">Вы</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-green-600/50 text-white">
                        Онлайн
                      </Badge>
                    </div>
                  ))}
                  {Array.from({ length: table.maxPlayers - players.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center gap-2 p-2 rounded bg-white/5 opacity-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-white/50 text-sm">Пусто</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Чат</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-2">
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`p-2 rounded ${
                          message.playerId === currentUser?.id
                            ? 'bg-green-600/30 ml-4'
                            : 'bg-white/5 mr-4'
                        }`}
                      >
                        <p className="text-white/70 text-xs mb-1">
                          {message.playerLogin} • {formatDate(message.createdAt)}
                        </p>
                        <p className="text-white text-sm">{message.message}</p>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <p className="text-white/50 text-sm text-center py-8">
                        Нет сообщений
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700 shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}