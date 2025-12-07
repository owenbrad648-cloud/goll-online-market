import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Store, Package, ShoppingBag, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [stores, setStores] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error('شما دسترسی به این صفحه را ندارید');
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    // Load stores
    const { data: storesData, count: storesCount } = await supabase
      .from('stores')
      .select('*, profiles!stores_owner_id_fkey(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });
    setStores(storesData || []);

    // Load orders
    const { data: ordersData, count: ordersCount } = await supabase
      .from('orders')
      .select('*, stores(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20);
    setOrders(ordersData || []);

    // Load users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .order('created_at', { ascending: false })
      .limit(20);
    setUsers(usersData || []);

    // Load products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalUsers: usersData?.length || 0,
      totalStores: storesCount || 0,
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0
    });
  };

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('stores')
      .update({ is_active: !currentStatus })
      .eq('id', storeId);

    if (error) {
      toast.error('خطا در تغییر وضعیت');
    } else {
      toast.success('وضعیت غرفه به‌روزرسانی شد');
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'text-accent',
      'confirmed': 'text-secondary',
      'delivered': 'text-primary',
      'cancelled': 'text-destructive'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'pending': 'در انتظار',
      'confirmed': 'تایید شده',
      'delivered': 'تحویل شده',
      'cancelled': 'لغو شده'
    };
    return texts[status] || status;
  };

  const getRoleText = (roles: any[]) => {
    if (!roles || roles.length === 0) return 'مشتری';
    const roleTexts = {
      'admin': 'مدیر',
      'seller': 'غرفه‌دار',
      'customer': 'مشتری'
    };
    return roles.map(r => roleTexts[r.role as keyof typeof roleTexts] || r.role).join('، ');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">پنل مدیریت</h1>
            <p className="text-muted-foreground">
              مدیریت کل سیستم
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowRight className="ml-2 h-4 w-4" />
            بازگشت به صفحه اصلی
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">کاربران</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Store className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStores}</p>
                  <p className="text-sm text-muted-foreground">غرفه‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  <p className="text-sm text-muted-foreground">محصولات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose/10">
                  <ShoppingBag className="h-6 w-6 text-rose" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">سفارشات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stores" dir="rtl" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stores">غرفه‌ها</TabsTrigger>
            <TabsTrigger value="orders">سفارشات</TabsTrigger>
            <TabsTrigger value="users">کاربران</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-4">
            {stores.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">هنوز غرفه‌ای ثبت نشده</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <Card key={store.id} className={!store.is_active ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{store.name}</CardTitle>
                          <CardDescription>
                            {store.profiles?.full_name}
                          </CardDescription>
                        </div>
                        {store.is_active ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {store.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {store.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        ثبت شده: {new Date(store.created_at).toLocaleDateString('fa-IR')}
                      </div>
                      <Button
                        size="sm"
                        variant={store.is_active ? 'destructive' : 'default'}
                        className="w-full"
                        onClick={() => toggleStoreStatus(store.id, store.is_active)}
                      >
                        {store.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">هنوز سفارشی ثبت نشده</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شناسه سفارش</TableHead>
                      <TableHead>غرفه</TableHead>
                      <TableHead>مبلغ</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{order.stores?.name}</TableCell>
                        <TableCell>
                          {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {users.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">هنوز کاربری ثبت نشده</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>نقش</TableHead>
                      <TableHead>شماره تماس</TableHead>
                      <TableHead>تاریخ عضویت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{getRoleText(user.user_roles)}</TableCell>
                        <TableCell dir="ltr">{user.phone || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('fa-IR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
