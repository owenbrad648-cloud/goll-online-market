import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, MapPin, Phone, Calendar, Package, ShoppingCart, Eye, Store as StoreIcon } from "lucide-react";

interface Store {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
  store_id: string;
}

const StoreDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStore();
      fetchProducts();
    }
  }, [id]);

  const fetchStore = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "خطا",
        description: "غرفه یافت نشد",
        variant: "destructive",
      });
      navigate("/products");
      return;
    }

    setStore(data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", id)
      .eq("is_available", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  const addToCart = async (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "خطا",
        description: "موجودی این محصول به اتمام رسیده است",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ stock: product.stock - 1 })
      .eq("id", product.id);

    if (error) {
      toast({
        title: "خطا",
        description: "مشکلی در بروزرسانی موجودی پیش آمد",
        variant: "destructive",
      });
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
    );

    await addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      store_id: product.store_id,
      store_name: store?.name || "فروشگاه",
      max_stock: product.stock - 1,
    });

    toast({
      title: "افزوده شد",
      description: `${product.name} به سبد خرید اضافه شد`,
    });
  };

  const getCategoryLabel = (category: string | null) => {
    const categories: Record<string, string> = {
      general: "عمومی",
      flowers: "گل‌ها",
      bouquets: "دسته گل",
      plants: "گیاهان",
      accessories: "لوازم جانبی",
      gifts: "هدایا",
    };
    return categories[category || "general"] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">در حال بارگذاری...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          بازگشت به محصولات
        </Button>

        {/* Store Header */}
        <div className="bg-gradient-to-l from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-2xl bg-background flex items-center justify-center overflow-hidden shadow-lg">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <StoreIcon className="h-12 w-12 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-muted-foreground text-lg mb-4">
                  {store.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                {store.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{store.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>عضویت از {formatDate(store.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Package className="h-4 w-4 ml-2" />
                {products.length} محصول
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">محصولات غرفه</h2>

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">محصولی موجود نیست</p>
                <p className="text-muted-foreground">
                  این غرفه در حال حاضر محصول موجودی ندارد
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="aspect-square relative bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        بدون تصویر
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    {product.category && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        {getCategoryLabel(product.category)}
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {Number(product.price).toLocaleString("fa-IR")} تومان
                      </span>
                      <span className="text-sm text-muted-foreground">
                        موجودی: {product.stock.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      <ShoppingCart className="ml-2 h-4 w-4" />
                      افزودن به سبد خرید
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoreDetail;
