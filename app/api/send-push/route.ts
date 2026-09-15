
import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { supabase } from "@/lib/supabase"; // ou ton chemin d'accès vers Supabase

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { userId, title, body, url } = await request.json();

    const { data: tokensData } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", userId);

    if (!tokensData || tokensData.length === 0) {
      return NextResponse.json({ message: "Aucun token trouvé" }, { status: 404 });
    }

    const tokens = tokensData.map((t) => t.token);

    const response = await getMessaging().sendEachForMulticast({
      notification: { title, body },
      data: { url: url || "/" },
      tokens,
    });

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}