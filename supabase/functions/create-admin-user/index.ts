import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
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

    const { email, password, role }: CreateUserRequest = await req.json();

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Geçersiz e-posta formatı");
    }

    if (password.length < 8) {
      throw new Error("Şifre en az 8 karakter olmalıdır");
    }

    const validRoles: CreateUserRequest["role"][] = ["admin", "editor", "developer"];
    if (!validRoles.includes(role)) {
      throw new Error("Geçersiz rol");
    }

    if (!email || !password || !role) {
      throw new Error("Missing required fields");
    }

    // Generate username from email
    const username = email.split('@')[0];

    // Create user in auth
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    });

    if (createAuthError) {
      console.error("Auth creation error:", createAuthError);
      
      // Return specific error messages
      if (createAuthError.message.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "Bu e-posta adresi zaten kayıtlı" }),
          { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
        );
      }
      
      throw createAuthError;
    }

    if (!authData.user) {
      throw new Error("Kullanıcı oluşturulamadı");
    }

    // Add user role
    const { error: insertRoleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role,
      });

    if (insertRoleError) {
      console.error("Role insertion error:", insertRoleError);
      
      // If role insertion fails, we should delete the created user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      throw new Error("Kullanıcı rolü atanamadı");
    }

    console.log(`[Success] User created: ${email} with role: ${role}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username,
          role,
        },
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Server Error] Create user:", error);
    
    // Return the actual error message to help with debugging
    const errorMessage = error.message || "Kullanıcı oluşturma başarısız oldu";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
