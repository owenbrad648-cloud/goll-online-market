import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addressSchema, type AddressFormData } from "@/lib/validations";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: any;
  userId: string;
  onSuccess: () => void;
}

export const AddressFormDialog = ({ open, onOpenChange, address, userId, onSuccess }: AddressFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: address?.title || '',
    full_address: address?.full_address || '',
    phone: address?.phone || '',
    postal_code: address?.postal_code || '',
    is_default: address?.is_default || false
  });

  const validateForm = (): AddressFormData | null => {
    const result = addressSchema.safeParse(formData);
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
      if (validatedData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      if (address) {
        const { error } = await supabase
          .from('addresses')
          .update({
            title: validatedData.title,
            full_address: validatedData.full_address,
            phone: validatedData.phone,
            postal_code: validatedData.postal_code || null,
            is_default: validatedData.is_default || false,
          })
          .eq('id', address.id);

        if (error) throw error;
        toast.success('آدرس با موفقیت ویرایش شد');
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert([{
            title: validatedData.title,
            full_address: validatedData.full_address,
            phone: validatedData.phone,
            postal_code: validatedData.postal_code || null,
            is_default: validatedData.is_default || false,
            user_id: userId
          }]);

        if (error) throw error;
        toast.success('آدرس با موفقیت اضافه شد');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'خطا در ذخیره آدرس');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{address ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}</DialogTitle>
          <DialogDescription>
            اطلاعات آدرس خود را وارد کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان آدرس</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: منزل، محل کار"
              maxLength={50}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <Label htmlFor="full_address">آدرس کامل</Label>
            <Textarea
              id="full_address"
              value={formData.full_address}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              placeholder="آدرس کامل را وارد کنید"
              rows={3}
              maxLength={500}
              className={errors.full_address ? "border-destructive" : ""}
            />
            {errors.full_address && <p className="text-sm text-destructive mt-1">{errors.full_address}</p>}
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
            <Label htmlFor="postal_code">کد پستی</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="1234567890"
              dir="ltr"
              maxLength={10}
              className={errors.postal_code ? "border-destructive" : ""}
            />
            {errors.postal_code && <p className="text-sm text-destructive mt-1">{errors.postal_code}</p>}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_default">آدرس پیش‌فرض</Label>
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
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
