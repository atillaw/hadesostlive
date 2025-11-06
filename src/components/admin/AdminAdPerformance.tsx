import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, MousePointer, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdStats {
  total_impressions: number;
  total_clicks: number;
  ctr: number;
  by_page: {
    page_path: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
  by_type: {
    ad_type: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
}

const AdminAdPerformance = () => {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');

  useEffect(() => {
    fetchAdPerformance();
  }, [dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case '7days':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30days':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case 'all':
        return null;
      default:
        return null;
    }
  };

  const fetchAdPerformance = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      let query = supabase
        .from('ad_performance')
        .select('*');

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Calculate statistics
      const impressions = data?.filter(d => d.event_type === 'impression') || [];
      const clicks = data?.filter(d => d.event_type === 'click') || [];

      const totalImpressions = impressions.length;
      const totalClicks = clicks.length;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      // Group by page
      const pageStats = new Map<string, { impressions: number; clicks: number }>();
      data?.forEach(item => {
        const current = pageStats.get(item.page_path) || { impressions: 0, clicks: 0 };
        if (item.event_type === 'impression') current.impressions++;
        if (item.event_type === 'click') current.clicks++;
        pageStats.set(item.page_path, current);
      });

      const byPage = Array.from(pageStats.entries()).map(([page_path, stats]) => ({
        page_path,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
      })).sort((a, b) => b.impressions - a.impressions);

      // Group by type
      const typeStats = new Map<string, { impressions: number; clicks: number }>();
      data?.forEach(item => {
        const current = typeStats.get(item.ad_type) || { impressions: 0, clicks: 0 };
        if (item.event_type === 'impression') current.impressions++;
        if (item.event_type === 'click') current.clicks++;
        typeStats.set(item.ad_type, current);
      });

      const byType = Array.from(typeStats.entries()).map(([ad_type, stats]) => ({
        ad_type,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
      })).sort((a, b) => b.impressions - a.impressions);

      setStats({
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        ctr,
        by_page: byPage,
        by_type: byType
      });
    } catch (error) {
      console.error('Error fetching ad performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reklam Performans İstatistikleri</h2>
          <p className="text-muted-foreground">Reklam görüntülenme ve tıklama verileri</p>
        </div>
        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Bugün</SelectItem>
            <SelectItem value="7days">Son 7 Gün</SelectItem>
            <SelectItem value="30days">Son 30 Gün</SelectItem>
            <SelectItem value="all">Tüm Zamanlar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_impressions.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clicks.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tıklama Oranı (CTR)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ctr.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Sayfalara Göre</TabsTrigger>
          <TabsTrigger value="types">Reklam Tiplerine Göre</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sayfa Bazlı Performans</CardTitle>
              <CardDescription>Her sayfadaki reklam performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.by_page.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{page.page_path}</p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {page.impressions} görüntülenme
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {page.clicks} tıklama
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{page.ctr.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                    </div>
                  </div>
                ))}
                {(!stats?.by_page || stats.by_page.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reklam Tipine Göre Performans</CardTitle>
              <CardDescription>AdSense ve özel HTML reklamları karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.by_type.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {type.ad_type === 'adsense' ? 'Google AdSense' : 'Özel HTML Reklam'}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {type.impressions} görüntülenme
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {type.clicks} tıklama
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{type.ctr.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                    </div>
                  </div>
                ))}
                {(!stats?.by_type || stats.by_type.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAdPerformance;
