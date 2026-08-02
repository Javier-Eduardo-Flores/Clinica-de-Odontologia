import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/supabase/helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/sidebar';
import {
  Phone,
  Mail,
  Clock,
  HelpCircle,
  ChevronDown,
  BookOpen,
  MessageCircleQuestion,
  Calendar,
} from 'lucide-react';

const categorias: {
  titulo: string;
  icono: typeof HelpCircle;
  roles: string[];
  preguntas: { p: string; r: string; roles?: string[] }[];
}[] = [
  {
    titulo: "Cuenta y Acceso",
    icono: HelpCircle,
    roles: ["admin", "recepcionista", "doctor"],
    preguntas: [
      {
        p: '¿Cómo inicio sesión?',
        r: 'Entra a la página principal, haz clic en «Iniciar Sesión» e ingresa tu correo electrónico y contraseña. Si es tu primera vez, el administrador de la clínica te habrá creado una cuenta.',
      },
      {
        p: 'Olvidé mi contraseña, ¿qué hago?',
        r: 'En la pantalla de inicio de sesión pulsa «¿Olvidaste tu contraseña?», escribe tu correo y sigue el enlace que recibirás para crear una nueva.',
      },
      {
        p: '¿Cómo actualizo mis datos personales?',
        r: 'Entra a «Mi Perfil» desde el menú lateral. Ahí puedes editar tu nombre, teléfono y demás información personal.',
      },
      {
        p: '¿Qué rol tengo y qué puedo hacer?',
        r: 'Tu rol (Administrador, Recepcionista o Doctor) determina qué módulos ves en el menú. Si crees que tu rol está mal asignado, contacta al administrador de la clínica.',
      },
    ],
  },
  {
    titulo: 'Citas',
    icono: Calendar,
    roles: ['admin', 'recepcionista', 'doctor'],
    preguntas: [
      {
        p: '¿Cómo agendo una cita?',
        r: 'Ve al módulo «Citas» y pulsa «Nueva Cita» o «Agendar». Selecciona el paciente, el odontólogo, la fecha y la hora disponible, luego guarda.',
      },
      {
        p: '¿Puedo reprogramar o cancelar una cita?',
        r: 'Sí. Desde el listado de citas, usa las opciones «Editar» o «Eliminar» de cada cita para cambiar su fecha/hora o cancelarla.',
      },
      {
        p: '¿Qué hago si no aparece la hora que quiero?',
        r: 'Las horas disponibles dependen del horario del odontólogo y de las citas ya agendadas. Prueba con otra fecha o revisa el horario del doctor.',
      },
    ],
  },
  {
    titulo: 'Pacientes y Expedientes',
    icono: BookOpen,
    roles: ['admin', 'recepcionista', 'doctor'],
    preguntas: [
      {
        p: '¿Cómo registro un paciente nuevo?',
        r: 'Entra al módulo «Pacientes» y pulsa «Nuevo Paciente». Completa los datos obligatorios (nombre, identidad, fecha de nacimiento y teléfono) y guarda.',
        roles: ['admin', 'recepcionista'],
      },
      {
        p: '¿Cómo consulto el historial de un paciente?',
        r: 'Desde el listado de pacientes, abre el perfil del paciente y revisa su «Expediente» para ver sus consultas y tratamientos.',
        roles: ['admin', 'recepcionista', 'doctor'],
      },
      {
        p: '¿Cómo edito los datos de un paciente?',
        r: 'Abre el perfil del paciente y pulsa «Editar» para actualizar sus datos. La recepcionista y el administrador tienen este permiso.',
        roles: ['admin', 'recepcionista'],
      },
      {
        p: '¿Puedo eliminar un paciente?',
        r: 'Solo el administrador puede eliminar pacientes, y es una acción permanente. Si necesitas eliminar uno, contacta al administrador.',
        roles: ['admin'],
      },
    ],
  },
  {
    titulo: 'Inventario y Facturación',
    icono: MessageCircleQuestion,
    roles: ['admin'],
    preguntas: [
      {
        p: '¿Cómo agrego productos al inventario?',
        r: 'Ve al módulo «Inventario», pulsa el botón para agregar producto y completa nombre, categoría, precio, stock y unidad. También puedes ajustar el stock manualmente.',
      },
      {
        p: '¿Cómo emito una factura?',
        r: 'Entra al módulo «Facturación» y pulsa «Nueva Factura». Selecciona el paciente, agrega los servicios o productos y aplica descuentos si corresponde.',
      },
      {
        p: '¿Qué descuentos están activos?',
        r: 'El administrador gestiona los descuentos y métodos de pago en «Configuración». Durante la facturación solo verás los que estén activos.',
      },
    ],
  },
];

