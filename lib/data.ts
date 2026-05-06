export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  origin: string;
  weight: string;
  benefits: string[];
}

export const products: Product[] = [
  {
    id: "0",
    name: "Khapli Whole Wheat Aata",
    description:
      "Traditionally stone-ground from ancient Emmer wheat (Khapli), our whole wheat aata retains its natural bran and germ. Known for its low glycemic index, it makes soft, easily digestible rotis while offering a naturally sweet, nutty flavor.",
    price: 180,
    image: "https://healthymiller.com/cdn/shop/files/KHAPLIATTA.png",
    category: "Flour & Grains",
    origin: "Maharashtra, India",
    weight: "1 kg",
    benefits: ["Low GI", "Rich in Dietary Fiber", "Easy to Digest"],
  },
  {
    id: "1",
    name: "Multigrain Khapli Aata",
    description:
      "A nourishing blend of ancient Khapli wheat with organic millets like Ragi, Jowar, and Bajra. This fiber-rich flour creates wholesome, rustic flatbreads that provide sustained energy throughout the day.",
    price: 210,
    image:
      "https://cdn.shopify.com/s/files/1/0662/0073/1832/files/Multigrain_Khapli_Atta_Buy.png?v=1756360989",
    category: "Flour & Grains",
    origin: "Karnataka, India",
    weight: "1 kg",
    benefits: [
      "High Protein",
      "Complex Carbohydrates",
      "Packed with Micronutrients",
    ],
  },

  {
    id: "2",
    name: "Cold Pressed Coconut Oil",
    description:
      "Extracted from sun-dried, premium copras without using heat, our virgin coconut oil retains its vital nutrients, medium-chain triglycerides (MCTs), and natural tropical aroma. Perfect for cooking, baking, or wellness rituals.",
    price: 450,
    image:
      "https://img.freepik.com/free-photo/jug-coconut-oil-whit-coconut-put-dark-background_1150-28252.jpg?semt=ais_hybrid&w=740&q=80",
    category: "Oils & Ghee",
    origin: "Kerala, India",
    weight: "500 ml",
    benefits: ["Rich in MCTs", "Boosts Immunity", "Unrefined & Pure"],
  },
  {
    id: "3",
    name: "Cold Pressed Mustard Oil",
    description:
      "Wood-pressed (Kachi Ghani) from native black mustard seeds to preserve its pungent flavor and robust nutritional profile. Rich in monounsaturated fats, it adds an authentic, earthy punch to traditional Indian curries.",
    price: 280,
    image:
      "https://www.tastingtable.com/img/gallery/everything-you-need-to-know-about-mustard-oil/intro-1664635121.jpg",
    category: "Oils & Ghee",
    origin: "Rajasthan, India",
    weight: "1 L",
    benefits: [
      "Heart Healthy MUFA",
      "Antibacterial Properties",
      "Authentic Aroma",
    ],
  },
  {
    id: "4",
    name: "Lakadong Turmeric Powder",
    description:
      "Sourced directly from the pristine hills of Meghalaya, Lakadong turmeric is celebrated for its exceptionally high curcumin content (7-9%). A vibrant, aromatic spice with potent anti-inflammatory and medicinal benefits.",
    price: 350,
    image:
      "https://www.greendna.in/cdn/shop/files/turmeric_lak_1200x.jpg?v=1748618768",
    category: "Spices",
    origin: "Meghalaya, India",
    weight: "250 g",
    benefits: [
      "High Curcumin (7-9%)",
      "Potent Anti-inflammatory",
      "Boosts Immunity",
    ],
  },
  {
    id: "5",
    name: "Unpolished Mixed Pulses",
    description:
      "A wholesome mix of native, unpolished dals including Toor, Moong, Masoor, and Chana. Unpolished means they retain their natural dietary fiber and essential nutrients that are otherwise lost during commercial polishing.",
    price: 220,
    image:
      "https://media.istockphoto.com/id/659524906/photo/composition-with-variety-of-vegetarian-food-ingredients.jpg?s=612x612&w=0&k=20&c=AzFdpJXWAVArpzTxJxhUqCENYcYb2ozltPhYaYJAkFQ=",
    category: "Pulses & Dals",
    origin: "Gujarat, India",
    weight: "1 kg",
    benefits: ["100% Unpolished", "High in Plant Protein", "Rich in Folate"],
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
