import { useState, useMemo } from "react";
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, PlusCircle,
  CreditCard, Tag, Target, TrendingUp, Heart, BarChart2,
  Settings, Bell, LogOut, Wallet, PiggyBank,
  Search, Users, ChevronDown, X, SlidersHorizontal,
  Briefcase, Pencil, Trash2, Building2, Banknote, CalendarDays,
  Landmark, ToggleLeft, ToggleRight, CalendarClock,
} from "lucide-react";
import LoginPage from "../pages/LoginPage";
import { isAuthenticated, logout } from "../services/auth";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const LOGGED_IN_USER = "Ana Lima";

const ENTRADA_CATEGORIES = ["Salário", "Renda Extra", "Freelance", "Investimentos", "Aluguéis", "Outros"];
const SAIDA_CATEGORIES = ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Assinaturas", "Educação", "Outros"];
const RENDA_EXTRA_CATEGORIES = ["Design", "Desenvolvimento", "Consultoria", "Fotografia", "Aulas", "Redação", "Marketing", "Outros"];
const ACCOUNTS = ["Conta Corrente", "Conta Poupança", "Corretora", "Carteira Digital"];
const PAYMENT_METHODS = ["Cartão de Crédito", "Cartão de Débito", "Pix", "Débito Automático", "Boleto", "Dinheiro"];
const RESPONSIBLES = ["Ana Lima", "Pedro Alves", "Casal"];
const PERIODS = ["Junho 2025", "Maio 2025", "Abril 2025", "Últimos 3 meses", "Todos"];
const JOB_STATUSES = ["Em negociação", "Em andamento", "A receber", "Recebido", "Cancelado"] as const;
const CATEGORY_TYPES = ["Entrada", "Saída", "Renda Extra", "Investimento", "Geral"] as const;
const CATEGORY_ICONS = ["🏠", "🍽️", "🚗", "💊", "🎮", "📚", "✈️", "👗", "💰", "📈", "🏋️", "🎵", "💻", "🐕", "🎁", "🔧", "🎨", "📱", "🏥", "⚡"];
const CATEGORY_COLORS = ["#2563EB", "#10B981", "#F43F5E", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#6366F1", "#14B8A6", "#EF4444"];
const ACCOUNT_TYPES_LIST = ["Conta Corrente", "Conta Conjunta", "Poupança", "Carteira", "Reserva de Emergência", "Investimentos", "Cartão de Crédito"];

// ─── Types ────────────────────────────────────────────────────────────────────

type Responsible = "Ana Lima" | "Pedro Alves" | "Casal";
type ExpenseType = "fixo" | "variavel";
type JobStatus = "Em negociação" | "Em andamento" | "A receber" | "Recebido" | "Cancelado";
type CategoryType = "Entrada" | "Saída" | "Renda Extra" | "Investimento" | "Geral";
type NavId = "dashboard" | "entradas" | "saidas" | "renda-extra" | "contas" | "categorias" | "metas" | "investimentos" | "casamento" | "relatorios" | "configuracoes";

interface RendaExtraItem {
  id: number;
  name: string;
  client: string;
  value: number;
  category: string;
  date: string;
  paymentDate: string;
  status: JobStatus;
  responsible: Responsible;
  registeredBy: string;
  notes?: string;
}

interface CategoryItem {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  active: boolean;
  count: number;
}

interface AccountItem {
  id: number;
  name: string;
  institution: string;
  type: string;
  balance: number;
  responsible: Responsible;
  color: string;
}

interface EntradaItem {
  id: number;
  desc: string;
  value: number;
  date: string;
  category: string;
  responsible: Responsible;
  account: string;
  registeredBy: string;
  notes?: string;
}

interface SaidaItem {
  id: number;
  desc: string;
  value: number;
  date: string;
  category: string;
  responsible: Responsible;
  paymentMethod: string;
  expenseType: ExpenseType;
  registeredBy: string;
  notes?: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (s: string) => {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const sidebarItems: { icon: React.ElementType; label: string; id: NavId; badge?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: ArrowDownLeft, label: "Entradas", id: "entradas" },
  { icon: ArrowUpRight, label: "Saídas", id: "saidas" },
  { icon: PlusCircle, label: "Renda Extra", id: "renda-extra" },
  { icon: CreditCard, label: "Contas", id: "contas" },
  { icon: Tag, label: "Categorias", id: "categorias" },
  { icon: Target, label: "Metas", id: "metas" },
  { icon: TrendingUp, label: "Investimentos", id: "investimentos" },
  { icon: Heart, label: "Casamento", id: "casamento", badge: true },
  { icon: BarChart2, label: "Relatórios", id: "relatorios" },
  { icon: Settings, label: "Configurações", id: "configuracoes" },
];

const dashMonthlyData = [
  { month: "Jan", entradas: 8200, saidas: 5400 },
  { month: "Fev", entradas: 8500, saidas: 6100 },
  { month: "Mar", entradas: 9100, saidas: 5800 },
  { month: "Abr", entradas: 8900, saidas: 7200 },
  { month: "Mai", entradas: 9600, saidas: 5900 },
  { month: "Jun", entradas: 10200, saidas: 6400 },
];

const dashCategoryData = [
  { name: "Moradia", value: 2100, color: "#2563EB" },
  { name: "Alimentação", value: 1420, color: "#10B981" },
  { name: "Transporte", value: 980, color: "#F43F5E" },
  { name: "Lazer", value: 780, color: "#8B5CF6" },
  { name: "Saúde", value: 580, color: "#F59E0B" },
  { name: "Outros", value: 540, color: "#64748B" },
];

const dashTransactions = [
  { id: 1, desc: "Salário Ana Lima", cat: "Renda", date: "10 Jun", value: 5200, type: "entrada" as const, initials: "AL", color: "#2563EB" },
  { id: 2, desc: "Salário Pedro Alves", cat: "Renda", date: "05 Jun", value: 5000, type: "entrada" as const, initials: "PA", color: "#F43F5E" },
  { id: 3, desc: "Aluguel Apartamento", cat: "Moradia", date: "03 Jun", value: 2100, type: "saida" as const, initials: "🏠", color: "" },
  { id: 4, desc: "Supermercado Extra", cat: "Alimentação", date: "08 Jun", value: 485, type: "saida" as const, initials: "🛒", color: "" },
  { id: 5, desc: "Freelance Design", cat: "Renda Extra", date: "12 Jun", value: 1500, type: "entrada" as const, initials: "AL", color: "#2563EB" },
  { id: 6, desc: "Restaurante Outback", cat: "Lazer", date: "14 Jun", value: 230, type: "saida" as const, initials: "🍽️", color: "" },
  { id: 7, desc: "Academia Smart Fit", cat: "Saúde", date: "01 Jun", value: 120, type: "saida" as const, initials: "💪", color: "" },
];

const initialEntradas: EntradaItem[] = [
  { id: 1, desc: "Salário Ana Lima", value: 5200, date: "2025-06-05", category: "Salário", responsible: "Ana Lima", account: "Conta Corrente", registeredBy: "Ana Lima" },
  { id: 2, desc: "Salário Pedro Alves", value: 5000, date: "2025-06-05", category: "Salário", responsible: "Pedro Alves", account: "Conta Corrente", registeredBy: "Pedro Alves" },
  { id: 3, desc: "Freelance Design UI", value: 1500, date: "2025-06-12", category: "Freelance", responsible: "Ana Lima", account: "Conta Poupança", registeredBy: "Ana Lima" },
  { id: 4, desc: "Dividendos ITSA4", value: 320, date: "2025-06-10", category: "Investimentos", responsible: "Casal", account: "Corretora", registeredBy: "Pedro Alves" },
  { id: 5, desc: "Venda Marketplace", value: 280, date: "2025-06-15", category: "Renda Extra", responsible: "Pedro Alves", account: "Conta Corrente", registeredBy: "Pedro Alves" },
  { id: 6, desc: "Aluguel Sala Comercial", value: 800, date: "2025-06-01", category: "Aluguéis", responsible: "Casal", account: "Conta Corrente", registeredBy: "Ana Lima" },
  { id: 7, desc: "Cashback Cartão", value: 67, date: "2025-06-20", category: "Outros", responsible: "Casal", account: "Conta Corrente", registeredBy: "Ana Lima" },
  { id: 8, desc: "Bônus Semestral", value: 2000, date: "2025-06-28", category: "Salário", responsible: "Pedro Alves", account: "Conta Corrente", registeredBy: "Pedro Alves" },
];

const entradasChartData = [
  { month: "Jan", salario: 7500, rendaExtra: 700, outros: 320 },
  { month: "Fev", salario: 7500, rendaExtra: 950, outros: 400 },
  { month: "Mar", salario: 8100, rendaExtra: 1200, outros: 280 },
  { month: "Abr", salario: 7900, rendaExtra: 800, outros: 350 },
  { month: "Mai", salario: 8100, rendaExtra: 1400, outros: 490 },
  { month: "Jun", salario: 10200, rendaExtra: 2647, outros: 320 },
];

const initialSaidas: SaidaItem[] = [
  { id: 1, desc: "Aluguel Apartamento", value: 2100, date: "2025-06-03", category: "Moradia", responsible: "Casal", paymentMethod: "Débito Automático", expenseType: "fixo", registeredBy: "Ana Lima" },
  { id: 2, desc: "Supermercado Extra", value: 485, date: "2025-06-08", category: "Alimentação", responsible: "Ana Lima", paymentMethod: "Cartão de Crédito", expenseType: "variavel", registeredBy: "Ana Lima" },
  { id: 3, desc: "Restaurante Outback", value: 230, date: "2025-06-14", category: "Lazer", responsible: "Casal", paymentMethod: "Cartão de Crédito", expenseType: "variavel", registeredBy: "Pedro Alves" },
  { id: 4, desc: "Academia Smart Fit", value: 120, date: "2025-06-01", category: "Saúde", responsible: "Ana Lima", paymentMethod: "Débito Automático", expenseType: "fixo", registeredBy: "Ana Lima" },
  { id: 5, desc: "Uber — Trabalho", value: 89, date: "2025-06-10", category: "Transporte", responsible: "Pedro Alves", paymentMethod: "Pix", expenseType: "variavel", registeredBy: "Pedro Alves" },
  { id: 6, desc: "Netflix + Spotify", value: 75, date: "2025-06-05", category: "Assinaturas", responsible: "Casal", paymentMethod: "Cartão de Crédito", expenseType: "fixo", registeredBy: "Ana Lima" },
  { id: 7, desc: "Farmácia Medicamentos", value: 145, date: "2025-06-18", category: "Saúde", responsible: "Ana Lima", paymentMethod: "Cartão de Crédito", expenseType: "variavel", registeredBy: "Ana Lima" },
  { id: 8, desc: "IPTU Parcela 6/10", value: 380, date: "2025-06-07", category: "Moradia", responsible: "Casal", paymentMethod: "Boleto", expenseType: "fixo", registeredBy: "Pedro Alves" },
  { id: 9, desc: "Gasolina", value: 210, date: "2025-06-16", category: "Transporte", responsible: "Pedro Alves", paymentMethod: "Cartão de Débito", expenseType: "variavel", registeredBy: "Pedro Alves" },
  { id: 10, desc: "Plano de Saúde", value: 680, date: "2025-06-01", category: "Saúde", responsible: "Casal", paymentMethod: "Débito Automático", expenseType: "fixo", registeredBy: "Ana Lima" },
];

const saidasChartData = [
  { month: "Jan", fixo: 3200, variavel: 2200 },
  { month: "Fev", fixo: 3200, variavel: 2900 },
  { month: "Mar", fixo: 3200, variavel: 2600 },
  { month: "Abr", fixo: 3200, variavel: 4000 },
  { month: "Mai", fixo: 3200, variavel: 2700 },
  { month: "Jun", fixo: 3355, variavel: 3045 },
];

const saidasCategoryData = [
  { name: "Moradia", value: 2480, color: "#2563EB" },
  { name: "Saúde", value: 945, color: "#10B981" },
  { name: "Alimentação", value: 485, color: "#F43F5E" },
  { name: "Transporte", value: 299, color: "#8B5CF6" },
  { name: "Lazer", value: 230, color: "#F59E0B" },
  { name: "Assinaturas", value: 75, color: "#64748B" },
];

const initialRendaExtra: RendaExtraItem[] = [
  { id: 1, name: "Identidade Visual Startup", client: "NovaTech Ltda", value: 2800, category: "Design", date: "2025-06-02", paymentDate: "2025-06-20", status: "Recebido", responsible: "Ana Lima", registeredBy: "Ana Lima" },
  { id: 2, name: "Landing Page E-commerce", client: "ModaFácil", value: 3500, category: "Desenvolvimento", date: "2025-06-05", paymentDate: "2025-06-30", status: "Em andamento", responsible: "Pedro Alves", registeredBy: "Pedro Alves" },
  { id: 3, name: "Consultoria UX — App Mobile", client: "FinBank", value: 1800, category: "Consultoria", date: "2025-06-10", paymentDate: "2025-06-25", status: "A receber", responsible: "Ana Lima", registeredBy: "Ana Lima" },
  { id: 4, name: "Fotos Produto Catálogo", client: "Beleza Natural", value: 1200, category: "Fotografia", date: "2025-06-08", paymentDate: "2025-07-05", status: "Em andamento", responsible: "Casal", registeredBy: "Ana Lima" },
  { id: 5, name: "Dashboard Analytics", client: "DataViz Corp", value: 4200, category: "Desenvolvimento", date: "2025-06-12", paymentDate: "2025-07-10", status: "Em negociação", responsible: "Pedro Alves", registeredBy: "Pedro Alves" },
  { id: 6, name: "Aulas de React — 10h", client: "João Mendes", value: 900, category: "Aulas", date: "2025-06-01", paymentDate: "2025-06-15", status: "Recebido", responsible: "Pedro Alves", registeredBy: "Pedro Alves" },
  { id: 7, name: "Copy Site Institucional", client: "Contábil Prime", value: 650, category: "Redação", date: "2025-06-14", paymentDate: "2025-07-01", status: "A receber", responsible: "Ana Lima", registeredBy: "Ana Lima" },
  { id: 8, name: "Social Media — Junho", client: "Café & Arte", value: 480, category: "Marketing", date: "2025-05-28", paymentDate: "2025-06-05", status: "Cancelado", responsible: "Ana Lima", registeredBy: "Ana Lima", notes: "Cliente cancelou o contrato." },
];

const rendaExtraChartData = [
  { month: "Jan", recebido: 1200, previsto: 0 },
  { month: "Fev", recebido: 2300, previsto: 0 },
  { month: "Mar", recebido: 3100, previsto: 0 },
  { month: "Abr", recebido: 1800, previsto: 0 },
  { month: "Mai", recebido: 4600, previsto: 0 },
  { month: "Jun", recebido: 3700, previsto: 5700 },
];

const initialCategories: CategoryItem[] = [
  { id: 1, name: "Moradia", type: "Saída", icon: "🏠", color: "#2563EB", active: true, count: 12 },
  { id: 2, name: "Alimentação", type: "Saída", icon: "🍽️", color: "#10B981", active: true, count: 28 },
  { id: 3, name: "Transporte", type: "Saída", icon: "🚗", color: "#F43F5E", active: true, count: 15 },
  { id: 4, name: "Saúde", type: "Saída", icon: "💊", color: "#F59E0B", active: true, count: 7 },
  { id: 5, name: "Lazer", type: "Saída", icon: "🎮", color: "#8B5CF6", active: true, count: 9 },
  { id: 6, name: "Assinaturas", type: "Saída", icon: "📱", color: "#06B6D4", active: true, count: 6 },
  { id: 7, name: "Salário", type: "Entrada", icon: "💰", color: "#10B981", active: true, count: 4 },
  { id: 8, name: "Investimentos", type: "Entrada", icon: "📈", color: "#2563EB", active: true, count: 3 },
  { id: 9, name: "Design", type: "Renda Extra", icon: "🎨", color: "#EC4899", active: true, count: 5 },
  { id: 10, name: "Desenvolvimento", type: "Renda Extra", icon: "💻", color: "#6366F1", active: true, count: 4 },
  { id: 11, name: "Educação", type: "Saída", icon: "📚", color: "#F97316", active: false, count: 2 },
  { id: 12, name: "Viagens", type: "Geral", icon: "✈️", color: "#14B8A6", active: true, count: 1 },
];

const initialAccounts: AccountItem[] = [
  { id: 1, name: "Conta Corrente Principal", institution: "Nubank", type: "Conta Corrente", balance: 8420.50, responsible: "Casal", color: "#8B5CF6" },
  { id: 2, name: "Conta Corrente Ana", institution: "Itaú", type: "Conta Corrente", balance: 2150.00, responsible: "Ana Lima", color: "#2563EB" },
  { id: 3, name: "Conta Corrente Pedro", institution: "Bradesco", type: "Conta Corrente", balance: 1980.30, responsible: "Pedro Alves", color: "#F43F5E" },
  { id: 4, name: "Poupança do Casal", institution: "Caixa Econômica", type: "Poupança", balance: 15600.00, responsible: "Casal", color: "#10B981" },
  { id: 5, name: "Reserva de Emergência", institution: "Nubank", type: "Reserva de Emergência", balance: 22000.00, responsible: "Casal", color: "#F59E0B" },
  { id: 6, name: "Carteira Investimentos", institution: "XP Investimentos", type: "Investimentos", balance: 45000.00, responsible: "Casal", color: "#06B6D4" },
  { id: 7, name: "Carteira Pessoal Ana", institution: "Carteira", type: "Carteira", balance: 350.00, responsible: "Ana Lima", color: "#EC4899" },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg, badge, badgeColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {badge && (
          <span
            className="text-[11px] font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: badgeColor + "22", color: badgeColor }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-[#64748B] text-xs font-medium mb-1">{label}</p>
      <p className="text-[#0F172A] text-[1.4rem] font-bold tracking-tight leading-none mb-1" style={{ fontFamily: "DM Mono, monospace" }}>
        {value}
      </p>
      <p className="text-[#94A3B8] text-[11px]">{sub}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; color: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#0F172A] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#64748B]">{p.name}:</span>
          <span className="font-semibold text-[#0F172A]">{formatBRL(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function ResponsibleBadge({ name }: { name: Responsible }) {
  const cfg = {
    "Ana Lima": { bg: "#EFF6FF", color: "#2563EB", dot: "#2563EB" },
    "Pedro Alves": { bg: "#FFF1F3", color: "#F43F5E", dot: "#F43F5E" },
    "Casal": { bg: "#F5F3FF", color: "#8B5CF6", dot: "#8B5CF6" },
  }[name];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {name}
    </span>
  );
}

function RegisteredByChip({ name }: { name: string }) {
  const isAna = name === "Ana Lima";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
      style={{ backgroundColor: isAna ? "#2563EB" : "#F43F5E" }}
    >
      {isAna ? "AL" : "PA"}
    </span>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg: Record<JobStatus, { bg: string; color: string; dot: string }> = {
    "Em negociação": { bg: "#F5F3FF", color: "#8B5CF6", dot: "#8B5CF6" },
    "Em andamento":  { bg: "#EFF6FF", color: "#2563EB", dot: "#2563EB" },
    "A receber":     { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
    "Recebido":      { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
    "Cancelado":     { bg: "#FFF1F3", color: "#E11D48", dot: "#F43F5E" },
  };
  const c = cfg[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-[#CBD5E1]";
const selectCls = "w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none cursor-pointer";

function SelectField({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
    </div>
  );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────

function FiltersBar({ filters, onFilter, extraFilters }: {
  filters: Record<string, string>;
  onFilter: (key: string, value: string) => void;
  extraFilters?: { key: string; label: string; options: string[] }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2 text-[#64748B]">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-xs font-semibold text-[#64748B]">Filtros:</span>
      </div>

      {/* Period */}
      <div className="relative">
        <select
          className="h-8 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer"
          value={filters.period || ""}
          onChange={(e) => onFilter("period", e.target.value)}
        >
          <option value="">Período</option>
          {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
      </div>

      {/* Category */}
      <div className="relative">
        <select
          className="h-8 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer"
          value={filters.category || ""}
          onChange={(e) => onFilter("category", e.target.value)}
        >
          <option value="">Categoria</option>
          {(extraFilters?.find((f) => f.key === "category")?.options ?? []).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
      </div>

      {/* Responsible */}
      <div className="relative">
        <select
          className="h-8 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer"
          value={filters.responsible || ""}
          onChange={(e) => onFilter("responsible", e.target.value)}
        >
          <option value="">Responsável</option>
          {RESPONSIBLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
      </div>

      {/* Extra filters (e.g. payment method) */}
      {extraFilters?.filter((f) => f.key !== "category").map((ef) => (
        <div key={ef.key} className="relative">
          <select
            className="h-8 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer"
            value={filters[ef.key] || ""}
            onChange={(e) => onFilter(ef.key, e.target.value)}
          >
            <option value="">{ef.label}</option>
            {ef.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
        </div>
      ))}

      {/* Clear filters */}
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => Object.keys(filters).forEach((k) => onFilter(k, ""))}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium text-[#F43F5E] bg-[#FFF1F3] hover:bg-[#FFE4E8] transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar
        </button>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onNav, onLogout }: { active: NavId; onNav: (id: NavId) => void; onLogout: () => void }) {
  return (
    <aside className="w-[232px] bg-[#0F172A] flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/15 flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#F43F5E]" fill="#F43F5E" />
          </div>
          <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            DuoFin
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
              }`}
            >
              <Icon className="w-[1.05rem] h-[1.05rem] flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <header className="bg-white border-b border-[#E2E8F0]/80 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-base font-bold text-[#0F172A] leading-none mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          {title}
        </h1>
        <p className="text-[#94A3B8] text-xs">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <div className="hidden md:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] text-[#CBD5E1] text-xs w-52 cursor-text">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Buscar lançamentos...</span>
        </div>
        <button className="relative w-9 h-9 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#EFF6FF] hover:border-[#2563EB]/20 transition-colors">
          <Bell className="w-4 h-4 text-[#64748B]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white z-10 select-none">AL</div>
            <div className="w-9 h-9 rounded-xl bg-[#F43F5E] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white select-none">PA</div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-[#0F172A] leading-none mb-0.5">Ana & Pedro</p>
            <p className="text-xs text-[#94A3B8]">Alves Lima</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#CBD5E1]" />
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const weddingGoal = 80000;
  const weddingCurrent = 45000;
  const weddingPct = Math.round((weddingCurrent / weddingGoal) * 100);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" }}>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="Saldo Total" value={formatBRL(13800)} sub="vs. mês anterior" icon={Wallet} iconColor="text-[#2563EB]" iconBg="bg-[#EFF6FF]" badge="+8,2%" badgeColor="#10B981" />
        <StatCard label="Entradas" value={formatBRL(11700)} sub="vs. mês anterior" icon={ArrowDownLeft} iconColor="text-[#10B981]" iconBg="bg-[#ECFDF5]" badge="+6,3%" badgeColor="#10B981" />
        <StatCard label="Saídas" value={formatBRL(6400)} sub="vs. mês anterior" icon={ArrowUpRight} iconColor="text-[#F43F5E]" iconBg="bg-[#FFF1F3]" badge="+8,5%" badgeColor="#F43F5E" />
        <StatCard label="Valor Guardado" value={formatBRL(5300)} sub="vs. mês anterior" icon={PiggyBank} iconColor="text-[#8B5CF6]" iconBg="bg-[#F5F3FF]" badge="+12,1%" badgeColor="#10B981" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Entradas x Saídas</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="inline-block w-6 h-0.5 rounded-full bg-[#2563EB]" />Entradas
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="inline-block w-6 h-0.5 rounded-full bg-[#F43F5E]" />Saídas
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={196}>
            <AreaChart data={dashMonthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={46} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#2563EB" strokeWidth={2} fill="url(#gE)" dot={false} activeDot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#F43F5E" strokeWidth={2} fill="url(#gS)" dot={false} activeDot={{ r: 4, fill: "#F43F5E", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 flex flex-col">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">Gastos por Categoria</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Junho 2025</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={dashCategoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {dashCategoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatBRL(v), ""]} contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-1">
            {dashCategoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-[#64748B] flex-1">{cat.name}</span>
                <span className="text-xs font-semibold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>{formatBRL(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">
        <div className="bg-gradient-to-br from-[#FFF1F3] via-[#FFF1F3] to-[#FFF8F0] rounded-2xl p-5 border border-[#F43F5E]/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#F43F5E]" fill="#F43F5E" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Meta do Casamento</h3>
              <p className="text-xs text-[#94A3B8]">Dezembro 2025</p>
            </div>
          </div>
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-2xl font-bold text-[#0F172A] leading-none" style={{ fontFamily: "DM Mono, monospace" }}>{formatBRL(weddingCurrent)}</span>
            <span className="text-xs text-[#94A3B8]">meta: {formatBRL(weddingGoal)}</span>
          </div>
          <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#F43F5E] to-[#FB923C]" style={{ width: `${weddingPct}%` }} />
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-semibold text-[#F43F5E]">{weddingPct}% atingido</span>
            <span className="text-xs text-[#94A3B8]">Faltam {formatBRL(weddingGoal - weddingCurrent)}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-xl p-3.5">
              <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Guardado/mês</p>
              <p className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>R$ 2.500</p>
            </div>
            <div className="bg-white/60 rounded-xl p-3.5">
              <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Meses restantes</p>
              <p className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>6 meses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Últimos Lançamentos</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Junho 2025</p>
            </div>
            <button className="text-xs text-[#2563EB] font-semibold hover:text-[#1D4ED8] transition-colors">Ver todos →</button>
          </div>
          <div className="space-y-0.5">
            {dashTransactions.map((tx) => {
              const isInitials = tx.initials.length === 2;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 select-none ${isInitials ? "text-white text-[10px] font-bold" : "bg-[#F8FAFF] text-base"}`} style={isInitials ? { backgroundColor: tx.color } : {}}>
                    {tx.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate leading-none mb-0.5">{tx.desc}</p>
                    <p className="text-[11px] text-[#94A3B8]">{tx.cat} · {tx.date}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-semibold ${tx.type === "entrada" ? "text-[#10B981]" : "text-[#F43F5E]"}`} style={{ fontFamily: "DM Mono, monospace" }}>
                      {tx.type === "entrada" ? "+" : "-"}{formatBRL(tx.value)}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${tx.type === "entrada" ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FFF1F3] text-[#F43F5E]"}`}>
                      {tx.type === "entrada" ? "entrada" : "saída"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Entradas Content ─────────────────────────────────────────────────────────

function EntradasContent() {
  const [items, setItems] = useState<EntradaItem[]>(initialEntradas);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    desc: "", value: "", date: "", category: "", responsible: "" as Responsible | "",
    account: "", notes: "",
  });

  const setFilter = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.responsible && item.responsible !== filters.responsible) return false;
      return true;
    });
  }, [items, filters]);

  const totalRecebido = items.reduce((s, i) => s + i.value, 0);
  const totalPrevisto = 13200;
  const totalSalarios = items.filter((i) => i.category === "Salário").reduce((s, i) => s + i.value, 0);
  const totalExtra = items.filter((i) => i.category !== "Salário").reduce((s, i) => s + i.value, 0);

  const handleSubmit = () => {
    if (!form.desc || !form.value || !form.date || !form.category || !form.responsible || !form.account) return;
    const newItem: EntradaItem = {
      id: Date.now(),
      desc: form.desc,
      value: parseFloat(form.value),
      date: form.date,
      category: form.category,
      responsible: form.responsible as Responsible,
      account: form.account,
      registeredBy: LOGGED_IN_USER,
      notes: form.notes || undefined,
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ desc: "", value: "", date: "", category: "", responsible: "", account: "", notes: "" });
    setModalOpen(false);
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" }}>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Recebido" value={formatBRL(totalRecebido)} sub="Junho 2025" icon={Wallet} iconColor="text-[#10B981]" iconBg="bg-[#ECFDF5]" badge="+6,3%" badgeColor="#10B981" />
        <StatCard label="Entradas Previstas" value={formatBRL(totalPrevisto)} sub="Aguardando recebimento" icon={ArrowDownLeft} iconColor="text-[#2563EB]" iconBg="bg-[#EFF6FF]" badge={`${Math.round((totalRecebido / totalPrevisto) * 100)}%`} badgeColor="#2563EB" />
        <StatCard label="Salários" value={formatBRL(totalSalarios)} sub="Ambos os cônjuges" icon={CreditCard} iconColor="text-[#8B5CF6]" iconBg="bg-[#F5F3FF]" />
        <StatCard label="Renda Extra" value={formatBRL(totalExtra)} sub="Freelance, dividendos e outros" icon={PlusCircle} iconColor="text-[#F43F5E]" iconBg="bg-[#FFF1F3]" badge="+18%" badgeColor="#10B981" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">Entradas por Categoria</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Últimos 6 meses — acumulado mensal</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {[
              { label: "Salários", color: "#2563EB" },
              { label: "Renda Extra", color: "#10B981" },
              { label: "Outros", color: "#8B5CF6" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[#64748B]">
                <span className="w-3 h-2.5 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={entradasChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={46} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFF" }} />
            <Bar dataKey="salario" name="Salários" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
            <Bar dataKey="rendaExtra" name="Renda Extra" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="outros" name="Outros" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0]/80 overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0]/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Lançamentos — Entradas</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">{filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] active:scale-[0.98] transition-all shadow-md shadow-[#2563EB]/25"
            >
              <PlusCircle className="w-4 h-4" />
              Nova entrada
            </button>
          </div>
          <FiltersBar
            filters={filters}
            onFilter={setFilter}
            extraFilters={[{ key: "category", label: "Categoria", options: ENTRADA_CATEGORIES }]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFF] border-b border-[#E2E8F0]/80">
                {["Data", "Descrição", "Categoria", "Responsável", "Valor", "Cadastrado por"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#94A3B8]">
                    Nenhum lançamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFF] transition-colors group">
                    <td className="px-5 py-3.5 text-sm text-[#64748B] whitespace-nowrap" style={{ fontFamily: "DM Mono, monospace" }}>
                      {formatDate(item.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#0F172A]">{item.desc}</p>
                      {item.notes && <p className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[200px]">{item.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ResponsibleBadge name={item.responsible} />
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#10B981] whitespace-nowrap" style={{ fontFamily: "DM Mono, monospace" }}>
                      +{formatBRL(item.value)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <RegisteredByChip name={item.registeredBy} />
                        <span className="text-xs text-[#94A3B8]">{item.registeredBy}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Nova Entrada
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Registre uma nova receita do casal</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl bg-[#F8FAFF] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <InputField label="Descrição *">
                <input className={inputCls} placeholder="Ex.: Salário, Freelance, Dividendos..." value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />
              </InputField>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Valor *">
                  <input className={inputCls} type="number" placeholder="0,00" min="0" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
                </InputField>
                <InputField label="Data *">
                  <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </InputField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Categoria *">
                  <SelectField value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={ENTRADA_CATEGORIES} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Responsável *">
                  <SelectField value={form.responsible} onChange={(v) => setForm((f) => ({ ...f, responsible: v as Responsible }))} options={RESPONSIBLES} placeholder="Selecionar..." />
                </InputField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Conta *">
                  <SelectField value={form.account} onChange={(v) => setForm((f) => ({ ...f, account: v }))} options={ACCOUNTS} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Cadastrado por">
                  <input className={`${inputCls} bg-[#F1F5F9] cursor-not-allowed text-[#64748B]`} value={LOGGED_IN_USER} readOnly />
                </InputField>
              </div>

              <InputField label="Observação">
                <textarea
                  className="w-full h-20 px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-[#CBD5E1] resize-none"
                  placeholder="Informações adicionais..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </InputField>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#E2E8F0]/80 bg-[#F8FAFF] rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="h-9 px-5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="h-9 px-5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-all shadow-md shadow-[#2563EB]/20 active:scale-[0.98]">
                Salvar entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Saídas Content ───────────────────────────────────────────────────────────

function SaidasContent() {
  const [items, setItems] = useState<SaidaItem[]>(initialSaidas);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    desc: "", value: "", date: "", category: "", responsible: "" as Responsible | "",
    paymentMethod: "", expenseType: "" as ExpenseType | "", notes: "",
  });

  const setFilter = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.responsible && item.responsible !== filters.responsible) return false;
      if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
      return true;
    });
  }, [items, filters]);

  const totalGasto = items.reduce((s, i) => s + i.value, 0);
  const totalFixo = items.filter((i) => i.expenseType === "fixo").reduce((s, i) => s + i.value, 0);
  const totalVariavel = items.filter((i) => i.expenseType === "variavel").reduce((s, i) => s + i.value, 0);
  const mediaDiaria = totalGasto / 30;

  const handleSubmit = () => {
    if (!form.desc || !form.value || !form.date || !form.category || !form.responsible || !form.paymentMethod || !form.expenseType) return;
    const newItem: SaidaItem = {
      id: Date.now(),
      desc: form.desc,
      value: parseFloat(form.value),
      date: form.date,
      category: form.category,
      responsible: form.responsible as Responsible,
      paymentMethod: form.paymentMethod,
      expenseType: form.expenseType as ExpenseType,
      registeredBy: LOGGED_IN_USER,
      notes: form.notes || undefined,
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ desc: "", value: "", date: "", category: "", responsible: "", paymentMethod: "", expenseType: "", notes: "" });
    setModalOpen(false);
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" }}>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Gasto" value={formatBRL(totalGasto)} sub="Junho 2025" icon={ArrowUpRight} iconColor="text-[#F43F5E]" iconBg="bg-[#FFF1F3]" badge="+8,5%" badgeColor="#F43F5E" />
        <StatCard label="Gastos Fixos" value={formatBRL(totalFixo)} sub="Recorrentes mensais" icon={Wallet} iconColor="text-[#2563EB]" iconBg="bg-[#EFF6FF]" badge={`${Math.round((totalFixo / totalGasto) * 100)}%`} badgeColor="#2563EB" />
        <StatCard label="Gastos Variáveis" value={formatBRL(totalVariavel)} sub="Despesas avulsas" icon={CreditCard} iconColor="text-[#8B5CF6]" iconBg="bg-[#F5F3FF]" badge={`${Math.round((totalVariavel / totalGasto) * 100)}%`} badgeColor="#8B5CF6" />
        <StatCard label="Média Diária" value={formatBRL(mediaDiaria)} sub="Gasto médio por dia" icon={PiggyBank} iconColor="text-[#F59E0B]" iconBg="bg-[#FFFBEB]" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Fixos x Variáveis</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <span className="w-3 h-2.5 rounded-sm inline-block bg-[#2563EB]" />Fixos
              </span>
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <span className="w-3 h-2.5 rounded-sm inline-block bg-[#F43F5E]" />Variáveis
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={saidasChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={46} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFF" }} />
              <Bar dataKey="fixo" name="Fixos" stackId="b" fill="#2563EB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="variavel" name="Variáveis" stackId="b" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 flex flex-col">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">Por Categoria</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Junho 2025</p>
          </div>
          <div className="flex-1 space-y-2.5 mt-2">
            {saidasCategoryData.map((cat) => {
              const pct = Math.round((cat.value / totalGasto) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-[#64748B]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>{formatBRL(cat.value)}</span>
                      <span className="text-[10px] text-[#94A3B8] w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0]/80 overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0]/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Lançamentos — Saídas</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">{filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#F43F5E] text-white text-sm font-semibold hover:bg-[#E11D48] active:scale-[0.98] transition-all shadow-md shadow-[#F43F5E]/25"
            >
              <PlusCircle className="w-4 h-4" />
              Nova saída
            </button>
          </div>
          <FiltersBar
            filters={filters}
            onFilter={setFilter}
            extraFilters={[
              { key: "category", label: "Categoria", options: SAIDA_CATEGORIES },
              { key: "paymentMethod", label: "Forma de Pagamento", options: PAYMENT_METHODS },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFF] border-b border-[#E2E8F0]/80">
                {["Data", "Descrição", "Categoria", "Tipo", "Responsável", "Pagamento", "Valor", "Por"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#94A3B8]">
                    Nenhum lançamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-4 py-3.5 text-sm text-[#64748B] whitespace-nowrap" style={{ fontFamily: "DM Mono, monospace" }}>
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-[#0F172A]">{item.desc}</p>
                      {item.notes && <p className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[180px]">{item.notes}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFF1F3] text-[#F43F5E]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${item.expenseType === "fixo" ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F5F3FF] text-[#8B5CF6]"}`}>
                        {item.expenseType === "fixo" ? "Fixo" : "Variável"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ResponsibleBadge name={item.responsible} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#64748B] whitespace-nowrap">{item.paymentMethod}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-[#F43F5E] whitespace-nowrap" style={{ fontFamily: "DM Mono, monospace" }}>
                      -{formatBRL(item.value)}
                    </td>
                    <td className="px-4 py-3.5">
                      <RegisteredByChip name={item.registeredBy} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Nova Saída
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Registre uma nova despesa do casal</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl bg-[#F8FAFF] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <InputField label="Descrição *">
                <input className={inputCls} placeholder="Ex.: Aluguel, Supermercado, Conta de luz..." value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />
              </InputField>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Valor *">
                  <input className={inputCls} type="number" placeholder="0,00" min="0" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
                </InputField>
                <InputField label="Data *">
                  <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </InputField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Categoria *">
                  <SelectField value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={SAIDA_CATEGORIES} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Responsável *">
                  <SelectField value={form.responsible} onChange={(v) => setForm((f) => ({ ...f, responsible: v as Responsible }))} options={RESPONSIBLES} placeholder="Selecionar..." />
                </InputField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Forma de Pagamento *">
                  <SelectField value={form.paymentMethod} onChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))} options={PAYMENT_METHODS} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Tipo de Gasto *">
                  <SelectField value={form.expenseType} onChange={(v) => setForm((f) => ({ ...f, expenseType: v as ExpenseType }))} options={["fixo", "variavel"]} placeholder="Selecionar..." />
                </InputField>
              </div>

              <InputField label="Cadastrado por">
                <input className={`${inputCls} bg-[#F1F5F9] cursor-not-allowed text-[#64748B]`} value={LOGGED_IN_USER} readOnly />
              </InputField>

              <InputField label="Observação">
                <textarea
                  className="w-full h-20 px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-[#CBD5E1] resize-none"
                  placeholder="Informações adicionais..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </InputField>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#E2E8F0]/80 bg-[#F8FAFF] rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="h-9 px-5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="h-9 px-5 rounded-xl bg-[#F43F5E] text-white text-sm font-semibold hover:bg-[#E11D48] transition-all shadow-md shadow-[#F43F5E]/20 active:scale-[0.98]">
                Salvar saída
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Renda Extra Content ──────────────────────────────────────────────────────

const STATUS_ORDER: JobStatus[] = ["Em andamento", "A receber", "Em negociação", "Recebido", "Cancelado"];

function RendaExtraContent() {
  const [items, setItems] = useState<RendaExtraItem[]>(initialRendaExtra);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterResponsible, setFilterResponsible] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [form, setForm] = useState({
    name: "", client: "", value: "", category: "", date: "", paymentDate: "",
    status: "" as JobStatus | "", responsible: "" as Responsible | "", notes: "",
  });

  const activeItems = items.filter((i) => i.status !== "Cancelado");
  const totalRecebido = items.filter((i) => i.status === "Recebido").reduce((s, i) => s + i.value, 0);
  const totalAReceber = items.filter((i) => i.status === "A receber").reduce((s, i) => s + i.value, 0);
  const totalPrevisto = activeItems.reduce((s, i) => s + i.value, 0);
  const totalTrabalhos = activeItems.length;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterResponsible && item.responsible !== filterResponsible) return false;
      if (filterCategory && item.category !== filterCategory) return false;
      return true;
    }).sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
  }, [items, filterStatus, filterResponsible, filterCategory]);

  const handleSubmit = () => {
    if (!form.name || !form.client || !form.value || !form.category || !form.date || !form.paymentDate || !form.status || !form.responsible) return;
    const newItem: RendaExtraItem = {
      id: Date.now(),
      name: form.name,
      client: form.client,
      value: parseFloat(form.value),
      category: form.category,
      date: form.date,
      paymentDate: form.paymentDate,
      status: form.status as JobStatus,
      responsible: form.responsible as Responsible,
      registeredBy: LOGGED_IN_USER,
      notes: form.notes || undefined,
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ name: "", client: "", value: "", category: "", date: "", paymentDate: "", status: "", responsible: "", notes: "" });
    setModalOpen(false);
  };

  const clearFilters = () => { setFilterStatus(""); setFilterResponsible(""); setFilterCategory(""); };
  const hasFilters = filterStatus || filterResponsible || filterCategory;

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" }}>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="Renda Recebida" value={formatBRL(totalRecebido)} sub="Trabalhos concluídos" icon={Briefcase} iconColor="text-[#10B981]" iconBg="bg-[#ECFDF5]" badge="+22%" badgeColor="#10B981" />
        <StatCard label="A Receber" value={formatBRL(totalAReceber)} sub="Aguardando pagamento" icon={CalendarClock} iconColor="text-[#D97706]" iconBg="bg-[#FFFBEB]" badge={`${items.filter((i) => i.status === "A receber").length} trabalhos`} badgeColor="#D97706" />
        <StatCard label="Total Previsto" value={formatBRL(totalPrevisto)} sub="Todos os trabalhos ativos" icon={TrendingUp} iconColor="text-[#2563EB]" iconBg="bg-[#EFF6FF]" />
        <StatCard label="Trabalhos Ativos" value={String(totalTrabalhos)} sub="Em aberto ou concluídos" icon={Wallet} iconColor="text-[#8B5CF6]" iconBg="bg-[#F5F3FF]" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">Evolução Mensal — Renda Extra</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Últimos 6 meses + previsão de junho</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#64748B]"><span className="w-3 h-2.5 rounded-sm inline-block bg-[#10B981]" />Recebido</span>
            <span className="flex items-center gap-1.5 text-[#64748B]"><span className="w-3 h-2.5 rounded-sm inline-block bg-[#10B981]/30 border border-[#10B981]/40" />Previsto</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={rendaExtraChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={46} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFF" }} />
            <Bar dataKey="recebido" name="Recebido" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previsto" name="Previsto" fill="#10B981" fillOpacity={0.25} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters + cards */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#64748B]">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-semibold">Filtros:</span>
          </div>
          {[
            { value: filterStatus, setter: setFilterStatus, placeholder: "Status", options: JOB_STATUSES as unknown as string[] },
            { value: filterCategory, setter: setFilterCategory, placeholder: "Categoria", options: RENDA_EXTRA_CATEGORIES },
            { value: filterResponsible, setter: setFilterResponsible, placeholder: "Responsável", options: RESPONSIBLES },
          ].map((f) => (
            <div key={f.placeholder} className="relative">
              <select className="h-8 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer" value={f.value} onChange={(e) => f.setter(e.target.value)}>
                <option value="">{f.placeholder}</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
            </div>
          ))}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium text-[#F43F5E] bg-[#FFF1F3] hover:bg-[#FFE4E8] transition-colors">
              <X className="w-3 h-3" />Limpar
            </button>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] active:scale-[0.98] transition-all shadow-md shadow-[#10B981]/25"
        >
          <PlusCircle className="w-4 h-4" />
          Novo trabalho
        </button>
      </div>

      <p className="text-xs text-[#94A3B8] mb-3">{filtered.length} trabalho{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#E2E8F0]/80 overflow-hidden hover:shadow-lg hover:shadow-black/[0.06] transition-all duration-200 group">
            {/* Status accent bar */}
            <div className="h-1" style={{ backgroundColor: {
              "Em negociação": "#8B5CF6",
              "Em andamento": "#2563EB",
              "A receber": "#F59E0B",
              "Recebido": "#10B981",
              "Cancelado": "#F43F5E",
            }[item.status] }} />

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={item.status} />
                <ResponsibleBadge name={item.responsible} />
              </div>

              <h4 className="text-sm font-bold text-[#0F172A] mb-1 leading-snug">{item.name}</h4>
              <p className="text-xs text-[#64748B] mb-3 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                {item.client}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#F8FAFF] border border-[#E2E8F0] text-[10px] font-semibold text-[#64748B]">
                  {item.category}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-[#94A3B8] mb-0.5">Valor</p>
                  <p className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>
                    {formatBRL(item.value)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#94A3B8] mb-0.5 flex items-center justify-end gap-1">
                    <CalendarDays className="w-3 h-3" />Previsão
                  </p>
                  <p className="text-xs font-semibold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>
                    {formatDate(item.paymentDate)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <RegisteredByChip name={item.registeredBy} />
                  <span className="text-[11px] text-[#94A3B8]">{formatDate(item.date)}</span>
                </div>
                {item.notes && (
                  <span className="text-[10px] text-[#94A3B8] bg-[#F8FAFF] px-2 py-0.5 rounded-lg truncate max-w-[120px]" title={item.notes}>
                    {item.notes}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F8FAFF] flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7 text-[#CBD5E1]" />
            </div>
            <p className="text-sm font-medium text-[#64748B]">Nenhum trabalho encontrado</p>
            <p className="text-xs text-[#94A3B8] mt-1">Ajuste os filtros ou cadastre um novo trabalho</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[92vh] overflow-y-auto" style={{ scrollbarWidth: "none" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]" style={{ fontFamily: "Outfit, sans-serif" }}>Novo Trabalho</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Registre um novo trabalho de renda extra</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl bg-[#F8FAFF] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField label="Nome do Trabalho *">
                    <input className={inputCls} placeholder="Ex.: Identidade Visual, Site Institucional..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </InputField>
                </div>
                <InputField label="Cliente *">
                  <input className={inputCls} placeholder="Nome do cliente ou empresa" value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} />
                </InputField>
                <InputField label="Valor *">
                  <input className={inputCls} type="number" placeholder="0,00" min="0" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
                </InputField>
                <InputField label="Categoria *">
                  <SelectField value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={RENDA_EXTRA_CATEGORIES} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Status *">
                  <SelectField value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v as JobStatus }))} options={[...JOB_STATUSES]} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Data de início *">
                  <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </InputField>
                <InputField label="Previsão de pagamento *">
                  <input className={inputCls} type="date" value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} />
                </InputField>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <InputField label="Responsável *">
                    <SelectField value={form.responsible} onChange={(v) => setForm((f) => ({ ...f, responsible: v as Responsible }))} options={RESPONSIBLES} placeholder="Selecionar..." />
                  </InputField>
                  <InputField label="Cadastrado por">
                    <input className={`${inputCls} bg-[#F1F5F9] cursor-not-allowed text-[#64748B]`} value={LOGGED_IN_USER} readOnly />
                  </InputField>
                </div>
                <div className="col-span-2">
                  <InputField label="Observação">
                    <textarea className="w-full h-20 px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-[#CBD5E1] resize-none" placeholder="Detalhes, escopo, observações..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                  </InputField>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#E2E8F0]/80 bg-[#F8FAFF] rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="h-9 px-5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="h-9 px-5 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] transition-all shadow-md shadow-[#10B981]/20 active:scale-[0.98]">Salvar trabalho</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Categorias Content ───────────────────────────────────────────────────────

const CATEGORY_TYPE_COLORS: Record<CategoryType, { bg: string; text: string }> = {
  "Entrada":     { bg: "#ECFDF5", text: "#059669" },
  "Saída":       { bg: "#FFF1F3", text: "#E11D48" },
  "Renda Extra": { bg: "#EFF6FF", text: "#2563EB" },
  "Investimento":{ bg: "#F5F3FF", text: "#8B5CF6" },
  "Geral":       { bg: "#F8FAFF", text: "#64748B" },
};

function CategoriasContent() {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryItem | null>(null);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ name: "", type: "" as CategoryType | "", icon: "🏠", color: "#2563EB" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      if (filterType && c.type !== filterType) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [categories, filterType, searchQuery]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", type: "", icon: "🏠", color: "#2563EB" });
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditItem(cat);
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color });
    setModalOpen(true);
  };

  const handleToggle = (id: number) =>
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));

  const handleDelete = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  };

  const handleSubmit = () => {
    if (!form.name || !form.type) return;
    if (editItem) {
      setCategories((prev) => prev.map((c) => c.id === editItem.id ? { ...c, ...form, type: form.type as CategoryType } : c));
    } else {
      setCategories((prev) => [...prev, { id: Date.now(), name: form.name, type: form.type as CategoryType, icon: form.icon, color: form.color, active: true, count: 0 }]);
    }
    setModalOpen(false);
  };

  const activeCount = categories.filter((c) => c.active).length;

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" }}>
      {/* Summary row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Categorias", value: categories.length, icon: Tag, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Ativas", value: activeCount, icon: PlusCircle, color: "#10B981", bg: "#ECFDF5" },
          { label: "Inativas", value: categories.length - activeCount, icon: Settings, color: "#94A3B8", bg: "#F8FAFF" },
          { label: "Com lançamentos", value: categories.filter((c) => c.count > 0).length, icon: BarChart2, color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80">
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center`} style={{ backgroundColor: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-[#64748B] text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CBD5E1]" />
            <input
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select className="h-9 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none appearance-none cursor-pointer" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos os tipos</option>
              {CATEGORY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] active:scale-[0.98] transition-all shadow-md shadow-[#2563EB]/25">
          <PlusCircle className="w-4 h-4" />
          Nova categoria
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const typeCfg = CATEGORY_TYPE_COLORS[cat.type];
          return (
            <div key={cat.id} className={`bg-white rounded-2xl border border-[#E2E8F0]/80 p-5 flex items-start gap-4 hover:shadow-md hover:shadow-black/[0.04] transition-all duration-200 ${!cat.active ? "opacity-50" : ""}`}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: cat.color + "18", border: `1.5px solid ${cat.color}30` }}>
                {cat.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-[#0F172A] truncate">{cat.name}</h4>
                  {!cat.active && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#94A3B8]">inativa</span>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: typeCfg.bg, color: typeCfg.text }}>
                    {cat.type}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">{cat.count} lançamento{cat.count !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] text-[#94A3B8] font-mono">{cat.color}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(cat.id)}
                  className="transition-colors"
                  title={cat.active ? "Desativar" : "Ativar"}
                >
                  {cat.active
                    ? <ToggleRight className="w-6 h-6 text-[#10B981]" />
                    : <ToggleLeft className="w-6 h-6 text-[#CBD5E1]" />}
                </button>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#2563EB]" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(cat.id)}
                    className="w-7 h-7 rounded-lg bg-[#FFF1F3] flex items-center justify-center hover:bg-[#FFE4E8] transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#F43F5E]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F8FAFF] flex items-center justify-center mx-auto mb-3">
              <Tag className="w-7 h-7 text-[#CBD5E1]" />
            </div>
            <p className="text-sm font-medium text-[#64748B]">Nenhuma categoria encontrada</p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F3] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#F43F5E]" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] text-center mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Excluir categoria?</h3>
            <p className="text-sm text-[#64748B] text-center mb-5">Esta ação não pode ser desfeita. A categoria será removida permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 h-10 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 h-10 rounded-xl bg-[#F43F5E] text-white text-sm font-semibold hover:bg-[#E11D48] transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "none" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {editItem ? "Editar Categoria" : "Nova Categoria"}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Personalize as categorias do casal</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl bg-[#F8FAFF] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField label="Nome *">
                    <input className={inputCls} placeholder="Ex.: Moradia, Salário, Lazer..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </InputField>
                </div>
                <div className="col-span-2">
                  <InputField label="Tipo *">
                    <SelectField value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v as CategoryType }))} options={[...CATEGORY_TYPES]} placeholder="Selecionar tipo..." />
                  </InputField>
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Ícone</label>
                <div className="grid grid-cols-10 gap-1.5">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition-all ${form.icon === icon ? "bg-[#EFF6FF] ring-2 ring-[#2563EB]" : "bg-[#F8FAFF] hover:bg-[#F1F5F9]"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={`w-8 h-8 rounded-xl transition-all ${form.color === color ? "ring-2 ring-offset-2 ring-[#0F172A] scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0]">
                <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">Pré-visualização</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: form.color + "18", border: `1.5px solid ${form.color}30` }}>
                    {form.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{form.name || "Nome da categoria"}</p>
                    {form.type && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: CATEGORY_TYPE_COLORS[form.type as CategoryType]?.bg, color: CATEGORY_TYPE_COLORS[form.type as CategoryType]?.text }}>
                        {form.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#E2E8F0]/80 bg-[#F8FAFF] rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="h-9 px-5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="h-9 px-5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-all shadow-md shadow-[#2563EB]/20 active:scale-[0.98]">
                {editItem ? "Salvar alterações" : "Criar categoria"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Contas Content ───────────────────────────────────────────────────────────

const ACCOUNT_TYPE_CFG: Record<string, { icon: React.ElementType; bg: string }> = {
  "Conta Corrente":      { icon: CreditCard,  bg: "#EFF6FF" },
  "Conta Conjunta":      { icon: Users,        bg: "#F5F3FF" },
  "Poupança":            { icon: PiggyBank,    bg: "#ECFDF5" },
  "Carteira":            { icon: Banknote,     bg: "#FFFBEB" },
  "Reserva de Emergência": { icon: Wallet,     bg: "#FFF7ED" },
  "Investimentos":       { icon: TrendingUp,   bg: "#F0FDF4" },
  "Cartão de Crédito":   { icon: CreditCard,   bg: "#FFF1F3" },
};

function ContasContent() {
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", institution: "", type: "", balance: "", responsible: "" as Responsible | "", color: "#2563EB",
  });

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const handleSubmit = () => {
    if (!form.name || !form.type || !form.balance || !form.responsible) return;
    const newAccount: AccountItem = {
      id: Date.now(),
      name: form.name,
      institution: form.institution,
      type: form.type,
      balance: parseFloat(form.balance),
      responsible: form.responsible as Responsible,
      color: form.color,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setForm({ name: "", institution: "", type: "", balance: "", responsible: "", color: "#2563EB" });
    setModalOpen(false);
  };

  const byResponsible = {
    "Casal": accounts.filter((a) => a.responsible === "Casal").reduce((s, a) => s + a.balance, 0),
    "Ana Lima": accounts.filter((a) => a.responsible === "Ana Lima").reduce((s, a) => s + a.balance, 0),
    "Pedro Alves": accounts.filter((a) => a.responsible === "Pedro Alves").reduce((s, a) => s + a.balance, 0),
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" }}>
      {/* Consolidated balance card */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#2563EB]/10" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full bg-[#F43F5E]/5" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/50 text-xs font-medium mb-1">Patrimônio Total Consolidado</p>
              <p className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "DM Mono, monospace" }}>
                {formatBRL(totalBalance)}
              </p>
              <p className="text-white/40 text-xs mt-2">{accounts.length} contas ativas · Junho 2025</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Nova conta
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Casal", value: byResponsible["Casal"], color: "#8B5CF6" },
              { label: "Ana Lima", value: byResponsible["Ana Lima"], color: "#2563EB" },
              { label: "Pedro Alves", value: byResponsible["Pedro Alves"], color: "#F43F5E" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] font-medium text-white/50">{s.label}</span>
                </div>
                <p className="text-base font-bold text-white" style={{ fontFamily: "DM Mono, monospace" }}>
                  {formatBRL(s.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const typeCfg = ACCOUNT_TYPE_CFG[account.type] ?? { icon: Landmark, bg: "#F8FAFF" };
          const AccountIcon = typeCfg.icon;
          const pct = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
          return (
            <div key={account.id} className="bg-white rounded-2xl border border-[#E2E8F0]/80 overflow-hidden hover:shadow-lg hover:shadow-black/[0.06] transition-all duration-200">
              {/* Top accent */}
              <div className="h-1.5" style={{ backgroundColor: account.color }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: typeCfg.bg }}>
                      <AccountIcon className="w-5 h-5" style={{ color: account.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] font-medium leading-none mb-1">{account.institution || account.type}</p>
                      <p className="text-sm font-bold text-[#0F172A] leading-none">{account.name}</p>
                    </div>
                  </div>
                  <ResponsibleBadge name={account.responsible} />
                </div>

                <div className="mb-4">
                  <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide mb-1">Saldo atual</p>
                  <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "DM Mono, monospace" }}>
                    {formatBRL(account.balance)}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-[#94A3B8]">% do patrimônio total</span>
                    <span className="text-[10px] font-semibold text-[#64748B]">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: account.color }} />
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#F8FAFF] border border-[#E2E8F0] text-[10px] font-semibold text-[#64748B]">
                    {account.type}
                  </span>
                  <div className="flex gap-1.5">
                    <button className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center hover:bg-[#DBEAFE] transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-[#2563EB]" />
                    </button>
                    <button
                      onClick={() => setAccounts((prev) => prev.filter((a) => a.id !== account.id))}
                      className="w-7 h-7 rounded-lg bg-[#FFF1F3] flex items-center justify-center hover:bg-[#FFE4E8] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#F43F5E]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "none" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]" style={{ fontFamily: "Outfit, sans-serif" }}>Nova Conta</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Cadastre uma conta ou carteira do casal</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl bg-[#F8FAFF] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <InputField label="Nome da conta *">
                <input className={inputCls} placeholder="Ex.: Conta Corrente Principal, Poupança..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </InputField>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Tipo de conta *">
                  <SelectField value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={ACCOUNT_TYPES_LIST} placeholder="Selecionar..." />
                </InputField>
                <InputField label="Instituição">
                  <input className={inputCls} placeholder="Ex.: Nubank, Itaú..." value={form.institution} onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))} />
                </InputField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Saldo atual *">
                  <input className={inputCls} type="number" placeholder="0,00" min="0" step="0.01" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} />
                </InputField>
                <InputField label="Responsável *">
                  <SelectField value={form.responsible} onChange={(v) => setForm((f) => ({ ...f, responsible: v as Responsible }))} options={RESPONSIBLES} placeholder="Selecionar..." />
                </InputField>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Cor de identificação</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setForm((f) => ({ ...f, color }))} className={`w-8 h-8 rounded-xl transition-all ${form.color === color ? "ring-2 ring-offset-2 ring-[#0F172A] scale-110" : "hover:scale-105"}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#E2E8F0]/80 bg-[#F8FAFF] rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="h-9 px-5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="h-9 px-5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-all shadow-md shadow-[#2563EB]/20 active:scale-[0.98]">Salvar conta</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Main App (after login) ───────────────────────────────────────────────────

const NAV_META: Record<NavId, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Junho 2025 — Resumo financeiro do casal" },
  entradas: { title: "Entradas", subtitle: "Junho 2025 — Receitas do casal" },
  saidas: { title: "Saídas", subtitle: "Junho 2025 — Despesas do casal" },
  "renda-extra": { title: "Renda Extra", subtitle: "Junho 2025 — Receitas adicionais" },
  contas: { title: "Contas", subtitle: "Gestão de contas bancárias" },
  categorias: { title: "Categorias", subtitle: "Organização de categorias" },
  metas: { title: "Metas", subtitle: "Objetivos financeiros do casal" },
  investimentos: { title: "Investimentos", subtitle: "Carteira de investimentos" },
  casamento: { title: "Casamento", subtitle: "Planejamento financeiro do casamento" },
  relatorios: { title: "Relatórios", subtitle: "Análises e relatórios detalhados" },
  configuracoes: { title: "Configurações", subtitle: "Configurações da conta do casal" },
};

function PlaceholderContent({ nav }: { nav: NavId }) {
  const meta = NAV_META[nav];
  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 flex items-center justify-center" style={{ scrollbarWidth: "none" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          {meta.title}
        </h2>
        <p className="text-sm text-[#94A3B8]">Esta seção está em desenvolvimento.</p>
      </div>
    </main>
  );
}

function MainApp({ onLogout }: { onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const meta = NAV_META[activeNav];

  const renderContent = () => {
    if (activeNav === "dashboard") return <DashboardContent />;
    if (activeNav === "entradas") return <EntradasContent />;
    if (activeNav === "saidas") return <SaidasContent />;
    if (activeNav === "renda-extra") return <RendaExtraContent />;
    if (activeNav === "categorias") return <CategoriasContent />;
    if (activeNav === "contas") return <ContasContent />;
    return <PlaceholderContent nav={activeNav} />;
  };

  return (
    <div className="h-screen flex bg-[#F8FAFF] overflow-hidden" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header title={meta.title} subtitle={meta.subtitle} />
        {renderContent()}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return loggedIn
    ? <MainApp onLogout={handleLogout} />
    : <LoginPage onLogin={() => setLoggedIn(true)} />;
}
