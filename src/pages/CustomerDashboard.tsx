import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, MapPin, User, Package, Heart, ArrowRight, Plus, Edit, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressFormDialog } from "@/components/forms/AddressFormDialog";
import { ProfileFormDialog } from "@/components/forms/ProfileFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CustomerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(profileData);

    // Load orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        stores (name),
        addresses (title, full_address)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(ordersData || []);

    // Load addresses
    const { data: addressesData } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses(addressesData || []);
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
      'pending': 'در انتظار تایید',
      'confirmed': 'تایید شده',
      'delivered': 'تحویل داده شده',
      'cancelled': 'لغو شده'
    };
    return texts[status] || status;
  };

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address);
    setAddressDialogOpen(true);
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) return;

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', deleteAddressId);

    if (error) {
      toast.error('خطا در حذف آدرس');
    } else {
      toast.success('آدرس با موفقیت حذف شد');
      loadData();
    }
    setDeleteAddressId(null);
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
            <h1 className="text-3xl font-bold mb-2">پنل مشتری</h1>
            <p className="text-muted-foreground">
              خوش آمدید {profile?.full_name}
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
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">سفارشات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Package className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-muted-foreground">تحویل شده</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{addresses.length}</p>
                  <p className="text-sm text-muted-foreground">آدرس‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose/10">
                  <Heart className="h-6 w-6 text-rose" />
                </div>
                <div>
                  <p className="text-2xl font-bold">۰</p>
                  <p className="text-sm text-muted-foreground">علاقه‌مندی‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" dir="rtl" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">سفارشات من</TabsTrigger>
            <TabsTrigger value="addresses">آدرس‌ها</TabsTrigger>
            <TabsTrigger value="profile">پروفایل</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">هنوز سفارشی ندارید</p>
                  <p className="text-muted-foreground mb-6">
                    برای شروع خرید، محصولات را مشاهده کنید
                  </p>
                  <Button onClick={() => navigate('/')}>
                    مشاهده محصولات
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          سفارش از {order.stores?.name}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </CardDescription>
                      </div>
                      <span className={`font-bold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مبلغ کل:</span>
                        <span className="font-bold">
                          {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">آدرس تحویل:</span>
                        <span>{order.addresses?.title}</span>
                      </div>
                      {order.delivery_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">زمان تحویل:</span>
                          <span>
                            {new Date(order.delivery_date).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <Button onClick={handleAddAddress} className="w-full sm:w-auto">
              <Plus className="ml-2 h-4 w-4" />
              افزودن آدرس جدید
            </Button>
            
            {addresses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">هنوز آدرسی ندارید</p>
                  <p className="text-muted-foreground">
                    برای سفارش، آدرس خود را اضافه کنید
                  </p>
                </CardContent>
              </Card>
            ) : (
              addresses.map((address) => (
                <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {address.title}
                          {address.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              پیش‌فرض
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{address.full_address}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setDeleteAddressId(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">تلفن:</span>
                      <span dir="ltr">{address.phone}</span>
                    </div>
                    {address.postal_code && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">کد پستی:</span>
                        <span dir="ltr">{address.postal_code}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات کاربری</CardTitle>
                <CardDescription>مشاهده و ویرایش اطلاعات شخصی</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">نام و نام خانوادگی</label>
                  <p className="text-lg font-medium">{profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">ایمیل</label>
                  <p className="text-lg" dir="ltr">{user?.email}</p>
                </div>
                {profile?.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">شماره تماس</label>
                    <p className="text-lg" dir="ltr">{profile.phone}</p>
                  </div>
                )}
                <Button variant="outline" onClick={() => setProfileDialogOpen(true)}>
                  <Edit className="ml-2 h-4 w-4" />
                  ویرایش پروفایل
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <AddressFormDialog
          open={addressDialogOpen}
          onOpenChange={setAddressDialogOpen}
          address={selectedAddress}
          userId={user?.id || ''}
          onSuccess={loadData}
        />
        
        <ProfileFormDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          profile={profile}
          onSuccess={loadData}
        />
        
        <AlertDialog open={!!deleteAddressId} onOpenChange={() => setDeleteAddressId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription>
                این عملیات قابل بازگشت نیست. آدرس به طور کامل حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAddress}>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
