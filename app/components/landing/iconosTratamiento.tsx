type IconProps = {
  size?: number;
  className?: string;
};

const iconosTratamiento = [
  IconoDiente,
  IconoBotiquin,
  IconoDoctor,
  IconoCepillo,
  IconoDienteProtegido,
  IconoSonrisa,
];

const indicePorPalabra: Record<string, number> = {
  consulta: 0,
  revision: 0,
  control: 0,
  diagnostico: 0,
  examen: 0,
  general: 0,
  urgencia: 1,
  emergencia: 1,
  extraccion: 1,
  cirugia: 1,
  endodoncia: 1,
  conducto: 1,
  absceso: 1,
  dolor: 1,
  ortodoncia: 2,
  brackets: 2,
  especialidad: 2,
  especialista: 2,
  evaluacion: 2,
  periodoncia: 2,
  implantologia: 2,
  pediatria: 2,
  rehabilitacion: 2,
  protesis: 2,
  limpieza: 3,
  profilaxis: 3,
  higiene: 3,
  prevencion: 4,
  sellador: 4,
  fluor: 4,
  proteccion: 4,
  mantenimiento: 4,
  estetica: 5,
  blanqueamiento: 5,
  carilla: 5,
  sonrisa: 5,
  corona: 5,
  cosmetico: 5,
};

export function iconoParaNombre(nombre: string, indice: number) {
  const normalizado = nombre.toLowerCase();
  const palabra = Object.keys(indicePorPalabra).find((p) =>
    normalizado.includes(p)
  );
  return palabra !== undefined
    ? iconosTratamiento[indicePorPalabra[palabra]]
    : iconosTratamiento[indice % iconosTratamiento.length];
}

export function IconoDiente({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      className={className}
    >
      <g fill="none">
        <path
          fill="#8fbffa"
          d="M.887 4.861c.359-3.27 3.235-3.585 5.195-2.45c.615.357 1.22.357 1.836 0c1.96-1.135 4.836-.82 5.195 2.45c.36 3.28-1.486 6.751-2.476 8.08c-.225.302-.588.447-.965.447a1.46 1.46 0 0 1-1.378-.969l-.35-.971a1.003 1.003 0 0 0-1.887 0l-.35.971c-.21.582-.762.969-1.38.969c-.376 0-.74-.145-.965-.447c-.989-1.329-2.836-4.8-2.475-8.08"
        />
        <path
          stroke="#2859c5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          d="M8.666 4.697c-1.368.499-2.103.489-3.332 0"
        />
      </g>
    </svg>
  );
}

export function IconoBotiquin({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={className}
    >
      <path
        fill="currentColor"
        d="M42.924 13H38V7.774C38 4.038 35.052 1 31.306 1H18.695C14.947 1 12 4.038 12 7.774V13H7.075C3.719 13 1 15.591 1 18.937v23.007C1 45.289 3.719 48 7.075 48h35.849C46.279 48 49 45.289 49 41.943V18.937C49 15.591 46.279 13 42.924 13M16 7.774C16 6.375 17.292 5 18.695 5h12.611C32.705 5 34 6.375 34 7.774V13H16zM36 35h-7v7h-8v-7h-7v-8h7v-7h8v7h7z"
      />
    </svg>
  );
}

export function IconoDoctor({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        fill="currentColor"
        d="M14 11.3c-1-1.9-2-1.6-3.1-1.7c.1.3.1.6.1 1c1.6.4 2 2.3 2 3.4v1h-2v-1h1s0-2.5-1.5-2.5S9 13.9 9 14h1v1H8v-1c0-1.1.4-3.1 2-3.4c0-.6-.1-1.1-.2-1.3c-.2-.1-.4-.3-.4-.6c0-.6.8-.4 1.4-1.5c0 0 .9-2.3.6-4.3h-1c0-.2.1-.3.1-.5s0-.3-.1-.5h.8C10.9.9 9.9 0 8 0S5.1.9 4.7 2h.8c0 .2-.1.3-.1.5s0 .3.1.5h-1c-.2 2 .6 4.3.6 4.3c.6 1 1.4.8 1.4 1.5c0 .5-.5.7-1.1.8c-.2.2-.4.6-.4 1.4v1.2c.6.2 1 .8 1 1.4c0 .7-.7 1.4-1.5 1.4S3 14.3 3 13.5c0-.7.4-1.2 1-1.4v-1.2c0-.5.1-.9.2-1.3c-.7.1-1.5.4-2.2 1.7c-.6 1.1-.9 4.7-.9 4.7h13.7c.1 0-.2-3.6-.8-4.7M6.5 2.5C6.5 1.7 7.2 1 8 1s1.5.7 1.5 1.5S8.8 4 8 4s-1.5-.7-1.5-1.5"
      />
      <path fill="currentColor" d="M5 13.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0" />
    </svg>
  );
}

