import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ForSellers from "@/components/ForSellers";
import ForBuyers from "@/components/ForBuyers";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <ForSellers />
        <ForBuyers />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
