import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingBag, X, Plus, Minus, Sparkles, Droplet, RefreshCw } from "lucide-react";

/* ------------------------------------------------------------------
   UNIKE — Vitrine (apenas compra)
   Lê o estoque, o preço e a descrição da mesma chave de armazenamento
   compartilhado usada pelo Painel administrativo (arquivo separado) e
   obedece essas regras: produto com estoque 0 fica indisponível, e cada
   compra desconta do estoque compartilhado em tempo real.
   Paleta: navy #0B1F3D · gold #C6A15B · bone #F1EDE2
------------------------------------------------------------------- */

const STORAGE_KEY = "unike:products";
const CATEGORIES_KEY = "unike:categories";
const WHATSAPP_NUMBER = "5564992579039";

const DEFAULT_CATEGORIES = {
  maquiagem: { label: "Maquiagem", accent: "#0B1F3D", tint: "#E4E9F1" },
  perfumes: { label: "Perfumes", accent: "#C6A15B", tint: "#F5EDDC" },
  cabelo: { label: "Cabelo", accent: "#34607A", tint: "#E3EDF0" },
};

const DEFAULT_PRODUCTS = [
  { id: "m1", cat: "maquiagem", name: "Batom Líquido \u201cNoite Alta\u201d", desc: "Fórmula matte de secagem lenta, cor vinho profundo.", price: 69.9, stock: 24, swatch: "#5C1F2B", tags: ["Matte", "Longa duração"] },
  { id: "m2", cat: "maquiagem", name: "Paleta \u201cTerra & Bruma\u201d", desc: "Nove tons neutros, do bege claro ao marrom queimado.", price: 129.9, stock: 9, swatch: "#A97456", tags: ["Alta pigmentação"] },
  { id: "m3", cat: "maquiagem", name: "Base Fluida \u201cSegunda Pele\u201d", desc: "Cobertura média, acabamento seco, 12 tons.", price: 94.9, stock: 3, swatch: "#D9B48C", tags: ["12 tons", "Toque seco"] },
  { id: "m4", cat: "maquiagem", name: "Blush Cremoso \u201cCorar\u201d", desc: "Textura cremosa, tom pêssego, mistura com os dedos.", price: 58.9, stock: 0, swatch: "#D98B7B", tags: ["Efeito natural"] },
  { id: "p1", cat: "perfumes", name: "Eau de Parfum \u201cÂmbar 09\u201d", desc: "Bergamota, âmbar e baunilha. Fixação de 8 horas.", price: 249.9, stock: 14, swatch: "#C07F2C", tags: ["Amadeirado", "8h de fixação"] },
  { id: "p2", cat: "perfumes", name: "Eau de Parfum \u201cFlor de Vidro\u201d", desc: "Jasmim, almíscar e cedro. Floral e envolvente.", price: 219.9, stock: 6, swatch: "#B98FA5", tags: ["Floral"] },
  { id: "p3", cat: "perfumes", name: "Perfume Sólido de Bolso", desc: "Laranja, cravo e sândalo em bálsamo compacto.", price: 89.9, stock: 18, swatch: "#B5651D", tags: ["Formato viagem"] },
  { id: "p4", cat: "perfumes", name: "Body Splash \u201cBruma Leve\u201d", desc: "Pera, chá branco e flor de laranjeira. Uso diário.", price: 74.9, stock: 11, swatch: "#E4C9A0", tags: ["Refrescante"] },
  { id: "c1", cat: "cabelo", name: "Óleo Reparador \u201cSeiva\u201d", desc: "Sela as pontas duplas sem pesar o cabelo.", price: 79.9, stock: 20, swatch: "#6F7D5E", tags: ["Todos os tipos"] },
  { id: "c2", cat: "cabelo", name: "Shampoo Nutritivo \u201cRaiz\u201d", desc: "Limpeza suave para cabelos secos, sem sulfato.", price: 54.9, stock: 30, swatch: "#8A9A6F", tags: ["Sem sulfato"] },
  { id: "c3", cat: "cabelo", name: "Máscara de Cachos \u201cEspiral\u201d", desc: "Define cachos e crespos, controla o volume.", price: 89.9, stock: 2, swatch: "#556249", tags: ["Cachos e crespos"] },
  { id: "c4", cat: "cabelo", name: "Creme Finalizador \u201cSeda\u201d", desc: "Anti-frizz para cabelos lisos e ondulados.", price: 62.9, stock: 16, swatch: "#B9C2A4", tags: ["Anti-frizz"] },
];

const SWATCH_STRIP = ["m1", "p1", "c1", "m4", "p2", "c3", "m2", "p4"];

