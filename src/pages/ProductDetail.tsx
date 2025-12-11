import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Minus, Plus, ShoppingCart, Store, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
  store_id: string;
  stores: {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
  };
}

interface ProductFeature {
  id: string;
  feature_name: string;
  feature_value: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchFeatures();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        stores (id, name, description, logo_url)
      `)
      .eq("id", id)
      .eq("is_available", true)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "خطا",
        description: "محصول یافت نشد",
        variant: "destructive",
      });
      navigate("/products");
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const fetchFeatures = async () => {
    const { data } = await supabase
      .from("product_features")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: true });

    setFeatures(data || []);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast({
        title: "خطا",
        description: "موجودی این محصول به اتمام رسیده است",
        variant: "destructive",
      });
      return;
    }

    const addQuantity = Math.min(quantity, product.stock);

    // Decrease stock in database
    const { error } = await supabase
      .from("products")
      .update({ stock: product.stock - addQuantity })
      .eq("id", product.id);

    if (error) {
      toast({
        title: "خطا",
        description: "مشکلی در بروزرسانی موجودی پیش آمد",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setProduct((prev) =>
      prev ? { ...prev, stock: prev.stock - addQuantity } : null
    );

    await addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      store_id: product.store_id,
      store_name: product.stores.name,
      max_stock: product.stock - addQuantity,
      quantity: addQuantity,
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

  if (!product) {
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    تنها {product.stock} عدد باقی مانده
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="destructive">ناموجود</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-lg">
                {product.description || "بدون توضیحات"}
              </p>
            </div>

            <div className="text-4xl font-bold text-primary">
              {Number(product.price).toLocaleString("fa-IR")} تومان
            </div>

            <Separator />

            {/* Store Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="p-3 rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{product.stores.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.stores.description || "فروشگاه معتبر"}
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">تعداد:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  (موجودی: {product.stock})
                </span>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full text-lg py-6"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="ml-2 h-5 w-5" />
              {product.stock === 0 ? "ناموجود" : "افزودن به سبد خرید"}
            </Button>

            {/* Product Features */}
            {features.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">ویژگی‌های محصول</h3>
                  <div className="space-y-3">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <span className="text-muted-foreground">{feature.feature_name}</span>
                        <span className="font-medium">{feature.feature_value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
