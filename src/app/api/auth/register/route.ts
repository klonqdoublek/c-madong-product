import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkRegisteredMenu } from "@/lib/line/rich-menu";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      studentId,
      fullNameTh,
      fullNameEn,
      faculty,
      email,
      phone,
      lineUid,
      displayName,
      avatarUrl,
    } = parsed.data;

    const supabase = createAdminClient();

    // Check if LINE UID already registered
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This LINE account is already registered" },
        { status: 409 }
      );
    }

    // Check if student ID already taken
    const { data: existingStudent } = await supabase
      .from("profiles")
      .select("id")
      .eq("student_id", studentId)
      .single();

    if (existingStudent) {
      return NextResponse.json(
        { error: "This student ID is already registered" },
        { status: 409 }
      );
    }

    // Create Supabase auth user with LINE UID as identifier
    const syntheticEmail = `${lineUid}@line.c-madong.app`;
    // Keep password under 72 bytes (bcrypt limit)
    const tempPassword = `ln_${crypto.randomUUID()}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const createUserRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          email: syntheticEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            line_uid: lineUid,
            display_name: displayName,
          },
        }),
      }
    );

    if (!createUserRes.ok) {
      const errBody = await createUserRes.text();
      console.error("[Register] Auth user creation failed:", createUserRes.status, errBody);
      return NextResponse.json(
        { error: "Failed to create account", detail: errBody },
        { status: 500 }
      );
    }

    const authUser = await createUserRes.json();

    if (!authUser.id) {
      console.error("[Register] No user ID in response:", JSON.stringify(authUser));
      return NextResponse.json(
        { error: "Failed to create account", detail: "No user ID returned" },
        { status: 500 }
      );
    }

    // Insert profile row
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.id,
      student_id: studentId,
      full_name_th: fullNameTh,
      full_name_en: fullNameEn || null,
      faculty,
      email,
      phone: phone || null,
      line_uid: lineUid,
      display_name: displayName,
      avatar_url: avatarUrl,
      role: "student",
      onboarding_completed: false,
    });

    if (profileError) {
      // Rollback: delete auth user
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${authUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      });
      console.error("[Register] Profile insert failed:", JSON.stringify(profileError));
      return NextResponse.json(
        { error: "Failed to create profile", detail: profileError.message },
        { status: 500 }
      );
    }

    // Sign in the user by creating a session
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const serverSupabase = await createServerClient();
    const { error: signInError } = await serverSupabase.auth.signInWithPassword(
      {
        email: syntheticEmail,
        password: tempPassword,
      }
    );

    if (signInError) {
      console.error("[Register] Sign-in failed:", signInError);
      // Profile was created — user can still log in via LINE again
    }

    // Swap to registered rich menu
    await linkRegisteredMenu(lineUid);

    return NextResponse.json({ success: true, userId: authUser.id });
  } catch (err) {
    console.error("[Register] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
