import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flower2 } from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email("فرمت ایمیل نامعتبر است").max(255, "ایمیل حداکثر ۲۵۵ کاراکتر"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").max(128, "رمز عبور حداکثر ۱۲۸ کاراکتر")
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100, "نام حداکثر ۱۰۰ کاراکتر"),
  email: z.string().trim().email("فرمت ایمیل نامعتبر است").max(255, "ایمیل حداکثر ۲۵۵ کاراکتر"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").max(128, "رمز عبور حداکثر ۱۲۸ کاراکتر"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمزهای عبور یکسان نیستند",
  path: ["confirmPassword"]
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(result.data.email, result.data.password);
      
      if (error) {
        toast.error('خطا در ورود', {
          description: error.message === 'Invalid login credentials' 
            ? 'ایمیل یا رمز عبور اشتباه است' 
            : error.message
        });
      } else {
        toast.success('با موفقیت وارد شدید');
        navigate('/');
      }
    } catch (error) {
      toast.error('خطای غیرمنتظره');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = signupSchema.safeParse(signupForm);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        result.data.email, 
        result.data.password,
        result.data.fullName
      );
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('این ایمیل قبلاً ثبت شده است');
        } else {
          toast.error('خطا در ثبت‌نام', { description: error.message });
        }
      } else {
        toast.success('ثبت‌نام موفق', {
          description: 'حساب کاربری شما ایجاد شد'
        });
        navigate('/');
      }
    } catch (error) {
      toast.error('خطای غیرمنتظره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-rose">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Flower2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient-hero">
            گل‌کده
          </CardTitle>
          <CardDescription>
            ورود یا ثبت‌نام در پلتفرم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">ورود</TabsTrigger>
              <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">ایمیل</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">رمز عبور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'در حال ورود...' : 'ورود'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="نام کامل شما"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">ایمیل</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">رمز عبور</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="حداقل ۶ کاراکتر"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">تکرار رمز عبور</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">
            با ثبت‌نام، قوانین و مقررات را می‌پذیرید
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
