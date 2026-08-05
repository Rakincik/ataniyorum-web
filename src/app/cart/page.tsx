import Navbar from "@/components/Navbar";
import CartClient from "@/components/CartClient";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="pt-8 lg:pt-12 px-4 md:px-8 max-w-6xl mx-auto">
        <CartClient />
      </div>
    </main>
  );
}
