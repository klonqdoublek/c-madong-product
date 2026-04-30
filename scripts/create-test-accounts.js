require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const accounts = [
  {
    email: "student1@c-madong.app",
    password: "devstudent123",
    profile: {
      role: "student",
      full_name_th: "Student 1",
      full_name_en: "Student 1",
      student_id: "TST660000001",
      onboarding_completed: true,
    },
  },
  {
    email: "student2@c-madong.app",
    password: "devstudent456",
    profile: {
      role: "student",
      full_name_th: "Student 2",
      full_name_en: "Student 2",
      student_id: "TST660000002",
      onboarding_completed: true,
    },
  },
  {
    email: "student3@c-madong.app",
    password: "devstudent789",
    profile: {
      role: "student",
      full_name_th: "Student 3",
      full_name_en: "Student 3",
      student_id: "TST660000003",
      onboarding_completed: true,
    },
  },
  {
    email: "adminsup@c-madong.app",
    password: "superadmin123",
    profile: {
      role: "admin",
      full_name_th: "Admin (Super Admin)",
      full_name_en: "Admin (Super Admin)",
      onboarding_completed: true,
    },
    appRoles: ["super_admin"],
  },
  {
    email: "admin1@c-madong.app",
    password: "dev1admin123",
    profile: {
      role: "admin",
      full_name_th: "Admin 1",
      full_name_en: "Admin 1",
      onboarding_completed: true,
    },
    appRoles: ["admin_staff"],
  },
  {
    email: "admin2@c-madong.app",
    password: "dev2admin456",
    profile: {
      role: "admin",
      full_name_th: "Admin 2",
      full_name_en: "Admin 2",
      onboarding_completed: true,
    },
    appRoles: ["admin_staff"],
  },
];

async function ensureUserRole(userId, role) {
  const { data: existingRole, error: selectError } = await supabase
    .from("user_roles")
    .select("id, is_active")
    .eq("user_id", userId)
    .eq("role", role)
    .is("building_scope", null)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (!existingRole) {
    const { error: insertError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role,
      is_active: true,
      metadata: { source: "scripts/create-test-accounts.js" },
    });

    if (insertError) {
      throw insertError;
    }

    return "inserted";
  }

  if (!existingRole.is_active) {
    const { error: updateError } = await supabase
      .from("user_roles")
      .update({ is_active: true })
      .eq("id", existingRole.id);

    if (updateError) {
      throw updateError;
    }

    return "reactivated";
  }

  return "existing";
}

async function createAccount(account) {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", account.email)
    .maybeSingle();

  if (profileLookupError) {
    throw profileLookupError;
  }

  let userId = existingProfile?.id ?? null;
  let userStatus = existingProfile ? "existing-profile" : "new-user";

  if (!userId) {
    const { data: createdUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name_th: account.profile.full_name_th,
          full_name_en: account.profile.full_name_en,
          source: "scripts/create-test-accounts.js",
        },
      });

    if (createUserError) {
      throw createUserError;
    }

    userId = createdUser.user?.id ?? null;

    if (!userId) {
      throw new Error(`No user ID returned for ${account.email}`);
    }
  }

  if (!existingProfile) {
    const { error: insertProfileError } = await supabase.from("profiles").insert({
      id: userId,
      email: account.email,
      ...account.profile,
    });

    if (insertProfileError) {
      throw insertProfileError;
    }
  }

  const roleResults = [];

  for (const role of account.appRoles ?? []) {
    const status = await ensureUserRole(userId, role);
    roleResults.push(`${role}:${status}`);
  }

  return {
    email: account.email,
    userId,
    userStatus,
    profileStatus: existingProfile ? "existing" : "inserted",
    roles: roleResults,
  };
}

async function main() {
  const results = [];

  for (const account of accounts) {
    const result = await createAccount(account);
    results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
