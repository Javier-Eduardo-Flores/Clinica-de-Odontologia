import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import TratamientosGrid from '@/app/components/landing/TratamientosGrid';
import EspecialidadesGrid from '@/app/components/landing/EspecialidadesGrid';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import {
  IconoDiente,
  IconoBotiquin,
  IconoDoctor,
  IconoCepillo,
  IconoDienteProtegido,
  IconoSonrisa,
} from '@/app/components/landing/iconosTratamiento';

const servicios = [
  {
    icon: IconoDiente,
    titulo: 'Odontología General',
    descripcion:
      'Diagnóstico, tratamientos y atención integral para mantener tu salud bucal en perfecto estado.',
  },
  {
    icon: IconoSonrisa,
    titulo: 'Estética Dental',
    descripcion:
      'Diseño de sonrisa, carillas y tratamientos para que luzcas una sonrisa perfecta.',
  },
  {
    icon: IconoDoctor,
    titulo: 'Ortodoncia',
    descripcion:
      'Alineación dental con brackets y técnicas modernas para corregir tu mordida.',
  },
  {
    icon: IconoBotiquin,
    titulo: 'Blanqueamiento',
    descripcion:
      'Aclara el tono de tus dientes y elimina manchas de forma segura y rápida.',
  },
  {
    icon: IconoCepillo,
    titulo: 'Prevención y Limpieza',
    descripcion:
      'Limpiezas profesionales y controles periódicos para evitar problemas futuros.',
  },
  {
    icon: IconoDienteProtegido,
    titulo: 'Citas y Control',
    descripcion:
      'Agenda tus consultas y da seguimiento a tu tratamiento desde donde estés.',
  },
];

const razones = [
  'Profesionales certificados con años de experiencia',
  'Equipo y tecnología de última generación',
  'Atención personalizada y trato humano',
  'Expediente y odontograma digital para cada paciente',
];