function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CategoryIcon({ cat, color }) {
  if (cat === "maquiagem") {
    return (
      <svg viewBox="0 0 64 64" width="34" height="34" fill="none">
        <rect x="26" y="6" width="12" height="18" rx="2" fill={color} />
        <path d="M23 24h18l-3 30a6 6 0 01-6 5.4h-0a6 6 0 01-6-5.4l-3-30z" fill={color} opacity="0.85" />
      </svg>
    );
  }
  if (cat === "perfumes") {
    return (
      <svg viewBox="0 0 64 64" width="34" height="34" fill="none">
        <rect x="27" y="6" width="10" height="8" rx="1.5" fill={color} />
        <rect x="30" y="2" width="4" height="5" fill={color} />
        <path d="M20 18h24l3 6v30a4 4 0 01-4 4H21a4 4 0 01-4-4V24z" fill={color} opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width="34" height="34" fill="none">
      <path d="M24 8h16v9c4 3 6 7 6 12v25a5 5 0 01-5 5H23a5 5 0 01-5-5V29c0-5 2-9 6-12V8z" fill={color} opacity="0.85" />
      <rect x="24" y="8" width="16" height="6" fill={color} />
    </svg>
  );
}

export default function UnikeLoja() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [activeCat, setActiveCat] = useState("todos");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const gridRef = useRef(null);

  async function loadProducts() {
    try {
      const result = await window.storage.get(STORAGE_KEY, true);
      if (result && result.value) {
        setProducts(JSON.parse(result.value));
      } else {
        setProducts(DEFAULT_PRODUCTS);
        await window.storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS), true);
      }
      setLoadError("");
    } catch (e) {
      setProducts((prev) => prev || DEFAULT_PRODUCTS);
      setLoadError("Não foi possível atualizar o estoque agora.");
    }

    try {
      const catResult = await window.storage.get(CATEGORIES_KEY, true);
      if (catResult && catResult.value) {
        setCategories(JSON.parse(catResult.value));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        await window.storage.set(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES), true);
      }
    } catch (e) {
      setCategories((prev) => prev || DEFAULT_CATEGORIES);
    }
  }

  useEffect(() => {
    loadProducts();
    const onFocus = () => loadProducts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filtered = useMemo(
    () => (!products ? [] : activeCat === "todos" ? products : products.filter((p) => p.cat === activeCat)),
    [activeCat, products]
  );

  const cartItems = !products
    ? []
    : Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty }))
        .filter((i) => i.id);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cartItems.reduce((s, i) => s + i.qty, 0);

  async function persistProducts(next) {
    setProducts(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), true);
    } catch (e) {
      setLoadError("Pedido registrado localmente, mas houve falha ao sincronizar o estoque.");
    }
  }

  function addToCart(id) {
    if (!products) return;
    const prod = products.find((p) => p.id === id);
    if (!prod || prod.stock <= 0) return;
    const next = products.map((p) => (p.id === id ? { ...p, stock: p.stock - 1 } : p));
    persistProducts(next);
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function changeQty(id, delta) {
    if (!products) return;
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    if (delta > 0 && prod.stock <= 0) return;
    const next = products.map((p) => (p.id === id ? { ...p, stock: p.stock - delta } : p));
    persistProducts(next);
    setCart((c) => {
      const nextQty = Math.max(0, (c[id] || 0) + delta);
      return { ...c, [id]: nextQty };
    });
  }

  function jumpToProduct(prod) {
    setActiveCat(prod.cat);
    setHighlight(prod.id);
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    setTimeout(() => setHighlight(null), 1600);
  }

  function sendOrderToWhatsApp() {
    if (cartItems.length === 0) return;
    const linhas = cartItems.map((item) => {
      const nome = item.name.replace(/\u201c|\u201d/g, '"');
      return `\u2022 ${item.qty}x ${nome} \u2014 ${formatBRL(item.price)} (subtotal ${formatBRL(item.price * item.qty)})`;
    });
    const mensagem =
      `Olá, Unike! Quero confirmar meu pedido:\n\n` +
      linhas.join("\n") +
      `\n\nTotal: ${formatBRL(subtotal)}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  }

  return (
    <div style={{ background: "#F1EDE2", color: "#0B1F3D", minHeight: "100vh" }} className="font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
        .tab-btn { transition: color .2s ease, border-color .2s ease; }
        .swatch-dot { transition: transform .25s ease, box-shadow .25s ease; }
        .swatch-dot:hover, .swatch-dot:focus-visible { transform: translateY(-10px); }
        .card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px -18px rgba(11,31,61,0.35); }
        .pulse-highlight { animation: pulseGlow 1.6s ease; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(198,161,91,0.55); }
          60% { box-shadow: 0 0 0 14px rgba(198,161,91,0); }
          100% { box-shadow: 0 0 0 0 rgba(198,161,91,0); }
        }
        .drawer { transition: transform .35s ease; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .swatch-dot, .card, .drawer, .tab-btn, .spin { transition: none !important; animation: none !important; }
        }
        ::selection { background: #0B1F3D; color: #F1EDE2; }
      `}</style>

      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-40" style={{ background: "#F1EDE2", borderBottom: "1px solid #D8CDB8" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-display text-2xl tracking-wide" style={{ color: "#0B1F3D" }}>UNIKE</span>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            {categories && ["todos", ...Object.keys(categories)].map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className="tab-btn pb-1 border-b-2"
                style={{
                  borderColor: activeCat === c ? "#C6A15B" : "transparent",
                  color: activeCat === c ? "#0B1F3D" : "#5A5347",
                }}
              >
                {c === "todos" ? "Todos" : categories[c].label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={loadProducts} aria-label="Atualizar estoque" className="p-2 rounded-full" style={{ border: "1px solid #D8CDB8", color: "#5A5347" }}>
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "#0B1F3D", color: "#F1EDE2" }}
              aria-label="Abrir sacola"
            >
              <ShoppingBag size={16} />
              Sacola
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold" style={{ background: "#C6A15B", color: "#0B1F3D" }}>
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {(!products || !categories) ? (
        <div className="max-w-6xl mx-auto px-6 py-24 flex items-center gap-3 text-sm" style={{ color: "#5A5347" }}>
          <RefreshCw size={16} className="spin" /> Carregando vitrine...
        </div>
      ) : (
        <>
          {/* ---------------- HERO ---------------- */}
          <section style={{ background: "#0B1F3D", color: "#F1EDE2" }} className="px-6 pt-20 pb-16">
            <div className="max-w-6xl mx-auto">
              <p className="uppercase tracking-[0.25em] text-xs mb-4" style={{ color: "#C6A15B" }}>Ateliê de beleza</p>
              <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] max-w-2xl">
                Cor, aroma e textura — <span style={{ fontStyle: "italic", color: "#DEC088" }}>provados</span> antes de comprar.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed" style={{ color: "#B9C2D4" }}>
                Maquiagem, perfumaria e cuidados capilares selecionados em pequenos lotes.
                Toque em uma cor para conhecer o produto por trás dela.
              </p>

              <div className="mt-12 flex gap-4 sm:gap-6 flex-wrap" role="list" aria-label="Provador de cores">
                {SWATCH_STRIP.map((id) => {
                  const p = products.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <button
                      key={id}
                      role="listitem"
                      onClick={() => jumpToProduct(p)}
                      className="swatch-dot group relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border"
                      style={{ background: p.swatch, borderColor: "rgba(198,161,91,0.5)" }}
                      aria-label={`${p.name} — ${formatBRL(p.price)}`}
                    >
                      <span
                        className="absolute left-1/2 -translate-x-1/2 -top-11 whitespace-nowrap text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none"
                        style={{ background: "#C6A15B", color: "#0B1F3D" }}
                      >
                        {p.name.replace(/\u201c|\u201d/g, "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---------------- CATEGORY STRIP (mobile) ---------------- */}
          <div className="md:hidden flex gap-6 px-6 py-4 overflow-x-auto text-sm font-medium" style={{ borderBottom: "1px solid #D8CDB8" }}>
            {["todos", ...Object.keys(categories)].map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className="tab-btn whitespace-nowrap pb-1 border-b-2"
                style={{
                  borderColor: activeCat === c ? "#C6A15B" : "transparent",
                  color: activeCat === c ? "#0B1F3D" : "#5A5347",
                }}
              >
                {c === "todos" ? "Todos" : categories[c].label}
              </button>
            ))}
          </div>

          {loadError && (
            <p className="max-w-6xl mx-auto px-6 pt-4 text-xs" style={{ color: "#8A2E2E" }}>{loadError}</p>
          )}

          {/* ---------------- PRODUCT GRID ---------------- */}
          <section ref={gridRef} className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-2xl">{activeCat === "todos" ? "Toda a coleção" : categories[activeCat].label}</h2>
              <span className="text-xs" style={{ color: "#5A5347" }}>{filtered.length} {filtered.length === 1 ? "item" : "itens"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => {
                const c = categories[p.cat] || Object.values(categories)[0];
                const esgotado = p.stock <= 0;
                const baixo = p.stock > 0 && p.stock <= 5;
                return (
                  <div
                    key={p.id}
                    className={`card rounded-2xl p-5 flex flex-col ${highlight === p.id ? "pulse-highlight" : ""}`}
                    style={{ background: "#FBF9F4", border: "1px solid #D8CDB8", opacity: esgotado ? 0.65 : 1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: c.tint }}>
                        <CategoryIcon cat={p.cat} color={c.accent} />
                      </div>
                      {esgotado && <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "#F3E1E1", color: "#8A2E2E" }}>Esgotado</span>}
                      {baixo && <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "#F5EDDC", color: "#8A6A26" }}>Últimas {p.stock} un.</span>}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: p.swatch }} />
                      <span className="text-[11px] uppercase tracking-wide" style={{ color: c.accent }}>{c.label}</span>
                    </div>

                    <h3 className="font-display text-lg leading-snug mb-1">{p.name}</h3>
                    <p className="text-sm mb-3 flex-1" style={{ color: "#5A5347" }}>{p.desc}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-1 rounded-full" style={{ background: c.tint, color: c.accent }}>{t}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-semibold">{formatBRL(p.price)}</span>
                      <button
                        onClick={() => addToCart(p.id)}
                        disabled={esgotado}
                        className="text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-40"
                        style={{ background: "#0B1F3D", color: "#F1EDE2" }}
                      >
                        {esgotado ? "Indisponível" : "Adicionar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------------- STRIP DE CONFIANÇA ---------------- */}
          <section className="px-6 py-10" style={{ background: "#E5EAF0" }}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center gap-3"><Sparkles size={18} /><span>Lotes pequenos, formulação recente</span></div>
              <div className="flex items-center gap-3"><Droplet size={18} /><span>Amostra grátis em pedidos acima de R$ 150</span></div>
              <div className="flex items-center gap-3"><ShoppingBag size={18} /><span>Troca em até 30 dias</span></div>
            </div>
          </section>

          {/* ---------------- FOOTER ---------------- */}
          <footer style={{ background: "#0B1F3D", color: "#B9C2D4" }} className="px-6 py-14">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
              <div>
                <span className="font-display text-xl" style={{ color: "#F1EDE2" }}>UNIKE</span>
                <p className="text-sm mt-3 max-w-xs leading-relaxed">Maquiagem, perfumaria e cuidados capilares pensados para o dia a dia.</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-3" style={{ color: "#F1EDE2" }}>Categorias</p>
                <ul className="space-y-2"><li>Maquiagem</li><li>Perfumes</li><li>Cabelo</li></ul>
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-3" style={{ color: "#F1EDE2" }}>Receba novidades</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="seu e-mail" className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm" style={{ background: "#16305C", color: "#F1EDE2", border: "1px solid #2C4A78" }} />
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "#C6A15B", color: "#0B1F3D" }}>Enviar</button>
                </div>
              </div>
            </div>
            <p className="max-w-6xl mx-auto text-xs mt-10" style={{ color: "#7C88A3" }}>© 2026 Unike Cosméticos. Todos os direitos reservados.</p>
          </footer>
        </>
      )}

      {/* ---------------- CART DRAWER ---------------- */}
      {cartOpen && products && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(11,31,61,0.5)" }} onClick={() => setCartOpen(false)} />
          <div className="drawer relative w-full max-w-sm h-full flex flex-col" style={{ background: "#FBF9F4" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #D8CDB8" }}>
              <h2 className="font-display text-xl">Sua sacola</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Fechar sacola"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {cartItems.length === 0 ? (
                <p className="text-sm" style={{ color: "#5A5347" }}>Sua sacola está vazia. Escolha um produto na coleção.</p>
              ) : (
                <ul className="space-y-5">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: item.swatch }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-snug">{item.name}</p>
                        <p className="text-xs" style={{ color: "#5A5347" }}>{formatBRL(item.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full" style={{ border: "1px solid #D8CDB8" }} aria-label="Diminuir quantidade"><Minus size={12} /></button>
                          <span className="text-sm w-4 text-center">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full disabled:opacity-30" style={{ border: "1px solid #D8CDB8" }} aria-label="Aumentar quantidade" disabled={item.stock <= 0}><Plus size={12} /></button>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{formatBRL(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-6 py-5" style={{ borderTop: "1px solid #D8CDB8" }}>
              <div className="flex items-center justify-between mb-4 text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <button
                disabled={cartItems.length === 0}
                className="w-full py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "#0B1F3D", color: "#F1EDE2" }}
                onClick={sendOrderToWhatsApp}
              >
                Enviar pedido pelo WhatsApp
              </button>
              <p className="text-[11px] text-center mt-2" style={{ color: "#5A5347" }}>
                Você será redirecionado ao WhatsApp da Unike com os itens já preenchidos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
