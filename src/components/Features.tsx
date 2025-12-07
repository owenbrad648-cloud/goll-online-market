import { Card, CardContent } from "@/components/ui/card";
import { Shield, Truck, CreditCard, Headphones, Store, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "غرفه مجازی",
    description: "غرفه آنلاین اختصاصی با امکانات کامل برای مدیریت محصولات و سفارشات",
    color: "text-primary"
  },
  {
    icon: CreditCard,
    title: "پرداخت امن",
    description: "درگاه پرداخت معتبر با امنیت بالا و پشتیبانی از تمام کارت‌های بانکی",
    color: "text-secondary"
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    description: "سیستم مدیریت ارسال هوشمند با امکان انتخاب زمان و آدرس دلخواه",
    color: "text-accent"
  },
  {
    icon: Shield,
    title: "تضمین کیفیت",
    description: "کنترل کیفیت محصولات و ضمانت بازگشت وجه در صورت عدم رضایت",
    color: "text-primary"
  },
  {
    icon: Headphones,
    title: "پشتیبانی ۲۴/۷",
    description: "تیم پشتیبانی همیشه در دسترس برای پاسخگویی به سوالات شما",
    color: "text-secondary"
  },
  {
    icon: TrendingUp,
    title: "گزارش‌دهی پیشرفته",
    description: "داشبورد تحلیلی کامل با نمودارها و آمار فروش لحظه‌ای",
    color: "text-accent"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            <span className="text-gradient-accent">ویژگی‌های</span> پلتفرم
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            امکانات پیشرفته برای تجربه‌ای بی‌نظیر در خرید و فروش آنلاین گل
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-soft group"
            >
              <CardContent className="p-6 space-y-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-background to-muted group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
