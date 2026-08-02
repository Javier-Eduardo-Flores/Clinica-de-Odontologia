import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(){
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies:{
                getAll(){
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet){
                    try{
                        cookiesToSet.forEach(({name,value,options})=>
                            cookieStore.set(name,value,options)
                        );
                    }catch{
                        // Solo puede escribirse cookies en Server Actions o Route Handlers.
                        // Si el refresco de sesión ocurre durante un render de Server Component,
                        // se ignora: el middleware (proxy.ts) ya refresca las cookies.
                    }
                },
            },
        }
    );
}