export default async function Home() {
  const supabase = await createClient();

  const { data: tratamientos } = await supabase
    .from('tratamiento')
    .select('id_tratamiento, nombre, descripcion')
    .order('nombre');

  const { data: especialidades } = await supabase
    .from('especialidad')
    .select('id_especialidad, nombre, descripcion')
    .order('nombre');

  return (
    <main className="bg-clinica-light font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-clinica-dark/95 backdrop-blur border-b border-clinica-medium">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/diente-icon.png"
              alt="Icono de diente"
              width={36}
              height={36}
            />
            <div className="leading-tight">
              <p className="font-bold text-clinica-light">ClinicaDental</p>
              <p className="text-[11px] text-clinica-light">Cuidado Dental</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
            <a
              href="#inicio"
              className="hover:text-white transition-colors hover:border-b-2"
            >
              Inicio
            </a>
            <a
              href="#servicios"
              className="hover:text-white transition-colors hover:border-b-2"
            >
              Servicios
            </a>
            <a
              href="#especialidades"
              className="hover:text-white transition-colors hover:border-b-2"
            >
              Especialidades
            </a>
            <a
              href="#nosotros"
              className="hover:text-white transition-colors hover:border-b-2"
            >
              Nosotros
            </a>
            <a
              href="#contacto"
              className="hover:text-white transition-colors hover:border-b-2"
            >
              Contacto
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-200 border border-gray-400/40 px-4 py-2 rounded-lg hover:bg-clinica-medium hover:text-white hover:shadow-[0_4px_16px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-clinica-dark bg-clinica-light px-4 py-2 rounded-lg hover:bg-white hover:shadow-[0_4px_16px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              Regístrate
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="inicio"
        className="relative overflow-hidden bg-clinica-dark text-clinica-light"
      >
        {/* Imagen de fondo (solo la imagen tiene opacidad) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/familia-sonriente.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.4,
          }}
        />
        {/* Difuminado de bordes para integrar la imagen con el fondo */}
        <div
          className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 140px 90px #0C2B4E' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-clinica-accent/40 text-blue-100 px-3 py-1 rounded-full mb-5">
              <ShieldCheck size={14} />
              Cuidado dental de confianza
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Tu sonrisa, nuestra{' '}
              <span className="text-clinica-accent">prioridad</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Brindamos atención odontológica integral y moderna para toda la
              familia. Agenda tu consulta y descubre una nueva forma de cuidar
              tu salud bucal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-clinica-accent px-6 py-3 rounded-lg font-semibold hover:bg-clinica-medium hover:shadow-[0_4px_16px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
              >
                Agenda tu cita
                <ChevronRight size={18} />
              </Link>
              <a
                href="#servicios"
                className="inline-flex items-center gap-2 border border-gray-400/40 px-6 py-3 rounded-lg font-semibold hover:bg-clinica-medium hover:shadow-[0_4px_16px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
              >
                Conoce nuestros servicios
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 border-t border-clinica-medium">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-300">+5</p>
              <p className="text-sm text-gray-300 mt-1">Años de experiencia</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-300">+500</p>
              <p className="text-sm text-gray-300 mt-1">Pacientes atendidos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-300">+10</p>
              <p className="text-sm text-gray-300 mt-1">Especialistas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-300">+15</p>
              <p className="text-sm text-gray-300 mt-1">Servicios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-clinica-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-clinica-accent uppercase tracking-wider mb-2">
              Nuestros servicios
            </p>
            <h2 className="text-3xl font-bold text-clinica-dark mb-3">
              Todo lo que tu sonrisa necesita
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Ofrecemos una amplia gama de tratamientos dentales con los más
              altos estándares de calidad.
            </p>
          </div>

          {tratamientos && tratamientos.length > 0 ? (
            <TratamientosGrid tratamientos={tratamientos} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicios.map((s) => (
                <div
                  key={s.titulo}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-clinica-light flex items-center justify-center mb-4">
                    <s.icon size={24} className="text-clinica-accent" />
                  </div>
                  <h3 className="font-bold text-clinica-dark mb-2">
                    {s.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Especialidades */}
      {especialidades && especialidades.length > 0 && (
        <section id="especialidades" className="py-20 bg-clinica-light">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-bold text-clinica-accent uppercase tracking-wider mb-2">
                Especialidades
              </p>
              <h2 className="text-3xl font-bold text-clinica-dark mb-3">
                Atención especializada para cada necesidad
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Contamos con especialistas certificados en las distintas ramas
                de la odontología.
              </p>
            </div>

            <EspecialidadesGrid especialidades={especialidades} />
          </div>
        </section>
      )}

      {/* Nosotros */}
      <section id="nosotros" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden min-h-72">
            <Image
              src="/dentista.jpeg"
              alt="Dentista atendiendo a un paciente"
              width={640}
              height={480}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-clinica-accent uppercase tracking-wider mb-2">
              ¿Por qué elegirnos?
            </p>
            <h2 className="text-3xl font-bold text-clinica-dark mb-5">
              Cuidado dental moderno y cercano
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              En nuestra clínica combinamos experiencia, tecnología y un trato
              cercano para que cada visita sea cómoda y segura.
            </p>
            <ul className="flex flex-col gap-3">
              {razones.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-clinica-light flex items-center justify-center shrink-0">
                    <ChevronRight size={14} className="text-clinica-accent" />
                  </span>
                  <span className="text-gray-700">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-clinica-dark">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-clinica-light mb-3">
            ¿Listo para mejorar tu sonrisa?
          </h2>
          <p className="text-gray-300 mb-8">
            Crea tu cuenta y agenda tu primera cita en menos de un minuto.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-clinica-accent text-clinica-light px-8 py-3.5 rounded-lg font-semibold hover:bg-clinica-medium hover:shadow-[0_4px_16px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
          >
            Registrarse ahora
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 bg-clinica-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-clinica-accent uppercase tracking-wider mb-2">
              Contacto
            </p>
            <h2 className="text-3xl font-bold text-clinica-dark">
              Estamos para ayudarte
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <MapPin size={28} className="text-clinica-accent mx-auto mb-3" />
              <p className="font-semibold text-clinica-dark mb-1">Dirección</p>
              <p className="text-sm text-gray-500">
                Blvd. Morazán, Tegucigalpa
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <Phone size={28} className="text-clinica-accent mx-auto mb-3" />
              <p className="font-semibold text-clinica-dark mb-1">Teléfono</p>
              <p className="text-sm text-gray-500">+504 9803-6358</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <Mail size={28} className="text-clinica-accent mx-auto mb-3" />
              <p className="font-semibold text-clinica-dark mb-1">Correo</p>
              <p className="text-sm text-gray-500">CuidadoDental@gmail.com</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <Clock size={28} className="text-clinica-accent mx-auto mb-3" />
              <p className="font-semibold text-clinica-dark mb-1">Horario</p>
              <p className="text-sm text-gray-500">Lun - Vie: 8:00 - 17:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clinica-dark text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/diente-icon.png"
              alt="Icono de diente"
              width={28}
              height={28}
            />
            <p className="font-bold text-clinica-light">ClinicaDental</p>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} ClinicaDental. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