export function IconoCepillo({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="m17.86 1.5l-4.95 4.93l2.12 2.12l1.06-1.05l-1.06-1.07l2.83-2.83l1.06 1.06L20 3.6m1.4 0l-5.84 5.84l-2.13.71L3 20.57L4.43 22l5.65-5.67l4.25 4.24l4.24-4.24l-4.24-4.24l.17-.19l2.13-.71l4.77-4.76c.78-.78.78-2.05 0-2.83m-14.85.71L2.31 8.55l4.95 4.95l4.24-4.24m6.72 8.84l-2.13 2.12l1.41 1.41l2.13-2.13Z"
      />
    </svg>
  );
}

export function IconoDienteProtegido({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <g fill="none">
        <path
          fill="#78eb7b"
          d="M1.957 4.133v7.305a11.775 11.775 0 0 0 7.861 10.969l1.072.396a3.22 3.22 0 0 0 2.22 0l1.072-.396a11.775 11.775 0 0 0 7.86-10.969V4.133a1.47 1.47 0 0 0-.893-1.344A23.2 23.2 0 0 0 12 1a23.2 23.2 0 0 0-9.15 1.789a1.47 1.47 0 0 0-.893 1.344"
        />
        <path
          fill="#c9f7ca"
          d="M12 1.001a23.2 23.2 0 0 0-9.15 1.788a1.47 1.47 0 0 0-.893 1.344v7.305a11.775 11.775 0 0 0 7.861 10.969l1.072.395A3.2 3.2 0 0 0 12 23z"
        />
        <path
          stroke="#191919"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M1.957 4.133v7.305a11.775 11.775 0 0 0 7.861 10.969l1.072.396a3.22 3.22 0 0 0 2.22 0l1.072-.396a11.775 11.775 0 0 0 7.86-10.969V4.133a1.47 1.47 0 0 0-.893-1.344A23.2 23.2 0 0 0 12 1a23.2 23.2 0 0 0-9.15 1.789a1.47 1.47 0 0 0-.893 1.344"
        />
        <path
          fill="#e3e3e3"
          d="M16.782 8.92c0-1.793-1.16-3.207-2.59-3.207A2.58 2.58 0 0 0 12 6.931a2.59 2.59 0 0 0-2.19-1.218c-1.431 0-2.591 1.414-2.591 3.207a5.34 5.34 0 0 0 1.417 3.972a8.3 8.3 0 0 0-.62 3.202a8.7 8.7 0 0 0 .178 1.775a.52.52 0 0 0 .513.416a.54.54 0 0 0 .542-.485c.217-1.986 1.367-3.5 2.752-3.5s2.541 1.526 2.754 3.516a.527.527 0 0 0 .523.47a.546.546 0 0 0 .534-.436a9 9 0 0 0 .175-1.756a8.3 8.3 0 0 0-.621-3.202a5.33 5.33 0 0 0 1.417-3.972"
        />
        <path
          fill="#fff"
          d="M12 6.931a2.59 2.59 0 0 0-2.19-1.218c-1.431 0-2.591 1.414-2.591 3.207a5.34 5.34 0 0 0 1.417 3.972a8.3 8.3 0 0 0-.62 3.202a8.7 8.7 0 0 0 .178 1.775a.52.52 0 0 0 .513.416a.54.54 0 0 0 .542-.486c.217-1.985 1.367-3.498 2.752-3.498z"
        />
        <path
          stroke="#191919"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.782 8.92c0-1.793-1.16-3.207-2.59-3.207A2.58 2.58 0 0 0 12 6.931a2.59 2.59 0 0 0-2.19-1.218c-1.431 0-2.591 1.414-2.591 3.207a5.34 5.34 0 0 0 1.417 3.972a8.3 8.3 0 0 0-.62 3.202a8.7 8.7 0 0 0 .178 1.775a.52.52 0 0 0 .513.416a.54.54 0 0 0 .542-.485c.217-1.986 1.367-3.5 2.752-3.5s2.541 1.526 2.754 3.516a.527.527 0 0 0 .523.47a.546.546 0 0 0 .534-.436a9 9 0 0 0 .175-1.756a8.3 8.3 0 0 0-.621-3.202a5.33 5.33 0 0 0 1.417-3.972"
        />
      </g>
    </svg>
  );
}

export function IconoSonrisa({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12s0-7.071-1.465-8.536C19.072 2 16.714 2 12 2S4.929 2 3.464 3.464M15 12c.552 0 1-.672 1-1.5S15.552 9 15 9s-1 .672-1 1.5s.448 1.5 1 1.5m-5-1.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S8.448 9 9 9s1 .672 1 1.5m-1.603 5.053a.75.75 0 0 1 1.05-.155c.728.54 1.607.852 2.553.852s1.825-.313 2.553-.852a.75.75 0 1 1 .894 1.204A5.77 5.77 0 0 1 12 17.75a5.77 5.77 0 0 1-3.447-1.148a.75.75 0 0 1-.156-1.049"
        clipRule="evenodd"
      />
    </svg>
  );
}
