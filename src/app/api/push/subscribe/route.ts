import { NextResponse } from "next/server";

// Almacenamiento en memoria de suscripciones push (en producción usar DB)
// Reset al reiniciar el servidor — suficiente para demo/MVP
const subscriptions = new Set<string>();

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const sub = await req.json();
    if (!sub || !sub.endpoint) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }
    subscriptions.add(JSON.stringify(sub));
    return NextResponse.json({ success: true, total: subscriptions.size });
  } catch {
    return NextResponse.json({ error: "Error guardando suscripción" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ total: subscriptions.size });
}

// Export para que la ruta /api/push/send pueda acceder a las suscripciones
export { subscriptions };
