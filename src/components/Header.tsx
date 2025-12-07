import { Button } from "@/components/ui/button";
import { Flower2, Menu, ShoppingBag, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { user, isAdmin, isSeller } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('خطا در خروج');
    } else {
      toast.success('با موفقیت خارج شدید');
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Flower2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-hero">گل‌کده</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              محصولات
            </Link>
            <Link to="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              ویژگی‌ها
            </Link>
            <Link to="#sellers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              برای فروشندگان
            </Link>
            <Link to="#buyers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              برای خریداران
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingBag className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {getTotalItems()}
              </Badge>
            )}
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    پنل مدیریت
                  </DropdownMenuItem>
                )}
                {isSeller && (
                  <DropdownMenuItem onClick={() => navigate('/seller')}>
                    پنل غرفه‌دار
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/customer')}>
                  پنل مشتری
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="ml-2 h-4 w-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} className="hidden md:flex">
              ورود / ثبت‌نام
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
