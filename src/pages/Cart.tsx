import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { orderNotesSchema } from "@/lib/validations";

interface Address {
  id: string;
  title: string;
  full_address: string;
  phone: string;
}

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return;
    }

    setAddresses(data || []);
    if (data && data.length > 0) {
      setSelectedAddress(data[0].id);
    }
  };

  const groupByStore = () => {
    const grouped: { [key: string]: typeof items } = {};
    items.forEach((item) => {
      if (!grouped[item.store_id]) {
        grouped[item.store_id] = [];
      }
      grouped[item.store_id].push(item);
    });
    return grouped;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا وارد شوید",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedAddress) {
      toast({
        title: "خطا",
        description: "لطفاً یک آدرس را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "خطا",
        description: "سبد خرید شما خالی است",
        variant: "destructive",
      });
      return;
    }

    // Validate notes
    const notesResult = orderNotesSchema.safeParse(notes);
    if (!notesResult.success) {
      setNotesError(notesResult.error.errors[0]?.message || "خطای اعتبارسنجی");
      toast({
        title: "خطا",
        description: "توضیحات نامعتبر است",
        variant: "destructive",
      });
      return;
    }
    setNotesError("");

    setLoading(true);

    try {
      const groupedItems = groupByStore();

      for (const [storeId, storeItems] of Object.entries(groupedItems)) {
        const totalAmount = storeItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            customer_id: user.id,
            store_id: storeId,
            address_id: selectedAddress,
            total_amount: totalAmount,
            notes: notes || null,
            status: "pending",
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Get store owner ID and create notification
        const { data: store } = await supabase
          .from('stores')
          .select('owner_id, name')
          .eq('id', storeId)
          .single();

        if (store) {
          await supabase.from('notifications').insert({
            user_id: store.owner_id,
            title: 'سفارش جدید',
            message: `سفارش جدیدی از ${storeItems.length} محصول در غرفه ${store.name} ثبت شد`,
            type: 'new_order',
            related_order_id: order.id,
          });
        }

        const orderItems = storeItems.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      clearCart();
      toast({
        title: "موفقیت",
        description: "سفارش شما با موفقیت ثبت شد",
      });
      navigate("/customer");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "خطا",
        description: "مشکلی در ثبت سفارش پیش آمد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">سبد خرید شما خالی است</h2>
            <p className="text-muted-foreground mb-8">محصولاتی به سبد خرید خود اضافه کنید</p>
            <Button onClick={() => navigate("/products")}>
              مشاهده محصولات
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const groupedItems = groupByStore();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">سبد خرید</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([storeId, storeItems]) => (
              <Card key={storeId}>
                <CardHeader>
                  <CardTitle>{storeItems[0].store_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {storeItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            بدون تصویر
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString("fa-IR")} تومان
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-16 text-center h-8"
                            min={1}
                            max={item.max_stock}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.max_stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 mr-auto"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">
                          {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>اطلاعات سفارش</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    انتخاب آدرس
                  </label>
                  {addresses.length > 0 ? (
                    <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                      <SelectTrigger>
                        <SelectValue placeholder="آدرس را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            {address.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      آدرسی ثبت نشده است.{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => navigate("/customer")}
                      >
                        افزودن آدرس
                      </Button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    توضیحات (اختیاری)
                  </label>
                  <Textarea
                    placeholder="توضیحات خود را وارد کنید..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={notesError ? "border-destructive" : ""}
                  />
                  {notesError && <p className="text-sm text-destructive mt-1">{notesError}</p>}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">تعداد کل محصولات</span>
                    <span className="font-medium text-foreground">
                      {getTotalItems().toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">مجموع</span>
                    <span className="text-foreground">
                      {getTotalPrice().toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={loading || !selectedAddress || items.length === 0}
                >
                  {loading ? "در حال ثبت..." : "تکمیل سفارش"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;