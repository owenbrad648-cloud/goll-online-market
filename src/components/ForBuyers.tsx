import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Heart, MapPin, Search } from "lucide-react";
import delivery from "@/assets/delivery.jpg";

const buyerFeatures = [
  {
    icon: Search,
    title: "جستجوی آسان",
    description: "یافتن سریع گل موردنظر با فیلترهای پیشرفته"
  },
  {
    icon: Heart,
    title: "علاقه‌مندی‌ها",
    description: "ذخیره محصولات مورد علاقه برای خرید بعدی"
  },
  {
    icon: MapPin,
    title: "انتخاب آدرس",
    description: "ثبت چندین آدرس و انتخاب محل تحویل"
  },
  {
    icon: Clock,
    title: "زمان‌بندی دقیق",
    description: "تعیین زمان دقیق دریافت سفارش"
  }
];

const ForBuyers = () => {
  return (
    <section id="buyers" className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                برای <span className="text-gradient-accent">خریداران</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                خرید آسان، سریع و مطمئن با بهترین قیمت
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {buyerFeatures.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-accent/50 transition-colors">
                  <CardContent className="p-4 space-y-2">
                    <feature.icon className="h-5 w-5 text-accent" />
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-muted-foreground">تضمین کیفیت و تازگی گل‌ها</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <p className="text-muted-foreground">پرداخت امن با درگاه معتبر</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-muted-foreground">ارسال سریع در تهران و شهرستان‌ها</p>
              </div>
            </div>

            <Button size="lg" className="shadow-rose">
              مشاهده محصولات
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-soft border-4 border-background">
              <img 
                src={delivery} 
                alt="ارسال گل" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBuyers;
