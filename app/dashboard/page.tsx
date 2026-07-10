"use client";
import { signOut } from "../actions/auth";
export default function Dashboard (){
    return<> 
    
    <header className="bg-white text-black flex justify-between p-4 border-b border-gray-500">
                <p className="font-bold text-xl">Bienvenido</p>
            <button
            onClick={signOut}
            type="button" 
            className="bg-red-600 text-white w-32 h-8 rounded-md cursor-pointer hover:bg-red-500 hover:scale-105">
            Cerrar Sesión
            </button>
    </header>
        
    
    <main className="bg-white w-dvw h-dvh">
        <h1 className="text-black font-bold text-4xl text-center p-4">Clinica Odontologica</h1>
        
    </main>
    </>
}