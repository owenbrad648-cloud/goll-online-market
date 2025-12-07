import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { storeSchema, type StoreFormData } from "@/lib/validations";

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: any;
  ownerId: string;
  onSuccess: () => void;
}

export const StoreFormDialog = ({ open, onOpenChange, store, ownerId, onSuccess }: StoreFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || '',
    phone: store?.phone || '',
    address: store?.address || '',
    logo_url: store?.logo_url || ''
  });

  const validateForm = (): StoreFormData | null => {
    const result = storeSchema.safeParse(formData);
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
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        logo_url: validatedData.logo_url || null,
      };

      if (store) {
        const { error } = await supabase
          .from('stores')
          .update(data)
          .eq('id', store.id);

        if (error) throw error;
        toast.success('غرفه با موفقیت ویرایش شد');
      } else {
        const { error } = await supabase
          .from('stores')
          .insert([{ ...data, owner_id: ownerId }]);

        if (error) throw error;
        toast.success('غرفه با موفقیت ایجاد شد');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'خطا در ذخیره غرفه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{store ? 'ویرایش غرفه' : 'ایجاد غرفه جدید'}</DialogTitle>
          <DialogDescription>
            اطلاعات غرفه را وارد کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">نام غرفه</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="نام غرفه"
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
              placeholder="توضیحات غرفه"
              rows={3}
              maxLength={1000}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>
          <div>
            <Label htmlFor="phone">شماره تماس</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09123456789"
              dir="ltr"
              maxLength={11}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="آدرس غرفه"
              rows={2}
              maxLength={500}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>
          <div>
            <Label htmlFor="logo_url">لینک لوگو</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.jpg"
              dir="ltr"
              maxLength={500}
              className={errors.logo_url ? "border-destructive" : ""}
            />
            {errors.logo_url && <p className="text-sm text-destructive mt-1">{errors.logo_url}</p>}
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
