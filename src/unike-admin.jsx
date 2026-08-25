import React, { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, AlertTriangle, Plus, Trash2 } from "lucide-react";

/* ------------------------------------------------------------------
   UNIKE — Painel administrativo
   Controla estoque, preço e descrição dos produtos.
   Os dados são gravados em armazenamento compartilhado (window.storage)
   sob a chave "unike:products" — a vitrine de compra (arquivo separado)
   lê essa mesma chave e obedece o que for definido aqui.
   Paleta: navy #0B1F3D · gold #C6A15B · bone #F1EDE2
------------------------------------------------------------------- */

const STORAGE_KEY = "unike:products";
const CATEGORIES_KEY = "unike:categories";

const DEFAULT_CATEGORIES = {
  maquiagem: { label: "Maquiagem", accent: "#0B1F3D", tint: "#E4E9F1" },
  perfumes: { label: "Perfumes", accent: "#C6A15B", tint: "#F5EDDC" },
  cabelo: { label: "Cabelo", accent: "#34607A", tint: "#E3EDF0" },
};

const COLOR_PALETTE = [
  ["#0B1F3D", "#E4E9F1"],
  ["#C6A15B", "#F5EDDC"],
  ["#34607A", "#E3EDF0"],
  ["#6B4F86", "#EDE7F2"],
  ["#7A5C2E", "#F1E7D8"],
  ["#2E6B5E", "#E3F0EC"],
];

function slugify(str) {
  return (
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "categoria"
  );
}

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

