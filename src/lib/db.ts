import { MenuItem, Review, Category } from "./types";

// ---------------------------------------------------------------------------
// Categories
// IDs here MUST match the ids referenced across the codebase
// (src/lib/db.ts, AdminDashboard.tsx, BulkMenuImporter.tsx, MobileView.tsx)
// ---------------------------------------------------------------------------
export const categories: Category[] = [
  { id: "idli", name: "Idli", icon: "🍚", description: "Steamed rice & lentil cakes" },
  { id: "dosa", name: "Dosa", icon: "🥞", description: "Crispy fermented rice & lentil crepes" },
  { id: "uttapam", name: "Uttapam", icon: "🫓", description: "Thick savoury rice pancakes" },
  { id: "soups", name: "Soups", icon: "🍲", description: "Hot & comforting starter soups" },
  { id: "papad-snacks", name: "Papad & Snacks", icon: "🍘", description: "Light bites and crispy snacks" },
  { id: "salads", name: "Salads", icon: "🥗", description: "Fresh and healthy salads" },
  { id: "momos", name: "Momos", icon: "🥟", description: "Steamed and fried Indo-Chinese dumplings" },
  { id: "burgers", name: "Burgers", icon: "🍔", description: "Loaded veg & non-veg burgers" },
  { id: "pizza", name: "Pizza", icon: "🍕", description: "Wood-fired stone-baked pizzas" },
  { id: "chinese", name: "Chinese", icon: "🥢", description: "Indo-Chinese favourites" },
  { id: "main-course", name: "Main Course", icon: "🍛", description: "Rich curries and gravies" },
  { id: "milkshakes", name: "Milkshakes", icon: "🥤", description: "Thick and creamy milkshakes" },
  { id: "mocktails", name: "Mocktails", icon: "🍹", description: "Refreshing non-alcoholic mocktails" },
  { id: "tea-coffee", name: "Tea & Coffee", icon: "☕", description: "Hot beverages" },
  { id: "refreshers", name: "Refreshers", icon: "🧊", description: "Cold refreshing drinks" },
  { id: "desserts", name: "Desserts", icon: "🍨", description: "Sweet and delicious desserts to finish" },
];

