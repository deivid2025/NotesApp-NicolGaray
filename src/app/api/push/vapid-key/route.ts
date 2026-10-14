import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Devuelve la VAPID public key al cliente (la privada NUNCA se expone)
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "VAPID no configurado" }, { status: 500 });
  }
  return NextResponse.json({ publicKey });
}