function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CategoryIcon({ cat, color }) {
  if (cat === "maquiagem") {
    return (
      <svg viewBox="0 0 64 64" width="30" height="30" fill="none">
        <rect x="26" y="6" width="12" height="18" rx="2" fill={color} />
        <path d="M23 24h18l-3 30a6 6 0 01-6 5.4h-0a6 6 0 01-6-5.4l-3-30z" fill={color} opacity="0.85" />
      </svg>
    );
  }
  if (cat === "perfumes") {
    return (
      <svg viewBox="0 0 64 64" width="30" height="30" fill="none">
        <rect x="27" y="6" width="10" height="8" rx="1.5" fill={color} />
        <rect x="30" y="2" width="4" height="5" fill={color} />
        <path d="M20 18h24l3 6v30a4 4 0 01-4 4H21a4 4 0 01-4-4V24z" fill={color} opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width="30" height="30" fill="none">
      <path d="M24 8h16v9c4 3 6 7 6 12v25a5 5 0 01-5 5H23a5 5 0 01-5-5V29c0-5 2-9 6-12V8z" fill={color} opacity="0.85" />
      <rect x="24" y="8" width="16" height="6" fill={color} />
    </svg>
  );
}

export default function UnikeAdmin() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [savedPing, setSavedPing] = useState(false);
  const [error, setError] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  function askConfirm(message, onConfirm) {
    setConfirmDialog({ message, onConfirm });
  }

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result && result.value) {
          setProducts(JSON.parse(result.value));
        } else {
          setProducts(DEFAULT_PRODUCTS);
          await window.storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS), true);
        }
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
        try {
          await window.storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS), true);
        } catch (e2) {
          setError("Não foi possível conectar ao armazenamento compartilhado.");
        }
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
        setCategories(DEFAULT_CATEGORIES);
      }
    })();
  }, []);

  async function persist(nextProducts) {
    setProducts(nextProducts);
    try {
      const res = await window.storage.set(STORAGE_KEY, JSON.stringify(nextProducts), true);
      if (!res) throw new Error("write failed");
      setSavedPing(true);
      setTimeout(() => setSavedPing(false), 900);
      setError("");
    } catch (e) {
      setError("Falha ao salvar. Tente novamente.");
    }
  }

  async function persistCategories(nextCategories) {
    setCategories(nextCategories);
    try {
      const res = await window.storage.set(CATEGORIES_KEY, JSON.stringify(nextCategories), true);
      if (!res) throw new Error("write failed");
      setSavedPing(true);
      setTimeout(() => setSavedPing(false), 900);
      setError("");
    } catch (e) {
      setError("Falha ao salvar as categorias. Tente novamente.");
    }
  }

  function updateProduct(id, field, value) {
    if (!products) return;
    const next = products.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    persist(next);
  }

  function addProduct() {
    if (!products || !categories) return;
    const firstCat = Object.keys(categories)[0];
    const [accent] = COLOR_PALETTE[products.length % COLOR_PALETTE.length];
    const newProduct = {
      id: `p-${Date.now()}`,
      cat: firstCat,
      name: "Novo produto",
      desc: "",
      price: 0,
      stock: 0,
      swatch: accent,
      tags: [],
    };
    persist([newProduct, ...products]);
  }

  function removeProduct(id) {
    if (!products) return;
    askConfirm("Remover este produto da loja? Essa ação não pode ser desfeita.", () => {
      persist(products.filter((p) => p.id !== id));
      setConfirmDialog(null);
    });
  }

  function addCategory() {
    const name = newCatName.trim();
    if (!name || !categories) return;
    let id = slugify(name);
    let suffix = 2;
    while (categories[id]) {
      id = `${slugify(name)}-${suffix}`;
      suffix += 1;
    }
    const [accent, tint] = COLOR_PALETTE[Object.keys(categories).length % COLOR_PALETTE.length];
    persistCategories({ ...categories, [id]: { label: name, accent, tint } });
    setNewCatName("");
  }

  function renameCategory(id, label) {
    if (!categories) return;
    persistCategories({ ...categories, [id]: { ...categories[id], label } });
  }

  function deleteCategory(id) {
    if (!categories || Object.keys(categories).length <= 1) return;
    askConfirm("Excluir esta categoria? Os produtos dela serão movidos para a primeira categoria restante.", () => {
      const remainingIds = Object.keys(categories).filter((k) => k !== id);
      const fallbackId = remainingIds[0];
      const nextCategories = { ...categories };
      delete nextCategories[id];
      persistCategories(nextCategories);
      if (products) {
        const nextProducts = products.map((p) => (p.cat === id ? { ...p, cat: fallbackId } : p));
        persist(nextProducts);
      }
      setConfirmDialog(null);
    });
  }

  function restoreDefaults() {
    askConfirm("Restaurar estoque, preços, descrições e categorias para os valores padrão?", () => {
      persist(DEFAULT_PRODUCTS);
      persistCategories(DEFAULT_CATEGORIES);
      setConfirmDialog(null);
    });
  }

  return (
    <div style={{ background: "#F1EDE2", color: "#0B1F3D", minHeight: "100vh" }} className="font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
        .admin-input { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #D8CDB8; background: #FBF9F4; font-family: 'Manrope', sans-serif; font-size: 13px; color: #0B1F3D; }
        .admin-input:focus { outline: 2px solid #C6A15B; outline-offset: 1px; }
        ::selection { background: #0B1F3D; color: #F1EDE2; }
      `}</style>

      <header className="sticky top-0 z-40" style={{ background: "#0B1F3D", borderBottom: "1px solid #16305C" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2" style={{ color: "#F1EDE2" }}>
            <Settings size={18} style={{ color: "#C6A15B" }} />
            <span className="font-display text-xl tracking-wide">UNIKE · Painel</span>
          </div>
          <button
            onClick={restoreDefaults}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full"
            style={{ border: "1px solid #2C4A78", color: "#B9C2D4" }}
          >
            <RotateCcw size={13} /> Restaurar padrão
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl">Estoque, preço e descrição</h1>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-opacity"
              style={{ background: "#E4E9F1", color: "#0B1F3D", opacity: savedPing ? 1 : 0 }}
            >
              <Save size={12} /> Salvo
            </span>
            <button
              onClick={addProduct}
              disabled={!products || !categories}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-40"
              style={{ background: "#0B1F3D", color: "#F1EDE2" }}
            >
              <Plus size={14} /> Adicionar produto
            </button>
          </div>
        </div>
        <p className="text-sm mb-2" style={{ color: "#5A5347" }}>
          Toda alteração feita aqui é salva automaticamente e passa a valer na página de compra da Unike.
        </p>
        {error && (
          <p className="text-sm mb-6 flex items-center gap-2" style={{ color: "#8A2E2E" }}>
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        {(!products || !categories) ? (
          <p className="text-sm mt-8" style={{ color: "#5A5347" }}>Carregando produtos...</p>
        ) : (
          <>
            <div className="rounded-2xl p-5 mb-10" style={{ background: "#FBF9F4", border: "1px solid #D8CDB8" }}>
              <h2 className="font-display text-xl mb-1">Categorias do catálogo</h2>
              <p className="text-sm mb-4" style={{ color: "#5A5347" }}>
                Adicione, renomeie ou remova os tipos de produto (ex.: Maquiagem, Perfumes, Cabelo). A vitrine de compra usa essa mesma lista.
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {Object.entries(categories).map(([id, c]) => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: c.accent }} />
                    <input
                      className="admin-input"
                      style={{ maxWidth: 280 }}
                      value={c.label}
                      onChange={(e) => renameCategory(id, e.target.value)}
                    />
                    <span className="text-xs" style={{ color: "#5A5347" }}>
                      {products.filter((p) => p.cat === id).length} produto(s)
                    </span>
                    <button
                      onClick={() => deleteCategory(id)}
                      disabled={Object.keys(categories).length <= 1}
                      className="ml-auto text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-30"
                      style={{ border: "1px solid #D8CDB8", color: "#8A2E2E" }}
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="admin-input"
                  style={{ maxWidth: 280 }}
                  placeholder="Nome da nova categoria"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                />
                <button
                  onClick={addCategory}
                  className="text-sm font-semibold px-4 py-2 rounded-full"
                  style={{ background: "#0B1F3D", color: "#F1EDE2" }}
                >
                  Adicionar categoria
                </button>
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {products.map((p) => {
              const c = categories[p.cat] || Object.values(categories)[0];
              const esgotado = p.stock <= 0;
              const baixo = p.stock > 0 && p.stock <= 5;
              return (
                <div key={p.id} className="rounded-2xl p-5" style={{ background: "#FBF9F4", border: "1px solid #D8CDB8" }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.tint }}>
                      <CategoryIcon cat={p.cat} color={c.accent} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        className="admin-input font-display text-base mb-1"
                        style={{ border: "1px solid transparent", background: "transparent", padding: "2px 0" }}
                        value={p.name}
                        onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                      />
                      <select
                        className="admin-input"
                        style={{ width: "auto", padding: "4px 8px", fontSize: 11, color: c.accent, background: c.tint, border: "none" }}
                        value={p.cat}
                        onChange={(e) => updateProduct(p.id, "cat", e.target.value)}
                      >
                        {Object.entries(categories).map(([key, v]) => (
                          <option key={key} value={key}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    {esgotado && (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "#F3E1E1", color: "#8A2E2E" }}>Esgotado</span>
                    )}
                    {baixo && (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "#F5EDDC", color: "#8A6A26" }}>Estoque baixo</span>
                    )}
                  </div>

                  <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5347" }}>Descrição</label>
                  <textarea
                    className="admin-input mb-4"
                    rows={2}
                    value={p.desc}
                    onChange={(e) => updateProduct(p.id, "desc", e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5347" }}>Preço (R$)</label>
                      <input
                        type="number" step="0.10" min="0"
                        className="admin-input"
                        value={p.price}
                        onChange={(e) => updateProduct(p.id, "price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5347" }}>Estoque (un.)</label>
                      <input
                        type="number" min="0"
                        className="admin-input"
                        value={p.stock}
                        onChange={(e) => updateProduct(p.id, "stock", Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5347" }}>Tags (vírgula)</label>
                      <input
                        className="admin-input"
                        value={p.tags.join(", ")}
                        onChange={(e) => updateProduct(p.id, "tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5347" }}>Cor</label>
                        <input
                          type="color"
                          value={p.swatch}
                          onChange={(e) => updateProduct(p.id, "swatch", e.target.value)}
                          style={{ width: 40, height: 34, borderRadius: 8, border: "1px solid #D8CDB8", padding: 2, background: "#FBF9F4" }}
                        />
                      </div>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full"
                        style={{ border: "1px solid #D8CDB8", color: "#8A2E2E" }}
                      >
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </section>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0" style={{ background: "rgba(11,31,61,0.55)" }} onClick={() => setConfirmDialog(null)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6" style={{ background: "#FBF9F4", border: "1px solid #D8CDB8" }}>
            <p className="text-sm mb-6" style={{ color: "#0B1F3D" }}>{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="text-sm font-medium px-4 py-2 rounded-full"
                style={{ border: "1px solid #D8CDB8", color: "#5A5347" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="text-sm font-semibold px-4 py-2 rounded-full"
                style={{ background: "#8A2E2E", color: "#F1EDE2" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
