import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  store_id: string;
  category: string | null;
  stores: {
    name: string;
  };
}

interface Store {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: "all", label: "همه دسته‌ها" },
  { value: "general", label: "عمومی" },
  { value: "flowers", label: "گل‌ها" },
  { value: "bouquets", label: "دسته گل" },
  { value: "plants", label: "گیاهان" },
  { value: "accessories", label: "لوازم جانبی" },
  { value: "gifts", label: "هدایا" },
];

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addItem } = useCart();

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching stores:", error);
      return;
    }

    setStores(data || []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select(`
        *,
        stores (
          name
        )
      `)
      .eq("is_available", true)
      .gt("stock", 0);

    if (selectedStore !== "all") {
      query = query.eq("store_id", selectedStore);
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        stores (
          name
        )
      `)
      .eq("is_available", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطا",
        description: "مشکلی در بارگذاری محصولات پیش آمد",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedStore]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore === "all" || product.store_id === selectedStore;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesStore && matchesCategory;
  });

  const addToCart = async (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "خطا",
        description: "موجودی این محصول به اتمام رسیده است",
        variant: "destructive",
      });
      return;
    }

    // Decrease stock in database
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

    // Update local state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      store_id: product.store_id,
      store_name: product.stores.name,
      max_stock: product.stock - 1,
    });

    toast({
      title: "افزوده شد",
      description: `${product.name} به سبد خرید اضافه شد`,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">کاتالوگ محصولات</h1>
          <p className="text-muted-foreground">محصولات تازه از غرفه‌های مختلف</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی محصول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="انتخاب دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="انتخاب غرفه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه غرفه‌ها</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">محصولی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {product.stores.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {product.price.toLocaleString("fa-IR")} تومان
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
    </MainLayout>
  );
};

export default Products;