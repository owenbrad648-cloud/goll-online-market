import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-flowers.jpg";
import FloatingParticles from "./FloatingParticles";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden">
      <FloatingParticles />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="container relative py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">بازار آنلاین گل و گیاه</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient-hero">گل‌کده</span>
              <br />
              <span className="text-foreground">بازار دیجیتال</span>
              <br />
              <span className="text-foreground">گل و گیاه</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              اتصال مستقیم غرفه‌داران بازار گل با خریداران در سراسر ایران. 
              خرید آسان، ارسال سریع، کیفیت تضمین‌شده.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg shadow-rose hover:shadow-rose/50 transition-all" onClick={() => navigate("/products")}>
                شروع خرید
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg">
                ثبت‌نام غرفه‌دار
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">۵۰۰+</div>
                <div className="text-sm text-muted-foreground">غرفه فعال</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-secondary">۱۰۰۰+</div>
                <div className="text-sm text-muted-foreground">خریدار راضی</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-accent">۲۴/۷</div>
                <div className="text-sm text-muted-foreground">پشتیبانی</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-rose border-4 border-background">
              <img 
                src={heroImage} 
                alt="بازار گل" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
