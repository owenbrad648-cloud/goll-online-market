import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Package, ShoppingBag, TrendingUp, ArrowRight, Plus, Edit, Settings2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductFormDialog } from "@/components/forms/ProductFormDialog";
import { ProductFeaturesDialog } from "@/components/forms/ProductFeaturesDialog";
import { StoreFormDialog } from "@/components/forms/StoreFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const SellerDashboard = () => {
  const { user, isSeller, loading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [selectedProductForFeatures, setSelectedProductForFeatures] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || !isSeller)) {
      toast.error('شما دسترسی به این صفحه را ندارید');
      navigate('/');
    }
  }, [user, isSeller, loading, navigate]);

  useEffect(() => {
    if (user && isSeller) {
      loadData();
    }
  }, [user, isSeller]);

  const loadData = async () => {
    if (!user) return;

    // Load store
    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();
    setStore(storeData);

    if (storeData) {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });
      setProducts(productsData || []);

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          addresses (title, full_address, phone)
        `)
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });
      setOrders(ordersData || []);
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
      'pending': 'در انتظار تایید',
      'confirmed': 'تایید شده',
      'delivered': 'تحویل داده شده',
      'cancelled': 'لغو شده'
    };
    return texts[status] || status;
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteProductId);

    if (error) {
      toast.error('خطا در حذف محصول');
    } else {
      toast.success('محصول با موفقیت حذف شد');
      loadData();
    }
    setDeleteProductId(null);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('id', orderId)
      .single();

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('خطا در به‌روزرسانی وضعیت');
      return;
    }

    // Create notification for customer
    if (order) {
      const statusMessages: Record<string, string> = {
        confirmed: 'سفارش شما تایید شد',
        processing: 'سفارش شما در حال آماده‌سازی است',
        shipped: 'سفارش شما ارسال شد',
        delivered: 'سفارش شما تحویل داده شد',
        cancelled: 'سفارش شما لغو شد',
      };

      await supabase.from('notifications').insert({
        user_id: order.customer_id,
        title: 'تغییر وضعیت سفارش',
        message: statusMessages[newStatus] || 'وضعیت سفارش شما تغییر کرد',
        type: 'order_status',
        related_order_id: orderId,
      });
    }

    toast.success('وضعیت سفارش به‌روزرسانی شد');
    loadData();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>;
  }

  if (!store) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>ایجاد غرفه</CardTitle>
              <CardDescription>
                شما هنوز غرفه‌ای ندارید. برای شروع فروش، ابتدا غرفه خود را ایجاد کنید.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => setStoreDialogOpen(true)}>
                <Plus className="ml-2 h-5 w-5" />
                ایجاد غرفه جدید
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <StoreFormDialog
          open={storeDialogOpen}
          onOpenChange={setStoreDialogOpen}
          ownerId={user?.id || ''}
          onSuccess={loadData}
        />
        
        <Footer />
      </div>
    );
  }

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">پنل غرفه‌دار</h1>
            <p className="text-muted-foreground">
              مدیریت غرفه {store.name}
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
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-muted-foreground">محصولات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <ShoppingBag className="h-6 w-6 text-secondary" />
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
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">در انتظار</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald/10">
                  <Store className="h-6 w-6 text-emerald" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalRevenue.toLocaleString('fa-IR')}
                  </p>
                  <p className="text-sm text-muted-foreground">درآمد (تومان)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" dir="rtl" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">سفارشات</TabsTrigger>
            <TabsTrigger value="products">محصولات</TabsTrigger>
            <TabsTrigger value="store">تنظیمات غرفه</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">هنوز سفارشی ندارید</p>
                  <p className="text-muted-foreground">
                    سفارشات شما در اینجا نمایش داده می‌شود
                  </p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          سفارش #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <span className={`font-bold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مبلغ:</span>
                        <span className="font-bold">
                          {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">آدرس:</span>
                        <span className="text-left max-w-xs truncate">
                          {order.addresses?.full_address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تلفن:</span>
                        <span dir="ltr">{order.addresses?.phone}</span>
                      </div>
                      {order.notes && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground">یادداشت:</span>
                          <p className="mt-1">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex-1"
                        >
                          تایید سفارش
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="flex-1"
                        >
                          لغو سفارش
                        </Button>
                      </div>
                    )}

                    {order.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="w-full"
                      >
                        ثبت تحویل
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Button onClick={handleAddProduct}>
              <Plus className="ml-2 h-4 w-4" />
              افزودن محصول جدید
            </Button>

            {products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">هنوز محصولی ندارید</p>
                  <p className="text-muted-foreground">
                    محصولات خود را اضافه کنید تا مشتریان بتوانند آن‌ها را خریداری کنند
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    {product.image_url && (
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-primary">
                          {Number(product.price).toLocaleString('fa-IR')} تومان
                        </span>
                        <span className="text-sm text-muted-foreground">
                          موجودی: {product.stock}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="ml-1 h-3 w-3" />
                            ویرایش
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="flex-1"
                            onClick={() => setDeleteProductId(product.id)}
                          >
                            حذف
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => {
                            setSelectedProductForFeatures(product);
                            setFeaturesDialogOpen(true);
                          }}
                        >
                          <Settings2 className="ml-1 h-3 w-3" />
                          مدیریت ویژگی‌ها
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات غرفه</CardTitle>
                <CardDescription>مشاهده و ویرایش اطلاعات غرفه</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">نام غرفه</label>
                  <p className="text-lg font-medium">{store.name}</p>
                </div>
                {store.description && (
                  <div>
                    <label className="text-sm text-muted-foreground">توضیحات</label>
                    <p className="text-lg">{store.description}</p>
                  </div>
                )}
                {store.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">تلفن</label>
                    <p className="text-lg" dir="ltr">{store.phone}</p>
                  </div>
                )}
                {store.address && (
                  <div>
                    <label className="text-sm text-muted-foreground">آدرس</label>
                    <p className="text-lg">{store.address}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-muted-foreground">وضعیت</label>
                  <p className="text-lg">
                    {store.is_active ? (
                      <span className="text-emerald">فعال</span>
                    ) : (
                      <span className="text-destructive">غیرفعال</span>
                    )}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setStoreDialogOpen(true)}>
                  <Edit className="ml-2 h-4 w-4" />
                  ویرایش اطلاعات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <ProductFormDialog
          open={productDialogOpen}
          onOpenChange={setProductDialogOpen}
          product={selectedProduct}
          storeId={store?.id || ''}
          onSuccess={loadData}
        />
        
        <StoreFormDialog
          open={storeDialogOpen}
          onOpenChange={setStoreDialogOpen}
          store={store}
          ownerId={user?.id || ''}
          onSuccess={loadData}
        />

        {selectedProductForFeatures && (
          <ProductFeaturesDialog
            open={featuresDialogOpen}
            onOpenChange={setFeaturesDialogOpen}
            productId={selectedProductForFeatures.id}
            productName={selectedProductForFeatures.name}
            onSuccess={loadData}
          />
        )}
        
        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription>
                این عملیات قابل بازگشت نیست. محصول به طور کامل حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct}>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
