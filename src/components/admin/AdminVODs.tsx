import VODManagement from "@/components/VODManagement";
import AdminManualVODs from "./AdminManualVODs";
import AdminVODList from "./AdminVODList";

const AdminVODs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">VOD Yönetimi</h2>
        <p className="text-muted-foreground mb-6">
          Kick kanalınızdan VOD'ları otomatik olarak çekin veya manuel ekleyin
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <VODManagement />
        <AdminManualVODs />
      </div>

      <AdminVODList />
    </div>
  );
};

export default AdminVODs;
