import { NextResponse } from "next/server";
import webpush from "web-push";
import { subscriptions } from "../subscribe/route";

export const dynamic = "force-dynamic";

// Configura web-push con las claves VAPID del entorno
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:noreply@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: Request) {
  try {
    const { title, body } = await req.json();
    if (!process.env.VAPID_PUBLIC_KEY) {
      return NextResponse.json({ error: "VAPID no configurado" }, { status: 500 });
    }
    if (subscriptions.size === 0) {
      return NextResponse.json({ error: "No hay suscripciones registradas" }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: title || "Nicol Garay App",
      body: body || "Tienes tareas pendientes",
      icon: "/app-icon.png",
      badge: "/app-icon.png",
      tag: "task-reminder",
    });

    const results: { success: number; failed: number } = { success: 0, failed: 0 };
    const toRemove: string[] = [];

    for (const subStr of subscriptions) {
      const sub = JSON.parse(subStr);
      try {
        await webpush.sendNotification(sub, payload);
        results.success++;
      } catch (err: unknown) {
        results.failed++;
        // 404/410 = suscripción inválida/expirada → eliminar
        if (err && typeof err === "object" && "statusCode" in err && (err.statusCode === 404 || err.statusCode === 410)) {
          toRemove.push(subStr);
        }
      }
    }

    toRemove.forEach((s) => subscriptions.delete(s));

    return NextResponse.json({ success: true, ...results });
  } catch {
    return NextResponse.json({ error: "Error enviando notificación" }, { status: 500 });
  }
}
