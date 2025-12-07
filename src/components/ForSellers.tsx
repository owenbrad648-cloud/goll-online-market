import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Package, Smartphone, Zap } from "lucide-react";
import flowersShop from "@/assets/flowers-shop.jpg";

const sellerFeatures = [
  {
    icon: Package,
    title: "مدیریت محصولات",
    description: "افزودن و ویرایش آسان محصولات با عکس و توضیحات کامل"
  },
  {
    icon: BarChart3,
    title: "داشبورد فروش",
    description: "مشاهده آمار و نمودارهای فروش به صورت لحظه‌ای"
  },
  {
    icon: Smartphone,
    title: "اپلیکیشن موبایل",
    description: "مدیریت غرفه از هر کجا با اپ اندروید و iOS"
  },
  {
    icon: Zap,
    title: "اعلان فوری",
    description: "اطلاع سریع از سفارشات جدید و پیام‌های مشتریان"
  }
];

const ForSellers = () => {
  return (
    <section id="sellers" className="py-20 lg:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-emerald-light/20 blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-emerald border-4 border-background">
              <img 
                src={flowersShop} 
                alt="غرفه گل فروشی" 
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                برای <span className="text-gradient-hero">غرفه‌داران</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                پلتفرمی حرفه‌ای برای گسترش کسب‌وکار و افزایش فروش
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {sellerFeatures.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-secondary/50 transition-colors">
                  <CardContent className="p-4 space-y-2">
                    <feature.icon className="h-5 w-5 text-secondary" />
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" variant="secondary" className="shadow-emerald">
                شروع فروش
              </Button>
              <Button size="lg" variant="outline">
                مشاهده راهنما
              </Button>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 border-2 border-secondary/20">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-bold text-foreground">نکته:</span> ثبت‌نام و راه‌اندازی غرفه کاملاً رایگان است. 
                فقط از فروش‌های موفق کمیسیون دریافت می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSellers;
