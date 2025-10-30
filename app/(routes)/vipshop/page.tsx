import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Glory RP - VIP Shop",
  description: "Purchase VIP packages for Glory RP including dealers, villas, gangs, and more.",
};

export default function VipShopPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[#170930] text-white font-[Poppins,sans-serif]">
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-4xl font-extrabold text-[#b841e4]">
          VIP Shop
        </h1>
      </header>

      {/* VIP Cards */}
      <div className="flex flex-wrap justify-center gap-6 max-w-[1200px] mx-auto p-5">
        {VIP_ITEMS.map((item) => (
          <div
            key={item.name}
            className="relative bg-[#1a1a1a] border border-[#bb47e6] rounded-xl p-4 w-[250px] text-center transition-transform duration-300 hover:scale-105"
          >
            {item.soldOut && (
              <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-md">
                SOLD OUT
              </span>
            )}
            <Image
              src={item.image}
              alt={item.name}
              width={250}
              height={150}
              className="w-full h-[150px] object-cover rounded-md mb-3"
            />
            <h2 className="text-lg font-semibold">{item.name}</h2>
            {item.price1 && <p className="text-[#bbb] text-sm mt-1">{item.price1}</p>}
            {item.price2 && <p className="text-[#bbb] text-sm">{item.price2}</p>}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-[#aaa] my-6 px-4">
        To purchase VIP, please fill the form in the link below.
      </p>

      {/* Discord Button */}
      <Link
        href="/tickets/vip"
        className="bg-[#7289da] hover:bg-[#5b6eae] text-white text-lg px-8 py-3 rounded-md mb-6 transition-colors duration-200"
      >
        Open Form
      </Link>

      {/* Footer */}
      <footer className="mt-auto py-6 text-[#555] text-xs">
        © 2025 Glory RP. All rights reserved.
      </footer>
    </main>
  );
}

const VIP_ITEMS = [
  { name: "Car Dealer", image: "/images/cardealer1.jpg", price1: "$150 Per Season", price2: "$25 Monthly" },
  { name: "Moto Dealer", image: "/images/motodealer.jpg", price1: "$150 Per Season", price2: "$25 Monthly" },
  { name: "Boats Dealer", image: "/images/cardealer2.jpg", price1: "$150 Per Season", price2: "$25 Monthly" },
  { name: "Villa", image: "/images/villa.jpg", price1: "$75 Per Season", price2: "$15 Monthly" },
  { name: "Bike", image: "/images/bike.jpg", price1: "$40 Per Season", price2: "$5 Monthly" },
  { name: "Car", image: "/images/car.jpg", price1: "$40 Per Season", price2: "$5 Monthly" },
  { name: "Gang (6 Cars + Villa)", image: "/images/gang.jpg", price1: "$100 First Payment + $20 Monthly" },
  { name: "Supermarket", image: "/images/supermarket.jpg", price1: "$10 Monthly" },
  { name: "Gas Station", image: "/images/gasstation.jpg", price1: "$50" },
  { name: "Mechanic", image: "/images/mechanic.jpg", price1: "$100 First Payment + $15 Monthly", soldOut: true },
  { name: "Restaurant", image: "/images/restaurant.jpg", price1: "$50 First Payment + $10 Monthly" },
  { name: "Casino", image: "/images/casino.jpg", price1: "$300 First Payment + $20 Monthly" },
  { name: "Second Character", image: "/images/secondchar.jpg", price1: "$5 Per Season" },
];