// ---------------------------------------------------------------------------
// Menu Items
// ---------------------------------------------------------------------------
export const menuItems: MenuItem[] = [
  // --- Idli ---
  {
    id: "s1", itemCode: "SR-ID-01", category: "idli", name: "Steamed Idli",
    description: "Two light, fluffy steamed fermented rice and black-lentil cakes, served with piping hot sambar.",
    price: 90, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 128, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s2", itemCode: "SR-ID-03", category: "idli", name: "Tawa Idli",
    description: "Idli cubes pan-roasted on a hot tawa with diced tomatoes, onions, capsicum, and gun-powder spices.",
    price: 130, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600",
    rating: 4.8, ratingCount: 96, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Dosa ---
  {
    id: "s3", itemCode: "SR-DOS-01", category: "dosa", name: "Plain Dosa",
    description: "Classic golden wafer-thin rice and lentil crepe. Served with piping hot sambar and chutney.",
    price: 110, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 210, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s4", itemCode: "SR-DOS-02", category: "dosa", name: "Masala Dosa",
    description: "Vibrant golden crispy crepe stuffed with a tempered potato-and-onion mash.",
    price: 140, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
    rating: 4.9, ratingCount: 342, isBestseller: true, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s5", itemCode: "SR-DOS-04", category: "dosa", name: "Mysore Dosa",
    description: "Crispy crepe coated inside with a fiery red garlic-lentil chutney, stuffed with potato masala.",
    price: 160, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
    rating: 4.9, ratingCount: 187, isBestseller: false, isChefSpecial: true, spiciness: 2,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s6", itemCode: "SR-DOS-05", category: "dosa", name: "Rava Dosa",
    description: "Crispy lace-thin semolina-rice crepe seasoned with peppercorns, cumin, and green ginger.",
    price: 150, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
    rating: 4.5, ratingCount: 88, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Uttapam ---
  {
    id: "s7", itemCode: "SR-UTT-01", category: "uttapam", name: "Onion Uttapam",
    description: "Thick, fluffy savoury rice pancake topped with fresh diced onions and coriander.",
    price: 130, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1589301773859-448a55dbb926?auto=format&fit=crop&q=80&w=600",
    rating: 4.5, ratingCount: 64, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s8", itemCode: "SR-UTT-02", category: "uttapam", name: "Mixed Veg Uttapam",
    description: "Savoury rice pancake loaded with capsicum, tomato, onion, and carrot.",
    price: 150, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1589301773859-448a55dbb926?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 52, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Soups ---
  {
    id: "s9", itemCode: "SR-SOU-01", category: "soups", name: "Veg Hot & Sour Soup",
    description: "A fiery-tangy oriental soup packed with minced vegetables, mushrooms, and coriander.",
    price: 140, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&q=80&w=600",
    rating: 4.8, ratingCount: 145, isBestseller: true, isChefSpecial: false, spiciness: 2,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s10", itemCode: "SR-SOU-02", category: "soups", name: "Veg Manchow Soup",
    description: "Garlic-infused broth packed with finely diced vegetables, topped with crispy noodles.",
    price: 150, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 77, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Papad & Snacks ---
  {
    id: "s11", itemCode: "SR-PAP-01", category: "papad-snacks", name: "Roasted Papad",
    description: "Thin, crispy lentil flatbread dry-roasted on open fire — the perfect meal starter.",
    price: 40, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    rating: 4.4, ratingCount: 40, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s12", itemCode: "SR-PAP-02", category: "papad-snacks", name: "Masala Papad",
    description: "Roasted papad topped with finely chopped onions, tomatoes, and tangy spices.",
    price: 60, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    rating: 4.5, ratingCount: 34, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Salads ---
  {
    id: "s13", itemCode: "SR-SAL-01", category: "salads", name: "Kachumber Salad",
    description: "Refreshing chopped cucumber, tomato, onion salad tossed in lemon and rock salt.",
    price: 90, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
    rating: 4.3, ratingCount: 29, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Momos ---
  {
    id: "s14", itemCode: "SR-MOM-01", category: "momos", name: "Steamed Veg Momos",
    description: "Delicate dumplings stuffed with finely minced vegetables, served with spicy chutney.",
    price: 130, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 156, isBestseller: true, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s15", itemCode: "SR-MOM-02", category: "momos", name: "Fried Paneer Momos",
    description: "Crispy fried dumplings stuffed with spiced grated paneer and herbs.",
    price: 160, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 98, isBestseller: false, isChefSpecial: false, spiciness: 2,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Burgers ---
  {
    id: "s16", itemCode: "SR-BUR-01", category: "burgers", name: "Classic Veg Burger",
    description: "A crisp vegetable patty layered with lettuce, tomato, and tangy mayo in a soft bun.",
    price: 150, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    rating: 4.5, ratingCount: 112, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s17", itemCode: "SR-BUR-02", category: "burgers", name: "Paneer Tikka Burger",
    description: "Smoky tandoori paneer patty with mint mayo and fresh onion rings.",
    price: 180, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 90, isBestseller: false, isChefSpecial: true, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Pizza ---
  {
    id: "s18", itemCode: "SR-PIZ-01", category: "pizza", name: "Margherita Pizza",
    description: "Wood-fired classic topped with mozzarella, fresh basil, and tangy tomato sauce.",
    price: 220, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600",
    rating: 4.8, ratingCount: 176, isBestseller: true, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s19", itemCode: "SR-PIZ-02", category: "pizza", name: "Farmhouse Pizza",
    description: "Loaded with capsicum, onion, tomato, sweet corn, and mushroom on a cheesy base.",
    price: 260, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 102, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Chinese ---
  {
    id: "s20", itemCode: "SR-CHI-01", category: "chinese", name: "Veg Hakka Noodles",
    description: "Stir-fried noodles tossed with julienned vegetables and classic Indo-Chinese sauces.",
    price: 170, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 133, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s21", itemCode: "SR-CHI-02", category: "chinese", name: "Chilli Paneer",
    description: "Crispy paneer cubes tossed in a spicy soy-chilli glaze with onions and capsicum.",
    price: 210, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 118, isBestseller: true, isChefSpecial: false, spiciness: 2,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Main Course ---
  {
    id: "s22", itemCode: "SR-MAI-01", category: "main-course", name: "Paneer Butter Masala",
    description: "Soft paneer cubes simmered in a rich, creamy tomato-butter gravy.",
    price: 240, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600",
    rating: 4.9, ratingCount: 264, isBestseller: true, isChefSpecial: true, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s23", itemCode: "SR-MAI-02", category: "main-course", name: "Dal Makhani",
    description: "Slow-cooked black lentils finished with cream and a tempering of ghee spices.",
    price: 200, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600",
    rating: 4.8, ratingCount: 201, isBestseller: false, isChefSpecial: false, spiciness: 1,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s24", itemCode: "SR-MAI-03", category: "main-course", name: "Veg Biryani",
    description: "Fragrant basmati rice layered and dum-cooked with mixed vegetables and whole spices.",
    price: 220, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 189, isBestseller: false, isChefSpecial: false, spiciness: 2,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Milkshakes ---
  {
    id: "s25", itemCode: "SR-MLK-01", category: "milkshakes", name: "Cold Coffee",
    description: "Chilled blended coffee with milk, sugar, and a scoop of vanilla ice cream.",
    price: 140, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 87, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s26", itemCode: "SR-MLK-02", category: "milkshakes", name: "Chocolate Milkshake",
    description: "Thick and creamy milkshake blended with rich chocolate syrup and ice cream.",
    price: 150, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 104, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Mocktails ---
  {
    id: "s27", itemCode: "SR-MOC-01", category: "mocktails", name: "Virgin Mojito",
    description: "Refreshing lime and mint cooler topped with soda and crushed ice.",
    price: 130, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=600",
    rating: 4.6, ratingCount: 76, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Tea & Coffee ---
  {
    id: "s28", itemCode: "SR-TEA-01", category: "tea-coffee", name: "Masala Chai",
    description: "Robust Indian tea brewed with aromatic spices, cardamom, and fresh milk.",
    price: 40, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&q=80&w=600",
    rating: 4.7, ratingCount: 143, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s29", itemCode: "SR-TEA-02", category: "tea-coffee", name: "Filter Coffee",
    description: "Classic South Indian filter coffee, strong and frothy, served in traditional tumbler.",
    price: 50, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600",
    rating: 4.8, ratingCount: 122, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Refreshers ---
  {
    id: "s30", itemCode: "SR-REF-01", category: "refreshers", name: "Fresh Lime Soda",
    description: "Zesty lime juice topped with chilled soda — sweet, salted, or mixed.",
    price: 70, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&q=80&w=600",
    rating: 4.5, ratingCount: 61, isBestseller: false, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },

  // --- Desserts ---
  {
    id: "s31", itemCode: "SR-DES-01", category: "desserts", name: "Gulab Jamun",
    description: "Soft milk-solid dumplings soaked in fragrant rose and cardamom sugar syrup.",
    price: 90, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    rating: 4.8, ratingCount: 168, isBestseller: true, isChefSpecial: false, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
  {
    id: "s32", itemCode: "SR-DES-02", category: "desserts", name: "Choco Lava Cake",
    description: "Warm chocolate sponge cake with a rich, molten chocolate centre.",
    price: 140, isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600",
    rating: 4.9, ratingCount: 199, isBestseller: false, isChefSpecial: true, spiciness: 0,
    gstPercent: 5, hsnCode: "21069099", available: true,
  },
];

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export const reviews: Review[] = [
  {
    id: "r1", name: "Aarav Sharma", rating: 5, date: "2026-06-18",
    comment: "The Masala Dosa here is unbeatable — crispy, hot, and the chutneys are always fresh.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "r2", name: "Sneha Patel", rating: 4, date: "2026-06-15",
    comment: "Loved the Paneer Butter Masala. Delivery was quick and the food arrived hot.",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "r3", name: "Vikas Rajput", rating: 5, date: "2026-06-10",
    comment: "Best filter coffee in the area, hands down. Great ambience for dine-in too.",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: "r4", name: "Ananya Iyer", rating: 4, date: "2026-06-05",
    comment: "The momos were a bit spicier than expected but tasted amazing overall.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "r5", name: "Kabir Mehra", rating: 5, date: "2026-05-29",
    comment: "Ordered the Veg Biryani for a family dinner, everyone loved it. Will order again.",
    avatar: "https://i.pravatar.cc/150?img=51",
  },
];
