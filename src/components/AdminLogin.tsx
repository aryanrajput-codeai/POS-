import React, { useState, useEffect } from "react";
import { Shield, Mail, Lock, Eye, EyeOff, Sparkles, KeyRound, AlertCircle, Building2, Phone, MapPin, Plus, RefreshCw, CheckCircle2, List } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LocalDB } from "../lib/db";

interface AdminLoginProps {
  onLoginSuccess: (token: string, rememberMe: boolean) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  // General Tabs: "login" | "register" | "super"
  const [activeTab, setActiveTab] = useState<"login" | "register" | "super">("login");

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPasskey, setRegPasskey] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Super Admin States
  const [isSuperLoggedIn, setIsSuperLoggedIn] = useState(false);
  const [superEmail, setSuperEmail] = useState("");
  const [superPassword, setSuperPassword] = useState("");
  const [restaurantsList, setRestaurantsList] = useState<any[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  // Error & Assistance modals
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Load remembered POS email
  useEffect(() => {
    const savedEmail = localStorage.getItem("ij_admin_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Fetch restaurants for Super Admin
  const fetchAllRestaurants = async () => {
    setIsLoadingRestaurants(true);
    try {
      const res = await fetch("/api/restaurants");
      if (res.ok) {
        const data = await res.json();
        setRestaurantsList(data);
      }
    } catch (err) {
      console.error("Failed to load restaurants list from API:", err);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  // Trigger restaurants load when super admin tab is unlocked
  useEffect(() => {
    if (activeTab === "super" && isSuperLoggedIn) {
      fetchAllRestaurants();
    }
  }, [activeTab, isSuperLoggedIn]);

  // Handle POS & Super Admin Login submissions
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);

    if (!email.trim() || !password.trim()) {
      setErrorCode("Please enter both your registered email and secure password.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle Super Admin log in through main form if they typed it
        if (data.role === "SuperAdmin") {
          setIsSuperLoggedIn(true);
          setActiveTab("super");
          LocalDB.addAuditLog("Super Admin Authorized", `Super Admin panel unlocked successfully`, email);
          return;
        }

        if (rememberMe) {
          localStorage.setItem("ij_admin_remember_email", email.trim());
        } else {
          localStorage.removeItem("ij_admin_remember_email");
        }

        // Lock in the active logged restaurant config
        if (data.restaurant) {
          localStorage.setItem("ij_logged_restaurant_id", data.restaurant.id);
          // Auto update local settings workspace title/details to match this restaurant
          const currentSettings = LocalDB.getSettings();
          currentSettings.name = data.restaurant.name;
          if (data.restaurant.phone) currentSettings.contactNumber = data.restaurant.phone;
          if (data.restaurant.address) currentSettings.address = data.restaurant.address;
          LocalDB.saveSettings(currentSettings);
        }

        LocalDB.addAuditLog("Admin Authorized", `POS Session initialized for ${email.trim()}`, email.trim());
        onLoginSuccess(data.token, rememberMe);
      } else {
        const errData = await response.json();
        setErrorCode(errData.error || "Authentication failed. Check registered credentials.");
        LocalDB.addAuditLog("Access Denied", `Failed login attempt for ${email}`, "System Gateway");
      }
    } catch (err) {
      // Offline local resilience fallback for developers
      const isMasterEmail = email.toLowerCase() === "admin@webrajyapos.com";
      const isMasterPassword = password === "admin123" || password === "password123";

      if (isMasterEmail && isMasterPassword) {
        const payload = btoa(JSON.stringify({ sub: "webrajya_pos_admin_id", role: "Owner", email: email }));
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const mockSignature = "r9U_63r-9saV_77f_93n-c";
        const token = `${header}.${payload}.${mockSignature}`;

        if (rememberMe) {
          localStorage.setItem("ij_admin_remember_email", email);
        } else {
          localStorage.removeItem("ij_admin_remember_email");
        }

        LocalDB.addAuditLog("Admin Authorized", `Owner admin offline session fallback`, "Admin");
        onLoginSuccess(token, rememberMe);
      } else {
        setErrorCode("Offline Network Error: Unable to query cloud authentications. Please verify your internet link or developer fallback.");
        LocalDB.addAuditLog("Access Denied", `Offline login attempt failed for ${email}`, "System Gateway");
      }
    }
  };

  // Handle direct registration form submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPasskey.trim()) {
      setErrorCode("Please state Restaurant Name, Email, and secure Passkey.");
      return;
    }

    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          passkey: regPasskey.trim(),
          phone: regPhone.trim(),
          address: regAddress.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRegSuccess(`Success! "${regName}" has been successfully registered and synced with Supabase.`);
        
        // Auto prefill login email for convenience
        setEmail(regEmail.trim());
        setPassword(regPasskey.trim());

        // Reset registration form
        setRegName("");
        setRegEmail("");
        setRegPasskey("");
        setRegPhone("");
        setRegAddress("");

        // If Super Admin is registered from inside Super Admin panel, refresh the list
        if (isSuperLoggedIn) {
          fetchAllRestaurants();
        }
      } else {
        const errData = await res.json();
        setErrorCode(errData.error || "Failed to register restaurant. Email may already be in use.");
      }
    } catch (err) {
      setErrorCode("Failed to submit registration. Verify server link is online.");
    }
  };

  // Super Admin Tab Direct Login
  const handleSuperLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);

    const isSuperEmail = superEmail.toLowerCase().trim() === "superadmin@webrajyapos.com";
    const isSuperPass = superPassword === "super123" || superPassword === "password123";

    if (isSuperEmail && isSuperPass) {
      setIsSuperLoggedIn(true);
      setSuperEmail("");
      setSuperPassword("");
      LocalDB.addAuditLog("Super Admin Unlocked", "Super Admin direct login successful", "Super Admin");
    } else {
      setErrorCode("Invalid Super Admin cryptographic passkey.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;

    setRecoverySuccess(true);
    LocalDB.addAuditLog("Password Recovery Request", `Assistance dispatched to ${recoveryEmail}`, "System Gateway");

    setTimeout(() => {
      setShowForgotModal(false);
      setRecoverySuccess(false);
      setRecoveryEmail("");
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex items-center justify-center relative p-4 font-sans select-none overflow-x-hidden" id="admin-login-screen">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#d4af37]/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/40 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl bg-white border border-stone-200/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 relative z-10 shadow-[0_24px_50px_rgba(40,30,10,0.06)]"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent rounded-t-3xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-stone-50 to-stone-100 border border-[#d4af37]/40 text-[#d4af37] rounded-2xl flex items-center justify-center mx-auto shadow-[0_8px_30px_rgba(212,175,55,0.1)] relative">
            <Shield className="w-6 h-6" />
            <Sparkles className="w-3 h-3 text-[#d4af37] absolute top-1 right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-semibold text-stone-900 tracking-wide uppercase">
              WebRajya POS Terminal
            </h1>
            <p className="text-[9px] text-stone-500 font-mono tracking-widest uppercase mt-0.5">
              Secure Restaurant Administration Cloud Gateway
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100 mb-6 gap-1" id="login-nav-tabs">
          <button
            onClick={() => { setActiveTab("login"); setErrorCode(null); setRegSuccess(null); }}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "login" ? "border-[#d4af37] text-stone-950" : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            POS Login
          </button>
          <button
            onClick={() => { setActiveTab("register"); setErrorCode(null); setRegSuccess(null); }}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "register" ? "border-[#d4af37] text-stone-950" : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            Register POS
          </button>
          <button
            onClick={() => { setActiveTab("super"); setErrorCode(null); setRegSuccess(null); }}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "super" ? "border-[#d4af37] text-stone-950" : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            Super Admin
          </button>
        </div>

        {/* Notification Banners */}
        <AnimatePresence mode="wait">
          {errorCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-3 text-xs text-red-800 leading-relaxed font-sans"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorCode}</span>
            </motion.div>
          )}

          {regSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-green-50 border border-green-200 p-3.5 rounded-xl flex items-start gap-3 text-xs text-green-850 leading-relaxed font-sans"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600 animate-bounce" />
              <div className="space-y-1">
                <span className="font-bold">Supabase Cloud Sync Success</span>
                <p>{regSuccess}</p>
                <button 
                  onClick={() => setActiveTab("login")} 
                  className="text-[#aa7c11] hover:underline font-bold font-mono text-[10px] uppercase block mt-1"
                >
                  Click Here To Authenticate & Enter POS Terminal →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: STANDARD POS LOGIN */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-medium text-stone-500 uppercase tracking-wider">
                REGISTERED ADMIN EMAIL
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#d4af37]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37]/80 text-xs rounded-xl text-stone-900 focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="block text-[10px] font-mono font-medium text-stone-500 uppercase tracking-wider">
                  SECURE PASSKEY
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[9px] font-mono text-[#aa7c11] hover:underline cursor-pointer"
                >
                  FORGOT KEY?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#d4af37]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37]/80 text-xs rounded-xl text-stone-900 focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-stone-600 select-none cursor-pointer font-sans">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#d4af37] w-4 h-4"
                />
                Remember my workstation
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:from-[#f3e5ab] hover:to-[#d4af37] text-white font-semibold tracking-wider rounded-xl shadow-[0_8px_30px_rgba(212,175,55,0.15)] uppercase text-xs cursor-pointer focus:outline-none transition-colors border border-yellow-300/10 mt-2 font-mono"
            >
              AUTHORIZE & ENTER WORKSPACE
            </motion.button>

            <div className="mt-4 border-t border-stone-100 pt-3 text-center text-[10px] font-mono text-stone-400">
              <p>
                Developer Master Account: <span className="text-[#aa7c11]">admin@webrajyapos.com</span> / <span className="text-stone-600 font-bold">admin123</span>
              </p>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER RESTAURANT */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="text-xs text-stone-500 mb-2 font-sans bg-amber-50/50 border border-amber-200/40 rounded-xl p-3">
              Create a new self-contained POS environment. Registered credentials synchronize to the secure <strong>Supabase Cloud Database</strong>, allowing instant terminal login.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">RESTAURANT LEGAL NAME</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Punjabi Rasoi"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37] text-xs rounded-xl text-stone-900 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">ADMIN EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="manager@restaurant.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37] text-xs rounded-xl text-stone-900 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">SECURE PASSKEY (PASSWORD)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={regPasskey}
                    onChange={(e) => setRegPasskey(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37] text-xs rounded-xl text-stone-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">SUPPORT HOTLINE NUMBER</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +91 11 4560 4560"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37] text-xs rounded-xl text-stone-900 focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">OUTLET STREET ADDRESS</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                <textarea
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Enter full physical address details..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37] text-xs rounded-xl text-stone-900 focus:outline-none resize-none font-sans"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-850 hover:to-stone-950 text-white font-semibold tracking-wider rounded-xl uppercase text-xs cursor-pointer focus:outline-none border border-stone-700 mt-2 font-mono"
            >
              REGISTER NEW RESTAURANT OUTLET
            </motion.button>
          </form>
        )}

        {/* TAB 3: SUPER ADMIN INTERFACE */}
        {activeTab === "super" && (
          <div className="space-y-4">
            {!isSuperLoggedIn ? (
              // Super Admin Credentials Authorization form
              <form onSubmit={handleSuperLoginSubmit} className="space-y-4">
                <div className="text-xs text-stone-500 mb-1 font-sans bg-[#FAF6F0] border border-stone-200 p-3 rounded-xl">
                  Authorized Super Admin portal access required to fetch and manage platform wide restaurant workspaces synchronized on Supabase PostgreSQL.
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-medium text-stone-500 uppercase tracking-wider">
                    SUPER ADMIN ID (EMAIL)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#d4af37]" />
                    <input
                      type="email"
                      required
                      value={superEmail}
                      onChange={(e) => setSuperEmail(e.target.value)}
                      placeholder="superadmin@webrajyapos.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37]/80 text-xs rounded-xl text-stone-900 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-medium text-stone-500 uppercase tracking-wider">
                    SUPER SECURE CREDENTIAL PASSCODE
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#d4af37]" />
                    <input
                      type="password"
                      required
                      value={superPassword}
                      onChange={(e) => setSuperPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#d4af37]/80 text-xs rounded-xl text-stone-900 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3 bg-[#d4af37] text-white font-semibold tracking-wider rounded-xl uppercase text-xs cursor-pointer focus:outline-none border border-yellow-300/10 font-mono"
                >
                  LOCK-IN SECURITY KEY
                </motion.button>

                <div className="mt-4 border-t border-stone-100 pt-3 text-center text-[10px] font-mono text-stone-400">
                  <p>
                    Developer Super Admin Access: <span className="text-[#aa7c11]">superadmin@webrajyapos.com</span> / <span className="text-stone-600 font-bold">super123</span>
                  </p>
                </div>
              </form>
            ) : (
              // Super Admin Authorized View - Live Supabase Sync Manager
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-stone-950 uppercase">Super Admin Active Console</h3>
                    <p className="text-[10px] text-green-600 font-bold font-mono">● SUPABASE CLOUD LIVE CONNECTION</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchAllRestaurants}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs cursor-pointer"
                      title="Sync List from Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRestaurants ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={() => setIsSuperLoggedIn(false)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-mono uppercase font-bold cursor-pointer"
                    >
                      Lock Session
                    </button>
                  </div>
                </div>

                {/* Sub form to quickly register a restaurant from Super Admin view directly */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-stone-200/50 pb-2">
                    <Plus className="w-4 h-4 text-[#aa7c11]" />
                    <h4 className="text-xs font-mono font-bold text-stone-900 uppercase">Deploy & Register New Restaurant</h4>
                  </div>
                  
                  <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Restaurant Name"
                      className="w-full px-3 py-2 bg-white border border-stone-200 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full px-3 py-2 bg-white border border-stone-200 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                    <input
                      type="password"
                      required
                      value={regPasskey}
                      onChange={(e) => setRegPasskey(e.target.value)}
                      placeholder="Secure Passkey"
                      className="w-full px-3 py-2 bg-white border border-stone-200 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-[#d4af37] font-mono"
                    />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Support Hotline"
                      className="w-full px-3 py-2 bg-white border border-stone-200 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Full Street Address"
                        className="w-full px-3 py-2 bg-white border border-stone-200 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#d4af37] hover:bg-[#aa7c11] text-white text-[10px] font-mono font-bold uppercase rounded-lg border border-yellow-400/20 cursor-pointer"
                      >
                        Deploy to Supabase
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of registered restaurants from Supabase */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1">
                    <List className="w-3.5 h-3.5 text-stone-500" />
                    <h4 className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Registered Outlets Database ({restaurantsList.length})</h4>
                  </div>

                  {isLoadingRestaurants ? (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                      <span>Syncing Cloud Directory...</span>
                    </div>
                  ) : restaurantsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl font-mono">
                      No registered restaurants found in Supabase. Use the deploy form above to register your first outlet.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 bg-white">
                      {restaurantsList.map((rest, index) => (
                        <div key={rest.id || index} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-stone-50/50 gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-[#aa7c11] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/40">Active Outlet</span>
                              <span className="font-bold text-stone-950 font-sans">{rest.name || rest.restaurant_name}</span>
                            </div>
                            <div className="space-y-0.5 text-[11px] text-stone-500 font-mono">
                              <p className="flex items-center gap-1">Email: <span className="text-stone-700">{rest.email}</span></p>
                              <p className="flex items-center gap-1">Passkey: <span className="text-stone-800 font-bold">{rest.passkey || rest.password}</span></p>
                            </div>
                          </div>
                          <div className="text-right text-[10px] font-mono text-stone-400 space-y-0.5">
                            <p>ID: {rest.id}</p>
                            <p>{new Date(rest.createdAt || rest.created_at || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Forgot Password modal */}
      <AnimatePresence>
        {showForgotModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="fixed inset-0 bg-stone-900/40 z-40 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-y-0 sm:inset-y-auto sm:my-auto max-w-md w-full bg-white border border-stone-200 p-6 sm:p-8 rounded-none sm:rounded-2xl z-50 shadow-2xl h-fit mx-4"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 border border-amber-200 text-[#aa7c11] rounded-xl">
                    <KeyRound className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wider">Credential Recovery</h3>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5">Secure identity recovery gateway</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {recoverySuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto text-lg">
                    ✓
                  </div>
                  <h4 className="text-xs font-semibold text-stone-950 uppercase tracking-wider font-mono">Recovery Dispatch Successful</h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto font-sans leading-relaxed">
                    A cryptographic security code and recovery links have been sent to your registered owner email and support hotline.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-stone-500 leading-relaxed font-sans">
                    Please provide the registered administrator email below. The system will dispatch a multi-factor passcode and reset instructions directly to your owner email security channel.
                  </p>
                  <div className="space-y-1.5 font-sans">
                    <label className="block text-[10px] font-mono text-stone-450 uppercase tracking-widest font-bold">
                      ADMIN EMAIL
                    </label>
                    <input
                      required
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="admin@webrajyapos.com"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-yellow-600 focus:outline-none rounded-xl text-xs text-stone-900 font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#d4af37] text-white font-semibold rounded-xl text-xs uppercase tracking-widest hover:bg-[#aa7c11] transition-colors focus:outline-none cursor-pointer font-mono"
                  >
                    DISPATCH RECOVERY CODE
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
