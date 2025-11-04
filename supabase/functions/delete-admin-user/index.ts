import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
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
      .maybeSingle();

    if (checkRoleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Yalnızca yöneticiler kullanıcı silebilir" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 403 }
      );
    }

    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      throw new Error("Kullanıcı ID'si gerekli");
    }

    // Delete user from auth (this will cascade to profiles and user_roles)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) throw deleteAuthError;

    // Audit log
    console.log(`[Audit] Admin ${user.id} deleted user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Kullanıcı başarıyla silindi"
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Server Error] Delete user:", error);
    return new Response(
      JSON.stringify({ error: "Kullanıcı silme başarısız oldu" }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
