import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { productSchema, type ProductFormData } from "@/lib/validations";

const CATEGORIES = [
  { value: "general", label: "عمومی" },
  { value: "flowers", label: "گل‌ها" },
  { value: "bouquets", label: "دسته گل" },
  { value: "plants", label: "گیاهان" },
  { value: "accessories", label: "لوازم جانبی" },
  { value: "gifts", label: "هدایا" },
];

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  storeId: string;
  onSuccess: () => void;
}

export const ProductFormDialog = ({ open, onOpenChange, product, storeId, onSuccess }: ProductFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    image_url: product?.image_url || '',
    is_available: product?.is_available ?? true,
    category: product?.category || 'general'
  });

  const validateForm = (): ProductFormData | null => {
    const dataToValidate = {
      ...formData,
      price: formData.price ? Number(formData.price) : 0,
      stock: formData.stock ? Number(formData.stock) : 0,
    };

    const result = productSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validatedData = validateForm();
    if (!validatedData) {
      toast.error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }

    setLoading(true);

    try {
      const data = {
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        stock: validatedData.stock,
        image_url: validatedData.image_url || null,
        is_available: validatedData.is_available ?? true,
        store_id: storeId,
        category: formData.category
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('محصول با موفقیت ویرایش شد');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data]);

        if (error) throw error;
        toast.success('محصول با موفقیت اضافه شد');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'خطا در ذخیره محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? 'ویرایش محصول' : 'افزودن محصول جدید'}</DialogTitle>
          <DialogDescription>
            اطلاعات محصول را وارد کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">نام محصول</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="نام محصول"
              maxLength={100}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات محصول"
              rows={3}
              maxLength={1000}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">قیمت (تومان)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                max="1000000000"
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="stock">موجودی</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                min="0"
                max="1000000"
                className={errors.stock ? "border-destructive" : ""}
              />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">دسته‌بندی</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="image_url">لینک تصویر</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
                maxLength={500}
                className={errors.image_url ? "border-destructive" : ""}
              />
              {errors.image_url && <p className="text-sm text-destructive mt-1">{errors.image_url}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_available">موجود برای فروش</Label>
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
