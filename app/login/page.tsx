"use client";

import {useActionState} from "react";
import { signIn } from "../actions/auth";
import Link from "next/link";

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(signIn,null);

    return (
        <>
        <form action={formAction} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
            <h1 className="text-2xl font-bold">Iniciar Sesión</h1>

            {state?.error &&(
                <p className="text-red-500 text-sm">{state.error}</p>
            ) }

            <input className="border p-2 rounded" name="email" type="email" placeholder="email" required/>
            <input className="border p-2 rounded" name="password" type="password" placeholder="password" required/>

            <button className="bg-blue-600 text-white p-2 rounded disabled:opacity-50" disabled={pending} type="submit" >{pending ? "Entrando..":"Iniciar Sesión"}</button>
        </form>
        <p className="text-sm text-center mt-4">
            ¿No tienes cuenta? <Link href="/register" className="text-blue-600 underline">Regístrate</Link>
        </p>
        </>
    )
}