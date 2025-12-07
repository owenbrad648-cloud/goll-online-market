import { Button } from "@/components/ui/button";
import { Flower2, Instagram, Send, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Flower2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gradient-hero">گل‌کده</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              بازار آنلاین فروش گل و گیاه
              <br />
              اتصال مستقیم غرفه‌داران و خریداران
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <Send className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">درباره ما</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">تماس با ما</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">قوانین و مقررات</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">سوالات متداول</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">خدمات</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">ثبت‌نام غرفه‌دار</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">راهنمای خرید</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">شیوه‌های پرداخت</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">پشتیبانی</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">ارتباط با ما</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                تهران، بازار بزرگ گل
                <br />
                کد پستی: ۱۴۳۵۷۸۹۶۳۲
              </p>
              <p dir="ltr" className="text-left font-mono">۰۲۱-۱۲۳۴۵۶۷۸</p>
              <p className="font-mono">info@golkadeh.ir</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© ۱۴۰۳ گل‌کده. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
