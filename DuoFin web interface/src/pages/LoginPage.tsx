import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Heart, Users } from 'lucide-react';
import { login } from '../services/auth';

interface LoginPageProps {
  onLogin: () => void;
}

const FEATURES = [
  { label: 'Conta compartilhada para o casal', color: '#4ADE80' },
  { label: 'Controle de metas e investimentos', color: '#2563EB' },
  { label: 'Planejamento do casamento integrado', color: '#E11D48' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Informe e-mail e senha para entrar.');
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <aside className="hidden lg:flex lg:w-[45%] bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 flex-shrink-0">
        <div className="absolute -top-28 -left-28 w-[28rem] h-[28rem] rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-96 h-96 rounded-full bg-[#E11D48]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#7C3AED]/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 rounded-[12px] bg-[#E11D48] flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span
              className="text-white text-[1.65rem] font-bold tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              DuoFin
            </span>
          </div>

          <h1
            className="text-[2.6rem] font-bold text-white leading-[1.15] mb-5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Finanças a dois,
            <br />
            <span className="text-[#4ADE80]">juntos no caminho.</span>
          </h1>
          <p className="text-white/55 text-base leading-relaxed max-w-sm">
            O painel financeiro criado para casais que constroem um futuro compartilhado com clareza e leveza.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {FEATURES.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white/65 text-sm">{item.label}</span>
            </div>
          ))}

          <div className="pt-6 mt-2 border-t border-white/10 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#0F172A] z-10">
                AL
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E11D48] flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#0F172A]">
                PA
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Ana & Pedro Alves Lima</p>
              <p className="text-white/40 text-xs">Conta do casal ativa</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-[12px] bg-[#E11D48] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span
              className="text-[#0F172A] text-xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              DuoFin
            </span>
          </div>

          <h2
            className="text-[1.65rem] font-bold text-[#0F172A] mb-1.5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Bem-vindo de volta
          </h2>
          <p className="text-[#64748B] text-sm mb-8 leading-relaxed">
            Entre com sua conta para acessar o painel financeiro do casal.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="w-full h-12 px-4 rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-medium"
              >
                Esqueci minha senha
              </button>
            </div>

            {error ? (
              <p className="text-sm text-[#E11D48] bg-[#FFF1F2] border border-[#FECDD3] rounded-xl px-3 py-2">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] active:scale-[0.98] transition-all shadow-lg shadow-[#2563EB]/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-xs text-[#94A3B8] font-medium">ou</span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>

            <button
              type="button"
              className="w-full h-12 rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-semibold hover:bg-[#F8FAFF] hover:border-[#2563EB]/30 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#2563EB]" />
              Criar conta do casal
            </button>
          </form>

          <p className="text-center text-xs text-[#94A3B8] mt-8 leading-relaxed">
            Ao entrar, você concorda com os{' '}
            <span className="text-[#2563EB] cursor-pointer hover:underline">Termos de Uso</span>
            {' '}e a{' '}
            <span className="text-[#2563EB] cursor-pointer hover:underline">Política de Privacidade</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
