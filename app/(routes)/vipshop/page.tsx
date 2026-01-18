import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Glory RP - VIP Shop",
  description: "Purchase VIP packages for Glory RP including dealers, villas, gangs, and more.",
};

export default function VipShopPage() {
  return (
    <main className="relative w-full min-h-[100svh] bg-[#170930] text-white font-[Poppins,sans-serif]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:pt-28 md:pt-32">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">
            VIP Shop
          </h1>
          <p className="mt-3 text-base text-white/80">
            Explore exclusive VIP options and apply for your custom package.
          </p>
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
              {item.price1 && (
                <p className="text-[#bbb] text-sm mt-1" dir="ltr">
                  {item.price1}
                </p>
              )}
              
              {item.price2 && (
                <p className="text-[#bbb] text-sm" dir="ltr">
                  {item.price2.startsWith("+") ? (
                    <>
                      <span className="text-white font-semibold">+</span>{" "}
                      {item.price2.replace("+", "").trim()}
                    </>
                  ) : (
                    item.price2
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-center text-sm text-[#aaa] my-6 px-4">
          To purchase VIP, please fill the form in the link below.
        </p>
        <p className="text-center text-sm text-[#aaa] my-6 px-4">
          No changes or refunds are accepted after purchase.
        </p>
        

        {/* Discord Button */}
        <div className="flex justify-center">
          <Link
            href="/tickets/vip"
            className="bg-[#bb47e6] hover:bg-[#5b6eae] text-white text-lg px-8 py-3 rounded-md mb-6 transition-colors duration-200"
          >
            Open Form
          </Link>
        </div>
      </div>
    </main>
  );
}

const VIP_ITEMS = [
  { name: "Car Dealer", image: "/images/cardealer1.jpg", price1: "$150 Per Season", price2: "or $30 Monthly", soldOut: false },
  { name: "Moto Dealer", image: "/images/motodealer.jpg", price1: "$150 Per Season", price2: "or $30 Monthly", soldOut: false },
  { name: "Boats Dealer", image: "/images/cardealer2.jpg", price1: "$150 Per Season", price2: "or $30 Monthly", soldOut: false },
  { name: "Villa", image: "/images/villa.jpg", price1: "$75 Per Season", price2: "or $20 Monthly", soldOut: false },
  { name: "Bike", image: "/images/bike.jpg", price1: "$40-50 Per Season", price2: "or $15-25 Monthly", soldOut: false },
  { name: "Car", image: "/images/car.jpg", price1: "$40-50 Per Season", price2: "or $15-25 Monthly", soldOut: false },

  {
    name: "Gang (2 Cars + Villa)",
    image: "/images/gang.jpg",
    price1: "First payment $100",
    price2: "& $20 Monthly",
    soldOut: false
  },

  { name: "Supermarket", image: "/images/supermarket.jpg", price1: "$15-30 Monthly (Depends on location)", soldOut: false },
  { name: "Gas Station", image: "/images/gasstation.jpg", price1: "$20-50 Monthly (Depends on location)", soldOut: false },

  {
    name: "Mechanic",
    image: "/images/mechanic.jpg",
    price1: "First payment $100",
    price2: "& $15 Monthly",
    soldOut: false
  },

  {
    name: "Restaurant",
    image: "/images/restaurant.jpg",
    price1: "First payment $50",
    price2: "& $10 Monthly",
    soldOut: false
  },

  {
    name: "Casino",
    image: "/images/casino.jpg",
    price1: "First payment $200",
    price2: "& $40 Monthly",
    soldOut: false
  },

  { name: "Third Character", image: "/images/secondchar.jpg", price1: "$10 Per Month", soldOut: false },
  { name: "Personal Garage", image: "/images/garage.jpeg", price1: "$10 Per Month", soldOut: false },
  { name: "Personal Plate", image: "/images/plate.jpeg", price1: "$10 Per Month", soldOut: false },
  { name: "Personal Sim Number", image: "/images/sim.jpeg", price1: "$10 Per Month", soldOut: false },
];

