import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { menuItems as defaultMenuItems, reviews as defaultReviews } from "./src/data";

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber?: string;
  address?: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customization?: string;
  }[];
  subtotal: number;
  gst: number;
  packagingCharge: number;
  discountAmount: number;
  appliedCoupon?: string;
  grandTotal: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "New Order" | "Accepted" | "Preparing" | "Ready" | "Out For Delivery" | "Delivered" | "Cancelled";
  createdAt: string;
  paymentMethod?: string;
  totalAmount?: number;
}

const STORE_PATH = path.join(process.cwd(), "db-store.json");

// JWT Validation Check
function isAuthorizedAdmin(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  if (!token) return false;
  
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (payload.sub === "webrajya_pos_admin_id") {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

const defaultInventory = [
  { id: "i1", name: "Premium Basmati Rice", stock: 120, unit: "kg", minAlertLevel: 30, category: "Dry Goods", lastRestocked: "2026-06-10" },
  { id: "i2", name: "Fresh Paneer (Cottage Cheese)", stock: 8, unit: "kg", minAlertLevel: 15, category: "Dairy", lastRestocked: "2026-06-14" },
  { id: "i3", name: "Fermented Dosa Batter", stock: 12, unit: "Litre", minAlertLevel: 20, category: "Dry Goods", lastRestocked: "2026-06-15" },
  { id: "i4", name: "Potatoes (Sourced Red)", stock: 85, unit: "kg", minAlertLevel: 25, category: "Vegetables", lastRestocked: "2026-06-12" },
  { id: "i5", name: "Red Tomatoes", stock: 10, unit: "kg", minAlertLevel: 20, category: "Vegetables", lastRestocked: "2026-06-14" },
  { id: "i6", name: "Soya Chaap Skewers", stock: 45, unit: "units", minAlertLevel: 15, category: "Dry Goods", lastRestocked: "2026-06-12" },
  { id: "i7", name: "Pure Cow Ghee", stock: 24, unit: "kg", minAlertLevel: 10, category: "Dairy", lastRestocked: "2026-06-11" },
  { id: "i8", name: "Wholewheat Atta / Flour", stock: 150, unit: "kg", minAlertLevel: 40, category: "Dry Goods", lastRestocked: "2026-06-08" },
  { id: "i9", name: "Mozzarella Grated Cheese", stock: 6, unit: "kg", minAlertLevel: 12, category: "Dairy", lastRestocked: "2026-06-13" },
  { id: "i10", name: "Eco Packaging boxes", stock: 320, unit: "units", minAlertLevel: 100, category: "Packaging", lastRestocked: "2026-06-09" }
];

const defaultCoupons = [
  { code: "WEBRAJYA20", type: "percentage", value: 20, expiryDate: "2200-12-31", usageLimit: 500, usageCount: 0, minOrderAmount: 250 },
  { code: "WELCOME50", type: "fixed", value: 50, expiryDate: "2200-06-30", usageLimit: 1000, usageCount: 0, minOrderAmount: 150 },
  { code: "CHEFGIFT", type: "percentage", value: 15, expiryDate: "2026-08-31", usageLimit: 100, usageCount: 0, minOrderAmount: 300 }
];

const defaultSettings = {
  name: "WEBRAJYA POS",
  contactNumber: "+91 92095 21933",
  whatsappNumber: "+919209521933",
  address: "Shop No. G-3, Shivpuja Apartment, Plot No. 50, Beside Trimurti Nagar Bus Stop, Mankapur Ring Road, Subhash Nagar, Trimurti Nagar, Nagpur, Maharashtra 440022",
  businessHours: "Mon-Thu: 7:00 AM - 10:30 PM | Fri-Sat: 7:00 AM - 10:00 PM | Sun: 7:00 AM - 10:30 PM",
  deliveryCharges: 25,
  gstPercentage: 5,
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com/webrajya.pos",
  twitterUrl: "https://twitter.com",
  googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.0772718136367!2d77.1082!3d28.6322!2m3!1f0!2f0!3f0!3m2!1i1248!2i786!4m2!3m1!1s0x0%3A0x0!2zMjgmdW5pcXVl!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
};

const defaultAuditLogs = [
  { id: "log-1", timestamp: new Date().toISOString(), user: "Admin (owner)", action: "System Initialized", details: "Local database initialized clean. Ready for real orders.", ipAddress: "127.0.0.1" }
];

function readDb() {
  if (!fs.existsSync(STORE_PATH)) {
    const freshDb = {
      orders: [],
      menuItems: defaultMenuItems,
      inventory: defaultInventory,
      coupons: defaultCoupons,
      reviews: defaultReviews,
      settings: defaultSettings,
      auditLogs: defaultAuditLogs
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(freshDb, null, 2), "utf-8");
    return freshDb;
  }
  try {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Database file parse failure, resetting store...", err);
    const freshDb = {
      orders: [],
      menuItems: defaultMenuItems,
      inventory: defaultInventory,
      coupons: defaultCoupons,
      reviews: defaultReviews,
      settings: defaultSettings,
      auditLogs: defaultAuditLogs
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(freshDb, null, 2), "utf-8");
    return freshDb;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Database file write failure:", err);
  }
}

// Supabase cloud synchronization engine
async function syncOrderToSupabase(order: any, isUpdate = false) {
  const supabaseUrl = process.env.SUPABASE_URL || "https://uhvxkulqovkasewxfais.supabase.co";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_935p_1HOmvJr1p9dhFlb2g_zMA957jI";

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Supabase] Configuration is absent. Skipping cloud ledger write.");
    return;
  }

  // Map the application's React/Node schema into standard PostgreSQL lower snake_case schema columns
  const payload = {
    id: order.id,
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    email: order.email,
    order_type: order.orderType,
    table_number: order.tableNumber || null,
    address: order.address || null,
    items: order.items, // PostgREST handles objects/arrays for JSONB columns automatically
    subtotal: Number(order.subtotal || 0),
    gst: Number(order.gst || 0),
    packaging_charge: Number(order.packagingCharge || 0),
    discount_amount: Number(order.discountAmount || 0),
    applied_coupon: order.appliedCoupon || null,
    grand_total: Number(order.grandTotal || 0),
    payment_status: order.paymentStatus || "Pending",
    order_status: order.orderStatus || "New Order",
    created_at: order.createdAt || new Date().toISOString(),
    payment_method: order.paymentMethod || "Cash on Delivery"
  };

  const url = isUpdate 
    ? `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`
    : `${supabaseUrl}/rest/v1/orders`;

  const method = isUpdate ? "PATCH" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": isUpdate ? "return=minimal" : "return=representation"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Supabase PostgREST Error] HTTP ${response.status}: ${errorText}`);
      
      // Post a system warning in application's local audit logs
      try {
        const db = readDb();
        db.auditLogs.unshift({
          id: `log-sb-err-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: "System (Supabase)",
          action: "Supabase Sync Failure",
          details: `PostgREST API returned Status ${response.status}: ${errorText.substring(0, 150)}. Check if 'orders' table exists in dashboard with exact column schemas.`,
          ipAddress: "127.0.0.1"
        });
        writeDb(db);
      } catch (logErr) {
        console.error("Failed to update error logs in local memory store:", logErr);
      }
    } else {
      console.log(`[Supabase Integration] Successfully database synced Order ${order.id} via ${method}`);
      // Post a system success marker inside the application audit logs
      try {
        const db = readDb();
        db.auditLogs.unshift({
          id: `log-sb-ok-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: "System (Supabase)",
          action: "Supabase Sync Success",
          details: `Order reference ${order.id} successfully synchronized to Supabase PostgreSQL cloud via ${method}.`,
          ipAddress: "127.0.0.1"
        });
        writeDb(db);
      } catch (logErr) {
        console.error("Failed to commit success logs in local memory store:", logErr);
      }
    }
  } catch (err: any) {
    console.error("[Supabase Transport Network Error]", err);
    try {
      const db = readDb();
      db.auditLogs.unshift({
        id: `log-sb-conn-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: "System (Supabase)",
        action: "Supabase Connection Error",
        details: `Failed to open TCP transport link: ${err.message || err.toString()}`,
        ipAddress: "127.0.0.1"
      });
      writeDb(db);
    } catch (logErr) {
      console.error("Failed to register transport error log:", logErr);
    }
  }
}

// Supabase registered restaurants helpers
async function fetchRestaurantsFromSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://uhvxkulqovkasewxfais.supabase.co";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_935p_1HOmvJr1p9dhFlb2g_zMA957jI";
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/restaurants`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      return await res.json();
    }
    console.error("Failed to fetch restaurants from Supabase", await res.text());
    return [];
  } catch (err) {
    console.error("Error fetching restaurants from Supabase", err);
    return [];
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // REST API: AUTHENTICATION & REGISTRATION GATEWAYS
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Check Super Admin access (superadmin@webrajyapos.com / super123 or password123)
    const isSuperAdminEmail = emailLower === "superadmin@webrajyapos.com";
    const isSuperAdminPassword = password === "super123" || password === "password123";

    if (isSuperAdminEmail && isSuperAdminPassword) {
      const payload = btoa(JSON.stringify({ 
        sub: "webrajya_pos_superadmin_id", 
        role: "SuperAdmin", 
        email: emailLower 
      }));
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const mockSignature = "r9U_63r-9saV_77f_93n-c";
      const token = `${header}.${payload}.${mockSignature}`;
      return res.json({ token, role: "SuperAdmin", email: emailLower });
    }

    // 2. Check Developer Master credentials
    const isMasterEmail = emailLower === "admin@webrajyapos.com";
    const isMasterPassword = password === "admin123" || password === "password123";

    if (isMasterEmail && isMasterPassword) {
      const payload = btoa(JSON.stringify({ 
        sub: "webrajya_pos_admin_id", 
        role: "Owner", 
        email: emailLower 
      }));
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const mockSignature = "r9U_63r-9saV_77f_93n-c";
      const token = `${header}.${payload}.${mockSignature}`;
      return res.json({ token, role: "Owner", email: emailLower });
    }

    // 3. Check registered restaurants table
    const db = readDb();
    if (!db.restaurants) {
      db.restaurants = [];
    }

    let matchedRest: any = null;

    // Check with live Supabase first
    const supabaseUrl = process.env.SUPABASE_URL || "https://uhvxkulqovkasewxfais.supabase.co";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_935p_1HOmvJr1p9dhFlb2g_zMA957jI";
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/restaurants?email=eq.${encodeURIComponent(emailLower)}`, {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const sbResults = await response.json();
        if (sbResults && sbResults.length > 0) {
          const r = sbResults[0];
          const rPasskey = r.passkey || r.password;
          if (String(rPasskey) === String(password)) {
            matchedRest = {
              id: r.id,
              name: r.name || r.restaurant_name,
              email: r.email,
              phone: r.phone || r.contact_number,
              address: r.address
            };
          }
        }
      }
    } catch (err) {
      console.warn("[Supabase Auth Query Exception, falling back to local list]:", err);
    }

    // Fallback to local file db
    if (!matchedRest) {
      const localMatch = db.restaurants.find(
        (r: any) => r.email.toLowerCase() === emailLower && String(r.passkey) === String(password)
      );
      if (localMatch) {
        matchedRest = localMatch;
      }
    }

    if (matchedRest) {
      const payload = btoa(JSON.stringify({ 
        sub: `restaurant_${matchedRest.id}`, 
        role: "Owner", 
        email: matchedRest.email,
        restaurant_id: matchedRest.id,
        restaurant_name: matchedRest.name
      }));
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const mockSignature = "r9U_63r-9saV_77f_93n-c";
      const token = `${header}.${payload}.${mockSignature}`;

      return res.json({ 
        token, 
        role: "Owner", 
        email: matchedRest.email,
        restaurant: matchedRest
      });
    }

    return res.status(401).json({ 
      error: "Invalid cryptographic credentials. Please verify your registered email and secure passkey." 
    });
  });

  app.get("/api/restaurants", async (req, res) => {
    const supabaseUrl = process.env.SUPABASE_URL || "https://uhvxkulqovkasewxfais.supabase.co";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_935p_1HOmvJr1p9dhFlb2g_zMA957jI";
    
    const db = readDb();
    if (!db.restaurants) {
      db.restaurants = [];
      writeDb(db);
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/restaurants`, {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const sbRestaurants = await response.json();
        console.log("[Supabase Sync] Fetched restaurants list:", sbRestaurants);
        const merged = [...db.restaurants];
        sbRestaurants.forEach((r: any) => {
          if (!merged.some((m: any) => m.id === r.id)) {
            merged.push({
              id: r.id,
              name: r.name || r.restaurant_name,
              email: r.email,
              passkey: r.passkey || r.password,
              phone: r.phone || r.contact_number,
              address: r.address,
              createdAt: r.created_at || r.createdAt
            });
          }
        });
        db.restaurants = merged;
        writeDb(db);
        return res.json(merged);
      } else {
        const errText = await response.text();
        console.warn("[Supabase Restaurants Query Failed, returning local fallback]:", errText);
        return res.json(db.restaurants);
      }
    } catch (err) {
      console.error("[Supabase Restaurants Query Exception]:", err);
      return res.json(db.restaurants);
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    const { name, email, passkey, phone, address } = req.body;
    
    if (!name || !email || !passkey) {
      return res.status(400).json({ error: "Restaurant Name, Email, and Passkey are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const db = readDb();
    if (!db.restaurants) {
      db.restaurants = [];
    }

    if (db.restaurants.some((r: any) => r.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: "A restaurant with this email is already registered." });
    }

    const newId = `rest-${Date.now()}`;
    const newRestaurantLocal = {
      id: newId,
      name,
      email: emailLower,
      passkey,
      phone: phone || "",
      address: address || "",
      createdAt: new Date().toISOString()
    };

    // Prepare a highly compatible, double-mapped dual-column schema payload for PostgREST
    const sbPayload = {
      id: newId,
      name: name,
      restaurant_name: name,
      email: emailLower,
      passkey: passkey,
      password: passkey,
      phone: phone || "",
      contact_number: phone || "",
      address: address || "",
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const supabaseUrl = process.env.SUPABASE_URL || "https://uhvxkulqovkasewxfais.supabase.co";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_935p_1HOmvJr1p9dhFlb2g_zMA957jI";

    try {
      console.log("[Supabase Restaurant Registering] Posting payload to PostgREST:", sbPayload);
      const response = await fetch(`${supabaseUrl}/rest/v1/restaurants`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(sbPayload)
      });

      if (response.ok) {
        console.log("[Supabase Restaurant Registration Success]");
        db.restaurants.push(newRestaurantLocal);
        db.auditLogs.unshift({
          id: `log-sb-rest-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: "Super Admin",
          action: "Restaurant Registered",
          details: `Restaurant "${name}" (${emailLower}) successfully registered and synced with Supabase.`,
          ipAddress: "127.0.0.1"
        });
        writeDb(db);
        return res.status(201).json({ status: "success", restaurant: newRestaurantLocal });
      } else {
        const errText = await response.text();
        console.error("[Supabase Restaurant Write Error]:", errText);
        // Fallback to local store
        db.restaurants.push(newRestaurantLocal);
        db.auditLogs.unshift({
          id: `log-sb-rest-err-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: "Super Admin",
          action: "Restaurant Local-Only Register",
          details: `Restaurant "${name}" registered locally, but Supabase rejected write: ${errText.substring(0, 100)}`,
          ipAddress: "127.0.0.1"
        });
        writeDb(db);
        return res.status(201).json({ 
          status: "success", 
          restaurant: newRestaurantLocal, 
          warning: "Registered locally. Supabase error: " + errText 
        });
      }
    } catch (err: any) {
      console.error("[Supabase Restaurant Connection Error]:", err);
      // Fallback to local store
      db.restaurants.push(newRestaurantLocal);
      writeDb(db);
      return res.status(201).json({ 
        status: "success", 
        restaurant: newRestaurantLocal, 
        warning: "Registered locally. Connection fails: " + err.message 
      });
    }
  });

  // REST API: ORDERS SECTION
  app.get("/api/orders", (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized access to order logs. System authentication required." });
    }
    const db = readDb();
    res.json(db.orders);
  });

  app.post("/api/orders", (req, res) => {
    try {
      const db = readDb();
      const orderData = req.body;

      // 1. Inputs validation
      if (!orderData.customerName || typeof orderData.customerName !== "string" || !orderData.customerName.trim()) {
        return res.status(400).json({ error: "Customer name is blank or missing. Please state valid checkout identity." });
      }
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ error: "Shopping cart selection is empty. Order rejected." });
      }

      // 1b. Table QR Validation for Dine-In
      if (orderData.orderType === "dine-in") {
        if (!orderData.tableNumber) {
          return res.status(400).json({ error: "Missing Table Number: Dine-In checkout requires a scanned table QR source." });
        }
        const validTables = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        if (!validTables.includes(orderData.tableNumber)) {
          return res.status(400).json({ error: `Invalid QR Code Source: Table number #${orderData.tableNumber} is not registered in our dining area.` });
        }
      }

      // 2. Duplicate Check
      const now = Date.now();
      const isDuplicate = db.orders.find((o: any) => {
        const orderTime = new Date(o.createdAt).getTime();
        const isRecent = (now - orderTime) < 30000; // 30 seconds debounce window
        const isSameCustomer = o.customerName === orderData.customerName.trim() && 
                               o.phoneNumber === orderData.phoneNumber;
        const isSameTotal = Math.abs(o.grandTotal - orderData.grandTotal) < 1;
        return isRecent && isSameCustomer && isSameTotal;
      });

      if (isDuplicate) {
        return res.status(200).json({ status: "success", order: isDuplicate, duplicate: true });
      }

      // 3. Serialized Unique Order ID Sequence
      const ordersCount = db.orders.length;
      const orderId = `SR-${1000 + ordersCount + Math.floor(Math.random() * 900 + 100)}`;

      const newOrder: Order = {
        ...orderData,
        id: orderId,
        createdAt: new Date().toISOString(),
        orderStatus: orderData.orderStatus || "New Order",
        paymentStatus: orderData.paymentStatus || "Pending",
        paymentMethod: orderData.paymentMethod || "Cash on Delivery",
        totalAmount: orderData.grandTotal
      };

      db.orders.unshift(newOrder); // New order on top
      writeDb(db);

      // Trigger asynchronous Supabase synchronization in the background to ensure blazing fast checkout
      syncOrderToSupabase(newOrder, false).catch(e => {
        console.error("Critical: Supabase background sync failed to invoke", e);
      });

      res.status(201).json({ status: "success", order: newOrder });
    } catch (err) {
      console.error("Failed to store client order:", err);
      res.status(500).json({ error: "Internal Database error. Failed to commit order ledger." });
    }
  });

  app.put("/api/orders/:id/status", (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ error: "Order status is required" });
    }

    const db = readDb();
    const idx = db.orders.findIndex((o: any) => o.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Order record not found" });
    }

    db.orders[idx].orderStatus = orderStatus;
    if (paymentStatus) {
      db.orders[idx].paymentStatus = paymentStatus;
    } else {
      // Auto assign payment states on standard progression
      if (orderStatus === "Cancelled") {
        db.orders[idx].paymentStatus = "Failed";
      } else if (orderStatus === "Delivered" || orderStatus === "Ready") {
        db.orders[idx].paymentStatus = "Paid";
      }
    }

    // Record Audit Logs
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "Admin",
      action: "Order Modified",
      details: `Order ID: ${id} status altered to: ${orderStatus}`,
      ipAddress: "127.0.0.1"
    });

    writeDb(db);

    // Trigger asynchronous Supabase update status sync in the background
    syncOrderToSupabase(db.orders[idx], true).catch(e => {
      console.error("Critical: Supabase background update status sync failed to invoke", e);
    });

    res.json({ success: true, order: db.orders[idx] });
  });

  // REST API: MENU ITEMS SECTION
  app.get("/api/menu-items", (req, res) => {
    const db = readDb();
    res.json(db.menuItems);
  });

  app.post("/api/menu-items", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    const newItem = req.body;
    db.menuItems.push(newItem);
    writeDb(db);
    res.json({ success: true, item: newItem });
  });

  app.put("/api/menu-items", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    db.menuItems = req.body;
    writeDb(db);
    res.json({ success: true });
  });

  // REST API: INVENTORY SECTION
  app.get("/api/inventory", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    res.json(db.inventory);
  });

  app.put("/api/inventory", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    db.inventory = req.body;
    writeDb(db);
    res.json({ success: true });
  });

  // REST API: COUPONS SECTION
  app.get("/api/coupons", (req, res) => {
    const db = readDb();
    res.json(db.coupons);
  });

  app.put("/api/coupons", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    db.coupons = req.body;
    writeDb(db);
    res.json({ success: true });
  });

  // REST API: REVIEWS SECTION
  app.get("/api/reviews", (req, res) => {
    const db = readDb();
    res.json(db.reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const db = readDb();
    const newReview = req.body;
    db.reviews.unshift(newReview);
    writeDb(db);
    res.json({ success: true, review: newReview });
  });

  app.put("/api/reviews", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    db.reviews = req.body;
    writeDb(db);
    res.json({ success: true });
  });

  // REST API: SETTINGS SECTION
  app.get("/api/settings", (req, res) => {
    const db = readDb();
    res.json(db.settings);
  });

  app.post("/api/settings", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(451).json({ error: "Unauthorized" });
    const db = readDb();
    db.settings = req.body;
    writeDb(db);
    res.json({ success: true });
  });

  // REST API: AUDIT LOGS SECTION
  app.get("/api/audit-logs", (req, res) => {
    if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    res.json(db.auditLogs);
  });

  app.post("/api/audit-logs", (req, res) => {
    const db = readDb();
    const { action, details, user } = req.body;
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user || "System",
      action,
      details,
      ipAddress: "127.0.0.1"
    };
    db.auditLogs.unshift(newLog);
    writeDb(db);
    res.json({ success: true, log: newLog });
  });

  // Vite Integration Entrypoints
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Database Server Engine] Initiated cleanly on port ${PORT}`);
  });
}

startServer();
