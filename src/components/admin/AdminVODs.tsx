import VODManagement from "@/components/VODManagement";

const AdminVODs = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">VOD Yönetimi</h2>
      <p className="text-muted-foreground mb-6">
        Kick kanalınızdan VOD'ları otomatik olarak çekin
      </p>
      <VODManagement />
    </div>
  );
};

export default AdminVODs;
