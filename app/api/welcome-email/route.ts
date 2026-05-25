import { sendWelcomeEmail } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await sendWelcomeEmail(email, name);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in welcome-email API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
