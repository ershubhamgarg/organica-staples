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
    id: "org-khapli-aata-01",
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
    id: "org-multi-khapli-02",
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
    id: "org-diabetes-aata-03",
    name: "Diabetes Care Aata",
    description:
      "Specially formulated with a low glycemic index, combining Khapli wheat, roasted Bengal gram (chana), barley, and methi seeds. It helps manage blood sugar spikes without compromising on the taste and softness of your daily meals.",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1561016428-f6e07b8b7a86?auto=format&fit=crop&q=80&w=1000",
    category: "Flour & Grains",
    origin: "Madhya Pradesh, India",
    weight: "1 kg",
    benefits: ["Regulates Blood Sugar", "High Satiety", "Diabetic Friendly"],
  },
  {
    id: "org-coconut-oil-04",
    name: "Cold Pressed Coconut Oil",
    description:
      "Extracted from sun-dried, premium copras without using heat, our virgin coconut oil retains its vital nutrients, medium-chain triglycerides (MCTs), and natural tropical aroma. Perfect for cooking, baking, or wellness rituals.",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1611078028045-81206f4948a3?auto=format&fit=crop&q=80&w=1000",
    category: "Oils & Ghee",
    origin: "Kerala, India",
    weight: "500 ml",
    benefits: ["Rich in MCTs", "Boosts Immunity", "Unrefined & Pure"],
  },
  {
    id: "org-mustard-oil-05",
    name: "Cold Pressed Mustard Oil",
    description:
      "Wood-pressed (Kachi Ghani) from native black mustard seeds to preserve its pungent flavor and robust nutritional profile. Rich in monounsaturated fats, it adds an authentic, earthy punch to traditional Indian curries.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=1000",
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
    id: "org-lakadong-turmeric-06",
    name: "Lakadong Turmeric Powder",
    description:
      "Sourced directly from the pristine hills of Meghalaya, Lakadong turmeric is celebrated for its exceptionally high curcumin content (7-9%). A vibrant, aromatic spice with potent anti-inflammatory and medicinal benefits.",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1615485934520-222a3615568f?auto=format&fit=crop&q=80&w=1000",
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
    id: "org-unpolished-dal-07",
    name: "Unpolished Mixed Pulses",
    description:
      "A wholesome mix of native, unpolished dals including Toor, Moong, Masoor, and Chana. Unpolished means they retain their natural dietary fiber and essential nutrients that are otherwise lost during commercial polishing.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1585996872517-380d321d585d?auto=format&fit=crop&q=80&w=1000",
    category: "Pulses & Dals",
    origin: "Gujarat, India",
    weight: "1 kg",
    benefits: ["100% Unpolished", "High in Plant Protein", "Rich in Folate"],
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
