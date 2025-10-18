import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor" | "developer">("editor");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newPassword) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      // Call edge function to create user with role
      const response = await supabase.functions.invoke("create-admin-user", {
        body: {
          email: newEmail,
          password: newPassword,
          role: newRole,
        },
      });

      console.log("Full function response:", response);

      // Check for errors - Supabase puts the response body in 'data' even for errors
      if (response.data?.error) {
        // This is the actual error message from the edge function
        throw new Error(response.data.error);
      }

      // Check for network/other errors
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Kullanıcı oluşturma başarısız oldu");
      }

      // Success case
      if (response.data?.success) {
        toast({
          title: "Kullanıcı Oluşturuldu!",
          description: `${newEmail} başarıyla oluşturuldu.`,
        });

        setNewEmail("");
        setNewPassword("");
        setNewRole("editor");
        loadUsers();
      } else {
        throw new Error("Beklenmeyen yanıt formatı");
      }
    } catch (error: any) {
      console.error("Create user error:", error);
      
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı oluşturma başarısız oldu",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          Yeni Kullanıcı Oluştur
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Editor: Sadece fikirleri yönetebilir | Developer: Teknik erişim | Admin: Tam yetki
            </p>
          </div>

          <Button type="submit" disabled={creating} className="w-full">
            {creating ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Tüm Kullanıcılar
        </h2>
        <p className="text-muted-foreground mb-4">Toplam {users.length} kullanıcı</p>

        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz kullanıcı yok
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;
