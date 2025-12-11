import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface ProductFeature {
  id?: string;
  feature_name: string;
  feature_value: string;
  isNew?: boolean;
}

interface ProductFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSuccess?: () => void;
}

export const ProductFeaturesDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
  onSuccess,
}: ProductFeaturesDialogProps) => {
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && productId) {
      fetchFeatures();
    }
  }, [open, productId]);

  const fetchFeatures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_features")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("خطا در بارگذاری ویژگی‌ها");
    } else {
      setFeatures(data || []);
    }
    setLoading(false);
  };

  const handleAddFeature = () => {
    setFeatures([
      ...features,
      { feature_name: "", feature_value: "", isNew: true },
    ]);
  };

  const handleRemoveFeature = async (index: number) => {
    const feature = features[index];
    
    if (feature.id) {
      const { error } = await supabase
        .from("product_features")
        .delete()
        .eq("id", feature.id);

      if (error) {
        toast.error("خطا در حذف ویژگی");
        return;
      }
    }

    setFeatures(features.filter((_, i) => i !== index));
    toast.success("ویژگی حذف شد");
  };

  const handleUpdateFeature = (
    index: number,
    field: "feature_name" | "feature_value",
    value: string
  ) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  const handleSave = async () => {
    // Validate features
    const invalidFeatures = features.filter(
      (f) => !f.feature_name.trim() || !f.feature_value.trim()
    );

    if (invalidFeatures.length > 0) {
      toast.error("لطفاً همه فیلدها را پر کنید");
      return;
    }

    setSaving(true);

    try {
      // Update existing features
      const existingFeatures = features.filter((f) => f.id && !f.isNew);
      for (const feature of existingFeatures) {
        await supabase
          .from("product_features")
          .update({
            feature_name: feature.feature_name.trim(),
            feature_value: feature.feature_value.trim(),
          })
          .eq("id", feature.id);
      }

      // Insert new features
      const newFeatures = features.filter((f) => f.isNew || !f.id);
      if (newFeatures.length > 0) {
        await supabase.from("product_features").insert(
          newFeatures.map((f) => ({
            product_id: productId,
            feature_name: f.feature_name.trim(),
            feature_value: f.feature_value.trim(),
          }))
        );
      }

      toast.success("ویژگی‌ها ذخیره شد");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("خطا در ذخیره ویژگی‌ها");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مدیریت ویژگی‌های محصول</DialogTitle>
          <DialogDescription>
            ویژگی‌های {productName} را مدیریت کنید
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {features.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هنوز ویژگی‌ای اضافه نشده است
              </div>
            ) : (
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div
                    key={feature.id || `new-${index}`}
                    className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label className="text-xs">نام ویژگی</Label>
                        <Input
                          value={feature.feature_name}
                          onChange={(e) =>
                            handleUpdateFeature(index, "feature_name", e.target.value)
                          }
                          placeholder="مثال: رنگ"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">مقدار ویژگی</Label>
                        <Input
                          value={feature.feature_value}
                          onChange={(e) =>
                            handleUpdateFeature(index, "feature_value", e.target.value)
                          }
                          placeholder="مثال: قرمز"
                          maxLength={200}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 mt-6 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleAddFeature}
              className="w-full"
            >
              <Plus className="ml-2 h-4 w-4" />
              افزودن ویژگی جدید
            </Button>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                انصراف
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="ml-2 h-4 w-4" />
                )}
                ذخیره ویژگی‌ها
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
