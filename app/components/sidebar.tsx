import Link from 'next/link';
import { signOut } from '../actions/auth';
import {
  LayoutDashboard,
  Calendar,
  User,
  Users,
  Package,
  Receipt,
  Settings,
  HelpCircle,
  LogOut,
  UserCircle,
  Stethoscope,
  BookOpen,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import { getCurrentUser, getUserRole } from '@/utils/supabase/helpers';

const menuItems = [
  { label: 'Panel de Control', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Citas', icon: Calendar, href: '/dashboard/citas' },
  { label: 'Pacientes', icon: User, href: '/dashboard/pacientes' },
  { label: 'Odontólogos', icon: Stethoscope, href: '/dashboard/odontologos' },
  {
    label: 'Especialidades',
    icon: BookOpen,
    href: '/dashboard/especialidades',
  },
  { label: 'Jornadas', icon: Clock, href: '/dashboard/jornadas' },
  { label: 'Personal', icon: Users, href: '/dashboard/personal' },
  { label: 'Inventario', icon: Package, href: '/dashboard/inventario' },
  { label: 'Facturación', icon: Receipt, href: '/dashboard/facturacion' },
];

const roleMenu: Record<string, string[]> = {
    admin: ["Panel de Control", "Citas", "Pacientes", "Odontólogos", "Especialidades", "Jornadas", "Personal", "Inventario", "Facturación"],
    recepcionista: ["Panel de Control", "Citas", "Pacientes", "Odontólogos", "Personal", "Facturación", "Inventario"],
    doctor: ["Panel de Control", "Citas", "Pacientes"],
    paciente: ["Panel de Control", "Citas"],
};

export default async function Sidebar({ activePath }: { activePath: string }) {
  const user = await getCurrentUser();
  const rol = (await getUserRole()) ?? 'paciente';
  const visibleLabels = roleMenu[rol] ?? [];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-clinica-dark flex items-center justify-center">
          <Image
            src="/diente-icon.png"
            alt="Icono de diente"
            width={20}
            height={20}
          />
        </div>
        <div>
          <p className="font-sans font-bold text-clinica-dark leading-tight">
            ClinicaDental
          </p>
          <p className="text-xs text-gray-400">Cuidado Dental</p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {menuItems
          .filter((item) => visibleLabels.includes(item.label))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans font-medium mb-1 ${
                  isActive
                    ? 'bg-blue-50 text-clinica-dark'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="px-3 pb-6 border-t border-gray-100 pt-3">
        <Link
          href="/dashboard/perfil"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 font-sans font-medium hover:bg-gray-100 mb-1"
        >
          <UserCircle size={20} />
          Mi Perfil
        </Link>
        {rol === 'admin' && (
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 font-sans font-medium hover:bg-gray-100 mb-1"
          >
            <Settings size={20} />
            Configuración
          </Link>
        )}
        <Link
          href="/dashboard/soporte"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 font-sans font-medium hover:bg-gray-100"
        >
          <HelpCircle size={20} />
          Soporte
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 font-sans font-medium hover:bg-red-50"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
