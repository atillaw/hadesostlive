import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  role: "admin" | "editor" | "developer";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Yetkilendirme gerekli" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userAuthError } = await supabaseAdmin.auth.getUser(token);
    
    if (userAuthError || !user) {
      return new Response(
        JSON.stringify({ error: "Geçersiz kimlik doğrulama" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: roleData, error: checkRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (checkRoleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Yalnızca yöneticiler kullanıcı oluşturabilir" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 403 }
      );
    }

    const { email, password, username, role }: CreateUserRequest = await req.json();

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Geçersiz e-posta formatı");
    }

    if (password.length < 8) {
      throw new Error("Şifre en az 8 karakter olmalıdır");
    }

    if (!username || username.length < 3 || username.length > 50) {
      throw new Error("Kullanıcı adı 3-50 karakter arasında olmalıdır");
    }

    const validRoles: CreateUserRequest["role"][] = ["admin", "editor", "developer"];
    if (!validRoles.includes(role)) {
      throw new Error("Geçersiz rol");
    }

    if (!email || !password || !username || !role) {
      throw new Error("Missing required fields");
    }

    // Create user in auth (or attach role if email already exists)
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    });

    // determine user id even if email already exists
    let targetUserId: string | null = null;
    if (createAuthError) {
      const code = (createAuthError as any).code;
      const status = (createAuthError as any).status;
      if (code === "email_exists" || status === 422) {
        // Try to find existing user via profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profileError || !profile) {
          throw createAuthError;
        }
        targetUserId = profile.id as string;
      } else {
        throw createAuthError;
      }
    } else if (authData?.user) {
      targetUserId = authData.user.id;
    } else {
      throw new Error("Kullanıcı oluşturulamadı");
    }

    // Add user role
    const { error: insertRoleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: targetUserId,
        role,
      });

    // Ignore duplicate role assignment
    if (insertRoleError && (insertRoleError as any).code !== "23505") throw insertRoleError;

    // Audit log
    console.log(`[Audit] Admin ${user.id} created/assigned role ${role} to user ${targetUserId} (${email})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Kullanıcı rolü başarıyla atandı",
        userId: targetUserId,
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Server Error] Create user:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Kullanıcı oluşturma başarısız oldu",
        details: error
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
