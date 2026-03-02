import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { storage } from '../../lib/storage';
import { toast } from 'sonner';
import { Spade, Heart, Club, Diamond, Lock, User } from 'lucide-react';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Инициализируем демо-данные при первой загрузке
  useState(() => {
    storage.initializeDemoData();
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const user = storage.getUserByLogin(login);

    if (!user) {
      toast.error('Пользователь не найден');
      return;
    }

    if (user.password !== password) {
      toast.error('Неверный пароль');
      return;
    }

    storage.setCurrentUser(user);
    toast.success(`Добро пожаловать, ${login}!`);

    // Перенаправляем в зависимости от роли
    switch (user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'agent':
        navigate('/agent');
        break;
      case 'cashier':
        navigate('/cashier');
        break;
      case 'player':
        navigate('/player');
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating cards decoration */}
      <div className="absolute top-20 left-20 opacity-10">
        <Spade className="w-16 h-16 text-white animate-float" />
      </div>
      <div className="absolute top-40 right-32 opacity-10">
        <Heart className="w-12 h-12 text-red-500 animate-float delay-500" />
      </div>
      <div className="absolute bottom-32 left-40 opacity-10">
        <Club className="w-14 h-14 text-white animate-float delay-1000" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-10">
        <Diamond className="w-10 h-10 text-red-500 animate-float delay-1500" />
      </div>

      <Card className="w-full max-w-md mx-4 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 p-6 rounded-2xl shadow-lg">
                <div className="grid grid-cols-2 gap-1">
                  <Spade className="w-6 h-6 text-white" />
                  <Heart className="w-6 h-6 text-white" />
                  <Club className="w-6 h-6 text-white" />
                  <Diamond className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
              Карты Онлайн
            </CardTitle>
            <CardDescription className="text-white/70 text-base mt-2">
              Профессиональная игровая платформа
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-white/90 font-medium">Логин</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Введите логин"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 focus:bg-white/15 focus:border-emerald-500/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 font-medium">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 focus:bg-white/15 focus:border-emerald-500/50"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
            >
              Войти в систему
            </Button>
          </form>

          <div className="mt-8 p-5 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-sm font-semibold mb-3 text-white/90">Демо-аккаунты для тестирования:</p>
            <div className="text-xs space-y-2 text-white/70">
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="font-medium text-emerald-400">Администратор</span>
                <code className="text-white/90">admin / admin123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="font-medium text-blue-400">Агент</span>
                <code className="text-white/90">agent1 / agent123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="font-medium text-purple-400">Кассир</span>
                <code className="text-white/90">cashier1 / cashier123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="font-medium text-orange-400">Игрок</span>
                <code className="text-white/90">player001 / pass123</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}