const consejosPorRol: Record<string, { titulo: string; items: string[] }> = {
  admin: {
    titulo: 'Consejos para Administradores',
    items: [
      'Gestiona descuentos, métodos de pago y el personal desde el módulo «Configuración» y «Personal».',
      'Los doctores se asignan a especialidades y jornadas desde sus perfiles.',
      'Revisa el inventario periódicamente para mantener el stock al día.',
    ],
  },
  recepcionista: {
    titulo: 'Consejos para Recepcionistas',
    items: [
      'Registra al paciente antes de agendar su primera cita para agilizar el proceso.',
      'Puedes crear citas y registrar pacientes desde tus módulos disponibles.',
    ],
  },
  doctor: {
    titulo: 'Consejos para Doctores',
    items: [
      'Consulta tus citas del día en el módulo «Citas» para organizar tu jornada.',
      'Accede al expediente de cada paciente para revisar su historial antes de atenderlo.',
    ],
  },
};

export default async function SoportePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const rol = await getUserRole();
  if (!rol || rol === 'paciente') redirect('/dashboard');
  const consejos = consejosPorRol[rol];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/soporte" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <span>&larr; Volver al Dashboard</span>
          </Link>
        </header>

        <main className="p-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle size={28} className="text-clinica-dark" />
            <h1 className="text-3xl font-sans font-bold text-gray-900">
              Centro de Soporte
            </h1>
          </div>
          <p className="text-gray-500 font-sans mb-8">
            Encuentra respuestas a las preguntas más frecuentes del sistema. Si
            no encuentras lo que buscas, contacta a tu administrador.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-3">
              <Phone size={20} className="text-clinica-dark mt-0.5" />
              <div>
                <p className="text-xs font-sans font-bold text-gray-400 uppercase">
                  Teléfono
                </p>
                <p className="font-sans text-gray-900">+504 9555-1669</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-3">
              <Mail size={20} className="text-clinica-dark mt-0.5" />
              <div>
                <p className="text-xs font-sans font-bold text-gray-400 uppercase">
                  Correo
                </p>
                <p className="font-sans text-gray-900">soporte@clinica.com</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-3">
              <Clock size={20} className="text-clinica-dark mt-0.5" />
              <div>
                <p className="text-xs font-sans font-bold text-gray-400 uppercase">
                  Horario
                </p>
                <p className="font-sans text-gray-900">
                  Lun a Vie, 8:00 - 17:00
                </p>
              </div>
            </div>
          </div>

          {consejos && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-10">
              <h2 className="font-sans font-bold text-clinica-dark mb-2">
                {consejos.titulo}
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {consejos.items.map((item) => (
                  <li key={item} className="text-sm font-sans text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="text-2xl font-sans font-bold text-gray-900 mb-6">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            {categorias
              .filter((categoria) => categoria.roles.includes(rol))
              .map((categoria) => (
              <section key={categoria.titulo}>
                <h3 className="flex items-center gap-2 font-sans font-bold text-gray-800 mb-3">
                  <categoria.icono size={18} className="text-clinica-dark" />
                  {categoria.titulo}
                </h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
                  {categoria.preguntas
                    .filter((pregunta) =>
                      (pregunta.roles ?? categoria.roles).includes(rol)
                    )
                    .map((pregunta) => (
                    <details key={pregunta.p} className="group px-6 py-4">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <span className="font-sans font-semibold text-gray-900">
                          {pregunta.p}
                        </span>
                        <ChevronDown
                          size={18}
                          className="text-gray-400 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <p className="mt-3 text-sm font-sans text-gray-600">
                        {pregunta.r}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
