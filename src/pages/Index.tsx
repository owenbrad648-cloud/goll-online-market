import MainLayout from "@/components/layouts/MainLayout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ForSellers from "@/components/ForSellers";
import ForBuyers from "@/components/ForBuyers";

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <ForSellers />
      <ForBuyers />
    </MainLayout>
  );
};

export default Index;
