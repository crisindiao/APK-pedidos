import React from "react";
import { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Plus, X, Search, Package, Clock, Truck, CheckCircle2, XCircle, Sparkles, Pencil, Trash2, ChevronDown, ClipboardList, Boxes, Wallet, TrendingUp, TrendingDown, ShoppingBag, MessageCircle, Instagram, CircleDot, Check, Minus, Tag } from "lucide-react";
const STATUSES = [
    { key: "Pendente", label: "Pendente", color: "#B8862E", bg: "#FBF1DF", icon: Clock },
    { key: "Em produção", label: "Em produção", color: "#A8455C", bg: "#FAE6EA", icon: Sparkles },
    { key: "Pronto", label: "Pronto", color: "#5C6E9E", bg: "#E7EAF6", icon: Package },
    { key: "Enviado", label: "Enviado", color: "#5C8A6E", bg: "#E4EFE6", icon: Truck },
    { key: "Entregue", label: "Entregue", color: "#5C3A3F", bg: "#EDE1E0", icon: CheckCircle2 },
    { key: "Cancelado", label: "Cancelado", color: "#9A5555", bg: "#F3E4E4", icon: XCircle },
];
const CANAIS = [
    { key: "Shopee", color: "#D2551E", bg: "#FDEDE8", icon: ShoppingBag },
    { key: "WhatsApp", color: "#3C8C56", bg: "#E4F3E8", icon: MessageCircle },
    { key: "Instagram", color: "#A24B8E", bg: "#F3E6F0", icon: Instagram },
    { key: "Outro", color: "#7A6A63", bg: "#F1EEEA", icon: CircleDot },
];
const CATEGORIAS = ["Bottons", "Espelhos de Bolso", "Fotos Personalizadas", "Marcadores", "Crachás/Plaquinhas", "Kits/Pacotes", "Outros"];
const PAGAMENTOS = ["Shopee", "PIX Direto", "Cartão", "Outro"];
const GASTO_CATEGORIAS = ["Matéria-prima", "Embalagem", "Frete/Envio", "Marketing", "Ferramentas/Equipamento", "Outro"];
const PRODUTOS_SEED = [
    { id: "seed-1", nome: "Botton 4.4cm - Capivara", categoria: "Bottons", custo: 0 },
    { id: "seed-2", nome: "Botton 4.4cm - Frases motivacionais", categoria: "Bottons", custo: 0 },
    { id: "seed-3", nome: "Espelho de bolso 6x9cm", categoria: "Espelhos de Bolso", custo: 0 },
    { id: "seed-4", nome: "Marcador de página", categoria: "Marcadores", custo: 0 },
    { id: "seed-5", nome: "Crachá/Plaquinha laminada", categoria: "Crachás/Plaquinhas", custo: 0 },
];
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function emptyItem() { return { id: uid(), produtoId: "", quantidade: 1 }; }
function emptyForm() {
    return {
        cliente: "", contato: "", canal: "Shopee",
        itens: [emptyItem()],
        valorTotal: "", formaPagamento: PAGAMENTOS[0], status: "Pendente",
        dataPedido: new Date().toISOString().slice(0, 10), prazoEntrega: "", observacoes: "",
    };
}
function emptyGasto() {
    return { descricao: "", categoria: GASTO_CATEGORIAS[0], valor: "", data: new Date().toISOString().slice(0, 10) };
}
function emptyProduto() { return { nome: "", categoria: CATEGORIAS[0], custo: "" }; }
function statusMeta(key) { return STATUSES.find((s) => s.key === key) || STATUSES[0]; }
function canalMeta(key) { return CANAIS.find((c) => c.key === key) || CANAIS[3]; }
function formatBRL(n) { return (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function formatDate(d) { if (!d)
    return "—"; const [y, m, day] = d.split("-"); return `${day}/${m}/${y}`; }
export default function App() {
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [picked, setPicked] = useState({});
    const [seq, setSeq] = useState(1);
    const [loaded, setLoaded] = useState(false);
    const [tab, setTab] = useState("pedidos");
    const [filtro, setFiltro] = useState("Todos");
    const [canalFiltro, setCanalFiltro] = useState("Todos");
    const [busca, setBusca] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showGastoForm, setShowGastoForm] = useState(false);
    const [gastoForm, setGastoForm] = useState(emptyGasto());
    const [editGastoId, setEditGastoId] = useState(null);
    const [confirmDeleteGasto, setConfirmDeleteGasto] = useState(null);
    const [periodo, setPeriodo] = useState("mes");
    const [showProdutoForm, setShowProdutoForm] = useState(false);
    const [produtoForm, setProdutoForm] = useState(emptyProduto());
    const [editProdutoId, setEditProdutoId] = useState(null);
    const [confirmDeleteProduto, setConfirmDeleteProduto] = useState(null);
    const [quickAddForItem, setQuickAddForItem] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const res = await window.storage.get("imaginae:dados", false);
                if (res && res.value) {
                    const d = JSON.parse(res.value);
                    setPedidos(d.pedidos || []);
                    setProdutos(d.produtos && d.produtos.length ? d.produtos : PRODUTOS_SEED);
                    setGastos(d.gastos || []);
                    setPicked(d.picked || {});
                    setSeq(d.seq || 1);
                }
                else {
                    setProdutos(PRODUTOS_SEED);
                }
            }
            catch (e) {
                setProdutos(PRODUTOS_SEED);
            }
            setLoaded(true);
        })();
    }, []);
    useEffect(() => {
        if (!loaded)
            return;
        (async () => {
            try {
                await window.storage.set("imaginae:dados", JSON.stringify({ pedidos, produtos, gastos, picked, seq }), false);
            }
            catch (e) {
                console.error("Falha ao salvar", e);
            }
        })();
    }, [pedidos, produtos, gastos, picked, seq, loaded]);
    function produtoNome(id) {
        const p = produtos.find((x) => x.id === id);
        return p ? p.nome : "Produto removido";
    }
    function produtoCategoria(id) {
        const p = produtos.find((x) => x.id === id);
        return p ? p.categoria : "Outros";
    }
    function produtoCusto(id) {
        const p = produtos.find((x) => x.id === id);
        return p ? Number(p.custo) || 0 : 0;
    }
    function calcularCustoItens(itens) {
        return (itens || []).reduce((s, it) => s + produtoCusto(it.produtoId) * (Number(it.quantidade) || 0), 0);
    }
    const stats = useMemo(() => {
        const byStatus = {};
        STATUSES.forEach((s) => (byStatus[s.key] = 0));
        const byCanal = {};
        CANAIS.forEach((c) => (byCanal[c.key] = 0));
        pedidos.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; byCanal[p.canal] = (byCanal[p.canal] || 0) + 1; });
        return { byStatus, byCanal, total: pedidos.length };
    }, [pedidos]);
    const financeiro = useMemo(() => {
        const thisMonth = new Date().toISOString().slice(0, 7);
        const inPeriod = (dateStr) => periodo === "tudo" || (dateStr || "").startsWith(thisMonth);
        const pedidosPeriodo = pedidos.filter((p) => p.status !== "Cancelado" && inPeriod(p.dataPedido));
        const ganho = pedidosPeriodo.reduce((s, p) => s + (Number(p.valorTotal) || 0), 0);
        const custoProdutos = pedidosPeriodo.reduce((s, p) => s + (Number(p.custoTotal) || calcularCustoItens(p.itens)), 0);
        const gasto = gastos.filter((g) => inPeriod(g.data)).reduce((s, g) => s + (Number(g.valor) || 0), 0);
        const gastosPorCategoria = {};
        gastos.filter((g) => inPeriod(g.data)).forEach((g) => { gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + (Number(g.valor) || 0); });
        return { ganho, custoProdutos, gasto, lucro: ganho - custoProdutos - gasto, gastosPorCategoria };
    }, [pedidos, gastos, periodo, produtos]);
    const picking = useMemo(() => {
        const ativos = pedidos.filter((p) => p.status !== "Entregue" && p.status !== "Cancelado");
        const groups = {};
        ativos.forEach((p) => {
            (p.itens || []).forEach((it) => {
                if (!it.produtoId)
                    return;
                const key = it.produtoId;
                if (!groups[key])
                    groups[key] = { produtoId: key, nome: produtoNome(key), categoria: produtoCategoria(key), total: 0, refs: [] };
                groups[key].total += Number(it.quantidade) || 0;
                groups[key].refs.push({ pedidoId: p.id, itemId: it.id, codigo: p.codigo, cliente: p.cliente, quantidade: Number(it.quantidade) || 0, status: p.status });
            });
        });
        return Object.values(groups).sort((a, b) => b.total - a.total);
    }, [pedidos, produtos]);
    function openNew() { setForm(emptyForm()); setEditId(null); setError(""); setShowForm(true); }
    function openEdit(p) { setForm({ ...p, itens: p.itens && p.itens.length ? p.itens : [emptyItem()] }); setEditId(p.id); setError(""); setShowForm(true); }
    function closeForm() { setShowForm(false); setEditId(null); }
    function save() {
        if (!form.cliente.trim()) {
            setError("Preenche o nome do cliente.");
            return;
        }
        const itensValidos = form.itens.filter((it) => it.produtoId);
        if (itensValidos.length === 0) {
            setError("Escolhe pelo menos um produto pro pedido.");
            return;
        }
        const custoTotal = calcularCustoItens(itensValidos);
        const payload = { ...form, itens: itensValidos, custoTotal, lucro: (Number(form.valorTotal) || 0) - custoTotal };
        if (editId) {
            setPedidos((prev) => prev.map((p) => (p.id === editId ? { ...payload, id: editId } : p)));
        }
        else {
            const codigo = `IMG-${String(seq).padStart(4, "0")}`;
            setPedidos((prev) => [{ ...payload, id: uid(), codigo }, ...prev]);
            setSeq((s) => s + 1);
        }
        closeForm();
    }
    function remove(id) { setPedidos((prev) => prev.filter((p) => p.id !== id)); setConfirmDelete(null); }
    function quickStatus(id, status) { setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p))); }
    function addItemRow() { setForm((f) => ({ ...f, itens: [...f.itens, emptyItem()] })); }
    function removeItemRow(id) { setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) })); }
    function updateItemRow(id, patch) { setForm((f) => ({ ...f, itens: f.itens.map((i) => (i.id === id ? { ...i, ...patch } : i)) })); }
    function togglePicked(pedidoId, itemId) {
        const key = `${pedidoId}:${itemId}`;
        setPicked((prev) => ({ ...prev, [key]: !prev[key] }));
    }
    function openNewGasto() { setGastoForm(emptyGasto()); setEditGastoId(null); setShowGastoForm(true); }
    function openEditGasto(g) { setGastoForm({ ...g }); setEditGastoId(g.id); setShowGastoForm(true); }
    function saveGasto() {
        if (!gastoForm.descricao.trim() || !gastoForm.valor)
            return;
        if (editGastoId)
            setGastos((prev) => prev.map((g) => (g.id === editGastoId ? { ...gastoForm, id: editGastoId } : g)));
        else
            setGastos((prev) => [{ ...gastoForm, id: uid() }, ...prev]);
        setShowGastoForm(false);
        setEditGastoId(null);
    }
    function removeGasto(id) { setGastos((prev) => prev.filter((g) => g.id !== id)); setConfirmDeleteGasto(null); }
    function openNewProduto() { setProdutoForm(emptyProduto()); setEditProdutoId(null); setShowProdutoForm(true); }
    function openEditProduto(p) { setProdutoForm({ nome: p.nome, categoria: p.categoria, custo: p.custo ?? "" }); setEditProdutoId(p.id); setShowProdutoForm(true); }
    function saveProduto() {
        if (!produtoForm.nome.trim())
            return;
        if (editProdutoId) {
            setProdutos((prev) => prev.map((p) => (p.id === editProdutoId ? { ...p, ...produtoForm } : p)));
        }
        else {
            const novo = { id: uid(), ...produtoForm };
            setProdutos((prev) => [...prev, novo]);
            if (quickAddForItem) {
                updateItemRow(quickAddForItem, { produtoId: novo.id });
                setQuickAddForItem(null);
            }
        }
        setShowProdutoForm(false);
        setEditProdutoId(null);
    }
    function removeProduto(id) {
        setProdutos((prev) => prev.filter((p) => p.id !== id));
        setConfirmDeleteProduto(null);
    }
    function openQuickAdd(itemId) {
        setProdutoForm(emptyProduto());
        setEditProdutoId(null);
        setQuickAddForItem(itemId);
        setShowProdutoForm(true);
    }
    const filtrados = useMemo(() => {
        let list = [...pedidos];
        if (filtro !== "Todos")
            list = list.filter((p) => p.status === filtro);
        if (canalFiltro !== "Todos")
            list = list.filter((p) => p.canal === canalFiltro);
        if (busca.trim()) {
            const q = busca.trim().toLowerCase();
            list = list.filter((p) => p.cliente.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || (p.itens || []).some((it) => produtoNome(it.produtoId).toLowerCase().includes(q)));
        }
        return list.sort((a, b) => (a.dataPedido < b.dataPedido ? 1 : -1));
    }, [pedidos, filtro, canalFiltro, busca, produtos]);
    const produtosPorCategoria = useMemo(() => {
        const g = {};
        CATEGORIAS.forEach((c) => (g[c] = []));
        produtos.forEach((p) => { if (!g[p.categoria])
            g[p.categoria] = []; g[p.categoria].push(p); });
        return g;
    }, [produtos]);
    return (React.createElement(React.Fragment, null,
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap');
        * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }
        .font-display { font-family: 'Fraunces', serif; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E3C9C0; border-radius: 10px; }
        .input { width: 100%; padding: 0.6rem 0.75rem; border-radius: 0.65rem; border: 1px solid #EEDDD9; background: #fff; font-size: 1rem; color: #3D2C2E; outline: none; }
        .input:focus { border-color: #C08497; }
      `),
        React.createElement("div", { className: "min-h-screen w-full", style: { background: "#FDF8F6" } },
            React.createElement("div", { className: "max-w-5xl mx-auto px-4 py-6 sm:px-6 pb-24" },
                React.createElement("div", { className: "flex items-center justify-between mb-5" },
                    React.createElement("div", null,
                        React.createElement("h1", { className: "font-display text-2xl sm:text-3xl", style: { color: "#5C3A3F" } }, "IMAGIN\u00C2E"),
                        React.createElement("p", { className: "text-xs tracking-wide uppercase", style: { color: "#B76E79", letterSpacing: "0.08em" } }, "Gest\u00E3o de Pedidos")),
                    tab === "pedidos" && (React.createElement("button", { onClick: openNew, className: "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform", style: { background: "linear-gradient(135deg, #C08497, #B76E79)" } },
                        React.createElement(Plus, { size: 16, strokeWidth: 2.5 }),
                        " Novo pedido")),
                    tab === "financeiro" && (React.createElement("button", { onClick: openNewGasto, className: "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform", style: { background: "linear-gradient(135deg, #8a7ba0, #6f5f8a)" } },
                        React.createElement(Plus, { size: 16, strokeWidth: 2.5 }),
                        " Novo gasto")),
                    tab === "catalogo" && (React.createElement("button", { onClick: openNewProduto, className: "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform", style: { background: "linear-gradient(135deg, #C08497, #B76E79)" } },
                        React.createElement(Plus, { size: 16, strokeWidth: 2.5 }),
                        " Novo produto"))),
                React.createElement("div", { className: "flex items-center gap-1 mb-5 p-1 rounded-full w-fit overflow-x-auto scrollbar-thin", style: { background: "#F3EEEB" } },
                    React.createElement(TabBtn, { active: tab === "pedidos", onClick: () => setTab("pedidos"), icon: ClipboardList, label: "Pedidos" }),
                    React.createElement(TabBtn, { active: tab === "picking", onClick: () => setTab("picking"), icon: Boxes, label: "Produ\u00E7\u00E3o" }),
                    React.createElement(TabBtn, { active: tab === "financeiro", onClick: () => setTab("financeiro"), icon: Wallet, label: "Financeiro" }),
                    React.createElement(TabBtn, { active: tab === "catalogo", onClick: () => setTab("catalogo"), icon: Tag, label: "Cat\u00E1logo" })),
                tab === "pedidos" && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5" },
                        React.createElement(StatCard, { label: "Pedidos ativos", value: stats.total - stats.byStatus["Cancelado"] - stats.byStatus["Entregue"] }),
                        React.createElement(StatCard, { label: "Pendentes", value: stats.byStatus["Pendente"], accent: "#B8862E" }),
                        React.createElement(StatCard, { label: "Em produ\u00E7\u00E3o", value: stats.byStatus["Em produção"], accent: "#A8455C" }),
                        React.createElement(StatCard, { label: "Enviados", value: stats.byStatus["Enviado"], accent: "#5C8A6E" })),
                    React.createElement("div", { className: "flex items-center gap-2 mb-2 overflow-x-auto scrollbar-thin pb-1" },
                        React.createElement(FilterPill, { active: canalFiltro === "Todos", onClick: () => setCanalFiltro("Todos"), label: "Todos os canais" }),
                        CANAIS.map((c) => (React.createElement(FilterPill, { key: c.key, active: canalFiltro === c.key, onClick: () => setCanalFiltro(c.key), label: `${c.key} (${stats.byCanal[c.key] || 0})`, color: c.color })))),
                    React.createElement("div", { className: "flex items-center gap-2 mb-3 overflow-x-auto scrollbar-thin pb-1" },
                        React.createElement(FilterPill, { active: filtro === "Todos", onClick: () => setFiltro("Todos"), label: `Todos (${stats.total})` }),
                        STATUSES.map((s) => (React.createElement(FilterPill, { key: s.key, active: filtro === s.key, onClick: () => setFiltro(s.key), label: `${s.label} (${stats.byStatus[s.key] || 0})`, color: s.color })))),
                    React.createElement("div", { className: "relative mb-4" },
                        React.createElement(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2", style: { color: "#C9A9A6" } }),
                        React.createElement("input", { value: busca, onChange: (e) => setBusca(e.target.value), placeholder: "Buscar por cliente, produto ou c\u00F3digo...", className: "input pl-9" })),
                    filtrados.length === 0 ? (React.createElement(EmptyState, { title: pedidos.length === 0 ? "Nenhum pedido ainda" : "Nada por aqui", subtitle: pedidos.length === 0 ? 'Toca em "Novo pedido" para começar.' : "Tenta outro filtro ou busca." })) : (React.createElement("div", { className: "space-y-2.5" }, filtrados.map((p) => (React.createElement(OrderCard, { key: p.id, p: p, produtoNome: produtoNome, onEdit: () => openEdit(p), onDelete: () => setConfirmDelete(p.id), onStatus: (s) => quickStatus(p.id, s) }))))))),
                tab === "picking" && (React.createElement(React.Fragment, null,
                    React.createElement("p", { className: "text-sm mb-4", style: { color: "#8A6A66" } }, "Tudo que precisa ser produzido agora, agrupado por produto igual \u2014 pra voc\u00EA fazer um lote s\u00F3 e distribuir entre os pedidos."),
                    picking.length === 0 ? (React.createElement(EmptyState, { title: "Nada pra produzir", subtitle: "Quando tiver pedidos pendentes ou em produ\u00E7\u00E3o, os itens aparecem agrupados aqui." })) : (React.createElement("div", { className: "space-y-3" }, picking.map((g) => (React.createElement(PickingGroup, { key: g.produtoId, g: g, picked: picked, onToggle: togglePicked }))))))),
                tab === "financeiro" && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "flex items-center gap-2 mb-4" },
                        React.createElement(FilterPill, { active: periodo === "mes", onClick: () => setPeriodo("mes"), label: "Este m\u00EAs" }),
                        React.createElement(FilterPill, { active: periodo === "tudo", onClick: () => setPeriodo("tudo"), label: "Tudo" })),
                    React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5" },
                        React.createElement("div", { className: "rounded-xl px-3 py-3 border", style: { background: "#fff", borderColor: "#F1E3DF" } },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(TrendingUp, { size: 13, style: { color: "#5C8A6E" } }),
                                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } }, "Ganhou")),
                            React.createElement("p", { className: "text-base font-bold mt-1", style: { color: "#5C8A6E", fontFamily: "Fraunces, serif" } }, formatBRL(financeiro.ganho))),
                        React.createElement("div", { className: "rounded-xl px-3 py-3 border", style: { background: "#fff", borderColor: "#F1E3DF" } },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(Boxes, { size: 13, style: { color: "#8a7ba0" } }),
                                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } }, "Custo produtos")),
                            React.createElement("p", { className: "text-base font-bold mt-1", style: { color: "#8a7ba0", fontFamily: "Fraunces, serif" } }, formatBRL(financeiro.custoProdutos))),
                        React.createElement("div", { className: "rounded-xl px-3 py-3 border", style: { background: "#fff", borderColor: "#F1E3DF" } },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(TrendingDown, { size: 13, style: { color: "#9A5555" } }),
                                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } }, "Outros gastos")),
                            React.createElement("p", { className: "text-base font-bold mt-1", style: { color: "#9A5555", fontFamily: "Fraunces, serif" } }, formatBRL(financeiro.gasto))),
                        React.createElement("div", { className: "rounded-xl px-3 py-3 border", style: { background: "#fff", borderColor: "#F1E3DF" } },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(Wallet, { size: 13, style: { color: "#B76E79" } }),
                                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } }, "Lucro")),
                            React.createElement("p", { className: "text-base font-bold mt-1", style: { color: financeiro.lucro >= 0 ? "#B76E79" : "#9A5555", fontFamily: "Fraunces, serif" } }, formatBRL(financeiro.lucro)))),
                    Object.keys(financeiro.gastosPorCategoria).length > 0 && (React.createElement("div", { className: "mb-5 rounded-xl border p-3.5", style: { background: "#fff", borderColor: "#F1E3DF" } },
                        React.createElement("p", { className: "text-xs font-semibold mb-2", style: { color: "#8A6A66" } }, "Gastos por categoria"),
                        Object.entries(financeiro.gastosPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (React.createElement("div", { key: cat, className: "flex items-center justify-between text-sm py-1" },
                            React.createElement("span", { style: { color: "#6B5450" } }, cat),
                            React.createElement("span", { className: "font-medium", style: { color: "#3D2C2E" } }, formatBRL(val))))))),
                    React.createElement("p", { className: "text-xs font-semibold mb-2", style: { color: "#8A6A66" } }, "Lan\u00E7amentos de gastos"),
                    gastos.length === 0 ? (React.createElement(EmptyState, { title: "Nenhum gasto lan\u00E7ado", subtitle: 'Toca em "Novo gasto" pra registrar mat\u00E9ria-prima, embalagem, frete...' })) : (React.createElement("div", { className: "space-y-2" }, [...gastos].sort((a, b) => (a.data < b.data ? 1 : -1)).map((g) => (React.createElement("div", { key: g.id, className: "rounded-xl border p-3 flex items-center justify-between", style: { background: "#fff", borderColor: "#F1E3DF" } },
                        React.createElement("div", { className: "min-w-0" },
                            React.createElement("p", { className: "text-sm font-medium truncate", style: { color: "#3D2C2E" } }, g.descricao),
                            React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } },
                                g.categoria,
                                " \u00B7 ",
                                formatDate(g.data))),
                        React.createElement("div", { className: "flex items-center gap-2 shrink-0" },
                            React.createElement("span", { className: "text-sm font-bold", style: { color: "#9A5555", fontFamily: "Fraunces, serif" } }, formatBRL(g.valor)),
                            React.createElement("button", { onClick: () => openEditGasto(g), className: "p-1.5 rounded-lg", style: { color: "#8A6A66" } },
                                React.createElement(Pencil, { size: 13 })),
                            React.createElement("button", { onClick: () => setConfirmDeleteGasto(g.id), className: "p-1.5 rounded-lg", style: { color: "#B87B7B" } },
                                React.createElement(Trash2, { size: 13 })))))))))),
                tab === "catalogo" && (React.createElement(React.Fragment, null,
                    React.createElement("p", { className: "text-sm mb-4", style: { color: "#8A6A66" } }, "Cadastra aqui os produtos que voc\u00EA vende. Assim, na hora de montar um pedido, voc\u00EA escolhe da lista em vez de digitar \u2014 e a tela de Produ\u00E7\u00E3o consegue agrupar certinho."),
                    produtos.length === 0 ? (React.createElement(EmptyState, { title: "Nenhum produto cadastrado", subtitle: 'Toca em "Novo produto" pra come\u00E7ar seu cat\u00E1logo.' })) : (React.createElement("div", { className: "space-y-2" }, CATEGORIAS.map((cat) => (produtosPorCategoria[cat] || []).length > 0 && (React.createElement("div", { key: cat, className: "mb-2" },
                        React.createElement("p", { className: "text-[11px] font-semibold uppercase tracking-wide mb-1.5 mt-3", style: { color: "#B76E79", letterSpacing: "0.06em" } }, cat),
                        React.createElement("div", { className: "space-y-1.5" }, produtosPorCategoria[cat].map((p) => (React.createElement("div", { key: p.id, className: "rounded-xl border p-3 flex items-center justify-between", style: { background: "#fff", borderColor: "#F1E3DF" } },
                            React.createElement("div", { className: "min-w-0" },
                                React.createElement("span", { className: "text-sm block", style: { color: "#3D2C2E" } }, p.nome),
                                React.createElement("span", { className: "text-[11px]", style: { color: "#A88F8C" } },
                                    "Custo: ",
                                    formatBRL(p.custo))),
                            React.createElement("div", { className: "flex items-center gap-1 shrink-0" },
                                React.createElement("button", { onClick: () => openEditProduto(p), className: "p-1.5 rounded-lg", style: { color: "#8A6A66" } },
                                    React.createElement(Pencil, { size: 13 })),
                                React.createElement("button", { onClick: () => setConfirmDeleteProduto(p.id), className: "p-1.5 rounded-lg", style: { color: "#B87B7B" } },
                                    React.createElement(Trash2, { size: 13 })))))))))))))))),
        showForm && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center", style: { background: "rgba(61,44,46,0.35)" }, onClick: closeForm },
            React.createElement("div", { className: "w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto scrollbar-thin", style: { background: "#FFFDFC" }, onClick: (e) => e.stopPropagation() },
                React.createElement("div", { className: "flex items-center justify-between px-5 pt-5 pb-3 sticky top-0", style: { background: "#FFFDFC" } },
                    React.createElement("h2", { className: "font-display text-lg", style: { color: "#5C3A3F" } }, editId ? "Editar pedido" : "Novo pedido"),
                    React.createElement("button", { onClick: closeForm, className: "p-1 rounded-full", style: { color: "#A88F8C" } },
                        React.createElement(X, { size: 20 }))),
                React.createElement("div", { className: "px-5 pb-6 space-y-3" },
                    React.createElement(Field, { label: "Canal do pedido" },
                        React.createElement("div", { className: "flex gap-1.5" }, CANAIS.map((c) => (React.createElement("button", { key: c.key, onClick: () => setForm({ ...form, canal: c.key }), type: "button", className: "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold border", style: form.canal === c.key ? { background: c.color, borderColor: c.color, color: "#fff" } : { background: "#fff", borderColor: "#EEDDD9", color: "#8A6A66" } },
                            React.createElement(c.icon, { size: 12 }),
                            " ",
                            c.key))))),
                    React.createElement(Field, { label: "Cliente" },
                        React.createElement("input", { className: "input", value: form.cliente, onChange: (e) => setForm({ ...form, cliente: e.target.value }), placeholder: "Nome do cliente" })),
                    React.createElement(Field, { label: "Contato" },
                        React.createElement("input", { className: "input", value: form.contato, onChange: (e) => setForm({ ...form, contato: e.target.value }), placeholder: "WhatsApp / usu\u00E1rio Shopee / Instagram" })),
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex items-center justify-between mb-1" },
                            React.createElement("span", { className: "block text-xs font-semibold", style: { color: "#8A6A66" } }, "Itens do pedido"),
                            React.createElement("button", { type: "button", onClick: addItemRow, className: "text-[11px] font-semibold flex items-center gap-0.5", style: { color: "#B76E79" } },
                                React.createElement(Plus, { size: 12 }),
                                " item")),
                        produtos.length === 0 ? (React.createElement("div", { className: "rounded-xl border border-dashed p-3 text-center", style: { borderColor: "#E3C9C0" } },
                            React.createElement("p", { className: "text-xs mb-2", style: { color: "#A88F8C" } }, "Voc\u00EA ainda n\u00E3o tem produtos cadastrados."),
                            React.createElement("button", { type: "button", onClick: () => openQuickAdd(form.itens[0]?.id), className: "text-xs font-semibold px-3 py-1.5 rounded-full text-white", style: { background: "#B76E79" } }, "Cadastrar produto"))) : (React.createElement("div", { className: "space-y-2" }, form.itens.map((it) => (React.createElement("div", { key: it.id, className: "rounded-xl border p-2.5", style: { borderColor: "#EEDDD9" } },
                            React.createElement("div", { className: "flex gap-1.5" },
                                React.createElement("select", { className: "input", style: { fontSize: "0.8rem" }, value: it.produtoId, onChange: (e) => {
                                        if (e.target.value === "__novo__") {
                                            openQuickAdd(it.id);
                                            return;
                                        }
                                        updateItemRow(it.id, { produtoId: e.target.value });
                                    } },
                                    React.createElement("option", { value: "" }, "Escolhe um produto..."),
                                    CATEGORIAS.map((cat) => (produtosPorCategoria[cat] || []).length > 0 && (React.createElement("optgroup", { key: cat, label: cat }, produtosPorCategoria[cat].map((p) => React.createElement("option", { key: p.id, value: p.id }, p.nome))))),
                                    React.createElement("option", { value: "__novo__" }, "+ Cadastrar novo produto...")),
                                React.createElement("input", { type: "number", min: "1", className: "input", style: { width: 64, fontSize: "0.8rem" }, value: it.quantidade, onChange: (e) => updateItemRow(it.id, { quantidade: e.target.value }) }),
                                form.itens.length > 1 && (React.createElement("button", { type: "button", onClick: () => removeItemRow(it.id), className: "px-2 rounded-lg shrink-0", style: { color: "#B87B7B", background: "#F3E4E4" } },
                                    React.createElement(Minus, { size: 13 })))))))))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2.5" },
                        React.createElement(Field, { label: "Valor total (R$)" },
                            React.createElement("input", { type: "number", step: "0.01", min: "0", className: "input", value: form.valorTotal, onChange: (e) => setForm({ ...form, valorTotal: e.target.value }), placeholder: "0,00" })),
                        React.createElement(Field, { label: "Pagamento" },
                            React.createElement("select", { className: "input", value: form.formaPagamento, onChange: (e) => setForm({ ...form, formaPagamento: e.target.value }) }, PAGAMENTOS.map((c) => React.createElement("option", { key: c }, c))))),
                    (() => {
                        const custoEstimado = calcularCustoItens(form.itens);
                        const lucroEstimado = (Number(form.valorTotal) || 0) - custoEstimado;
                        return (React.createElement("div", { className: "rounded-xl border p-3 flex items-center justify-between", style: { background: "#F9F4F2", borderColor: "#EEDDD9" } },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } }, "Custo estimado"),
                                React.createElement("p", { className: "text-sm font-bold", style: { color: "#8a7ba0", fontFamily: "Fraunces, serif" } }, formatBRL(custoEstimado))),
                            React.createElement("div", { className: "text-right" },
                                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } }, "Lucro estimado"),
                                React.createElement("p", { className: "text-sm font-bold", style: { color: lucroEstimado >= 0 ? "#5C8A6E" : "#9A5555", fontFamily: "Fraunces, serif" } }, formatBRL(lucroEstimado)))));
                    })(),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2.5" },
                        React.createElement(Field, { label: "Data do pedido" },
                            React.createElement("input", { type: "date", className: "input", value: form.dataPedido, onChange: (e) => setForm({ ...form, dataPedido: e.target.value }) })),
                        React.createElement(Field, { label: "Prazo de entrega" },
                            React.createElement("input", { type: "date", className: "input", value: form.prazoEntrega, onChange: (e) => setForm({ ...form, prazoEntrega: e.target.value }) }))),
                    React.createElement(Field, { label: "Status" },
                        React.createElement("select", { className: "input", value: form.status, onChange: (e) => setForm({ ...form, status: e.target.value }) }, STATUSES.map((s) => React.createElement("option", { key: s.key, value: s.key }, s.label)))),
                    React.createElement(Field, { label: "Observa\u00E7\u00F5es" },
                        React.createElement("textarea", { className: "input", rows: 2, value: form.observacoes, onChange: (e) => setForm({ ...form, observacoes: e.target.value }), placeholder: "Detalhes, personaliza\u00E7\u00E3o, embalagem..." })),
                    error && React.createElement("p", { className: "text-xs px-3 py-2 rounded-lg", style: { background: "#F3E4E4", color: "#9A5555" } }, error),
                    React.createElement("button", { onClick: save, className: "w-full mt-2 py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] transition-transform", style: { background: "linear-gradient(135deg, #C08497, #B76E79)" } }, editId ? "Salvar alterações" : "Criar pedido"))))),
        showGastoForm && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center", style: { background: "rgba(61,44,46,0.35)" }, onClick: () => setShowGastoForm(false) },
            React.createElement("div", { className: "w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl", style: { background: "#FFFDFC" }, onClick: (e) => e.stopPropagation() },
                React.createElement("div", { className: "flex items-center justify-between px-5 pt-5 pb-3" },
                    React.createElement("h2", { className: "font-display text-lg", style: { color: "#5C3A3F" } }, editGastoId ? "Editar gasto" : "Novo gasto"),
                    React.createElement("button", { onClick: () => setShowGastoForm(false), className: "p-1 rounded-full", style: { color: "#A88F8C" } },
                        React.createElement(X, { size: 20 }))),
                React.createElement("div", { className: "px-5 pb-6 space-y-3" },
                    React.createElement(Field, { label: "Descri\u00E7\u00E3o" },
                        React.createElement("input", { className: "input", value: gastoForm.descricao, onChange: (e) => setGastoForm({ ...gastoForm, descricao: e.target.value }), placeholder: "Ex: Papel couch\u00E9 115g" })),
                    React.createElement(Field, { label: "Categoria" },
                        React.createElement("select", { className: "input", value: gastoForm.categoria, onChange: (e) => setGastoForm({ ...gastoForm, categoria: e.target.value }) }, GASTO_CATEGORIAS.map((c) => React.createElement("option", { key: c }, c)))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2.5" },
                        React.createElement(Field, { label: "Valor (R$)" },
                            React.createElement("input", { type: "number", step: "0.01", min: "0", className: "input", value: gastoForm.valor, onChange: (e) => setGastoForm({ ...gastoForm, valor: e.target.value }), placeholder: "0,00" })),
                        React.createElement(Field, { label: "Data" },
                            React.createElement("input", { type: "date", className: "input", value: gastoForm.data, onChange: (e) => setGastoForm({ ...gastoForm, data: e.target.value }) }))),
                    React.createElement("button", { onClick: saveGasto, className: "w-full mt-2 py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] transition-transform", style: { background: "linear-gradient(135deg, #8a7ba0, #6f5f8a)" } }, editGastoId ? "Salvar alterações" : "Registrar gasto"))))),
        showProdutoForm && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center", style: { background: "rgba(61,44,46,0.35)" }, onClick: () => { setShowProdutoForm(false); setQuickAddForItem(null); } },
            React.createElement("div", { className: "w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl", style: { background: "#FFFDFC" }, onClick: (e) => e.stopPropagation() },
                React.createElement("div", { className: "flex items-center justify-between px-5 pt-5 pb-3" },
                    React.createElement("h2", { className: "font-display text-lg", style: { color: "#5C3A3F" } }, editProdutoId ? "Editar produto" : "Novo produto"),
                    React.createElement("button", { onClick: () => { setShowProdutoForm(false); setQuickAddForItem(null); }, className: "p-1 rounded-full", style: { color: "#A88F8C" } },
                        React.createElement(X, { size: 20 }))),
                React.createElement("div", { className: "px-5 pb-6 space-y-3" },
                    React.createElement(Field, { label: "Nome do produto" },
                        React.createElement("input", { className: "input", value: produtoForm.nome, onChange: (e) => setProdutoForm({ ...produtoForm, nome: e.target.value }), placeholder: "Ex: Botton 4.4cm - Zod\u00EDaco" })),
                    React.createElement(Field, { label: "Categoria" },
                        React.createElement("select", { className: "input", value: produtoForm.categoria, onChange: (e) => setProdutoForm({ ...produtoForm, categoria: e.target.value }) }, CATEGORIAS.map((c) => React.createElement("option", { key: c }, c)))),
                    React.createElement(Field, { label: "Custo de produ\u00E7\u00E3o por unidade (R$)" },
                        React.createElement("input", { type: "number", step: "0.01", min: "0", className: "input", value: produtoForm.custo, onChange: (e) => setProdutoForm({ ...produtoForm, custo: e.target.value }), placeholder: "0,00" })),
                    React.createElement("p", { className: "text-[11px] -mt-2", style: { color: "#A88F8C" } }, "Some materiais, embalagem e m\u00E3o de obra desse item. Isso \u00E9 usado pra calcular o lucro automaticamente em cada pedido."),
                    React.createElement("button", { onClick: saveProduto, className: "w-full mt-2 py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] transition-transform", style: { background: "linear-gradient(135deg, #C08497, #B76E79)" } }, editProdutoId ? "Salvar alterações" : "Cadastrar produto"))))),
        confirmDelete && (React.createElement(ConfirmModal, { text: "Excluir pedido?", onCancel: () => setConfirmDelete(null), onConfirm: () => remove(confirmDelete) })),
        confirmDeleteGasto && (React.createElement(ConfirmModal, { text: "Excluir gasto?", onCancel: () => setConfirmDeleteGasto(null), onConfirm: () => removeGasto(confirmDeleteGasto) })),
        confirmDeleteProduto && (React.createElement(ConfirmModal, { text: "Excluir produto?", sub: "Pedidos que j\u00E1 usam esse produto v\u00E3o mostrar 'Produto removido'.", onCancel: () => setConfirmDeleteProduto(null), onConfirm: () => removeProduto(confirmDeleteProduto) }))));
}
function TabBtn({ active, onClick, icon: Icon, label }) {
    return (React.createElement("button", { onClick: onClick, className: "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors", style: active ? { background: "#fff", color: "#B76E79", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" } : { color: "#A88F8C" } },
        React.createElement(Icon, { size: 14 }),
        " ",
        label));
}
function EmptyState({ title, subtitle }) {
    return (React.createElement("div", { className: "text-center py-16 rounded-2xl border border-dashed", style: { borderColor: "#E3C9C0" } },
        React.createElement("p", { className: "font-display text-lg mb-1", style: { color: "#B76E79" } }, title),
        React.createElement("p", { className: "text-sm", style: { color: "#A88F8C" } }, subtitle)));
}
function ConfirmModal({ text, sub, onCancel, onConfirm }) {
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center px-6", style: { background: "rgba(61,44,46,0.35)" }, onClick: onCancel },
        React.createElement("div", { className: "bg-white rounded-2xl p-5 max-w-xs w-full", onClick: (e) => e.stopPropagation() },
            React.createElement("p", { className: "font-display text-base mb-1", style: { color: "#5C3A3F" } }, text),
            React.createElement("p", { className: "text-sm mb-4", style: { color: "#A88F8C" } }, sub || "Essa ação não pode ser desfeita."),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", { onClick: onCancel, className: "flex-1 py-2 rounded-lg text-sm font-medium", style: { background: "#F3EEEB", color: "#5C3A3F" } }, "Cancelar"),
                React.createElement("button", { onClick: onConfirm, className: "flex-1 py-2 rounded-lg text-sm font-medium text-white", style: { background: "#9A5555" } }, "Excluir")))));
}
function Field({ label, children }) {
    return (React.createElement("label", { className: "block" },
        React.createElement("span", { className: "block text-xs font-semibold mb-1", style: { color: "#8A6A66" } }, label),
        children));
}
function StatCard({ label, value, accent }) {
    return (React.createElement("div", { className: "rounded-xl px-3 py-3 border", style: { background: "#fff", borderColor: "#F1E3DF" } },
        React.createElement("p", { className: "text-xl font-bold", style: { color: accent || "#5C3A3F", fontFamily: "Fraunces, serif" } }, value),
        React.createElement("p", { className: "text-[11px] mt-0.5", style: { color: "#A88F8C" } }, label)));
}
function FilterPill({ active, onClick, label, color }) {
    return (React.createElement("button", { onClick: onClick, className: "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", style: active ? { background: color || "#B76E79", borderColor: color || "#B76E79", color: "#fff" } : { background: "#fff", borderColor: "#EEDDD9", color: "#8A6A66" } }, label));
}
function OrderCard({ p, produtoNome, onEdit, onDelete, onStatus }) {
    const meta = statusMeta(p.status);
    const canal = canalMeta(p.canal);
    const Icon = meta.icon;
    const CanalIcon = canal.icon;
    const [open, setOpen] = useState(false);
    const resumoItens = (p.itens || []).map((i) => `${i.quantidade}x ${produtoNome(i.produtoId)}`).join(", ");
    return (React.createElement("div", { className: "rounded-2xl border p-3.5", style: { background: "#fff", borderColor: "#F1E3DF" } },
        React.createElement("div", { className: "flex items-start justify-between gap-2" },
            React.createElement("div", { className: "min-w-0" },
                React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" },
                    React.createElement("span", { className: "text-[11px] font-mono px-1.5 py-0.5 rounded", style: { background: "#F3EEEB", color: "#8A6A66" } }, p.codigo),
                    React.createElement("span", { className: "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded", style: { background: canal.bg, color: canal.color } },
                        React.createElement(CanalIcon, { size: 10 }),
                        p.canal),
                    React.createElement("span", { className: "text-sm font-semibold truncate", style: { color: "#3D2C2E" } }, p.cliente)),
                React.createElement("p", { className: "text-sm mt-1", style: { color: "#6B5450" } }, resumoItens),
                React.createElement("div", { className: "flex items-center gap-3 mt-1.5 text-[11px]", style: { color: "#A88F8C" } },
                    React.createElement("span", null, formatDate(p.dataPedido)),
                    p.prazoEntrega && React.createElement("span", null,
                        "Prazo: ",
                        formatDate(p.prazoEntrega)))),
            React.createElement("div", { className: "text-right shrink-0" },
                React.createElement("p", { className: "text-sm font-bold", style: { color: "#B76E79", fontFamily: "Fraunces, serif" } }, formatBRL(p.valorTotal)),
                typeof p.custoTotal === "number" && (React.createElement("p", { className: "text-[10px]", style: { color: (p.lucro ?? (Number(p.valorTotal) - p.custoTotal)) >= 0 ? "#5C8A6E" : "#9A5555" } },
                    "lucro ",
                    formatBRL(p.lucro ?? (Number(p.valorTotal) - p.custoTotal)))))),
        React.createElement("div", { className: "flex items-center justify-between mt-3" },
            React.createElement("div", { className: "relative" },
                React.createElement("button", { onClick: () => setOpen((o) => !o), className: "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold", style: { background: meta.bg, color: meta.color } },
                    React.createElement(Icon, { size: 12 }),
                    " ",
                    meta.label,
                    " ",
                    React.createElement(ChevronDown, { size: 12 })),
                open && (React.createElement("div", { className: "absolute left-0 top-full mt-1 z-10 rounded-xl border shadow-md overflow-hidden", style: { background: "#fff", borderColor: "#EEDDD9", minWidth: 150 } }, STATUSES.map((s) => (React.createElement("button", { key: s.key, onClick: () => { onStatus(s.key); setOpen(false); }, className: "w-full text-left px-3 py-2 text-xs flex items-center gap-2", style: { color: s.color, background: s.key === p.status ? s.bg : "transparent" } },
                    React.createElement(s.icon, { size: 12 }),
                    " ",
                    s.label)))))),
            React.createElement("div", { className: "flex items-center gap-1" },
                React.createElement("button", { onClick: onEdit, className: "p-1.5 rounded-lg", style: { color: "#8A6A66" } },
                    React.createElement(Pencil, { size: 14 })),
                React.createElement("button", { onClick: onDelete, className: "p-1.5 rounded-lg", style: { color: "#B87B7B" } },
                    React.createElement(Trash2, { size: 14 }))))));
}
function PickingGroup({ g, picked, onToggle }) {
    const [open, setOpen] = useState(true);
    const done = g.refs.filter((r) => picked[`${r.pedidoId}:${r.itemId}`]).length;
    const pct = Math.round((done / g.refs.length) * 100);
    return (React.createElement("div", { className: "rounded-2xl border overflow-hidden", style: { background: "#fff", borderColor: "#F1E3DF" } },
        React.createElement("button", { onClick: () => setOpen((o) => !o), className: "w-full flex items-center justify-between p-3.5" },
            React.createElement("div", { className: "text-left" },
                React.createElement("p", { className: "text-sm font-semibold", style: { color: "#3D2C2E" } }, g.nome),
                React.createElement("p", { className: "text-[11px]", style: { color: "#A88F8C" } },
                    g.categoria,
                    " \u00B7 ",
                    g.refs.length,
                    " pedido",
                    g.refs.length > 1 ? "s" : "")),
            React.createElement("div", { className: "flex items-center gap-2.5" },
                React.createElement("div", { className: "text-right" },
                    React.createElement("p", { className: "text-lg font-bold", style: { color: "#B76E79", fontFamily: "Fraunces, serif" } }, g.total),
                    React.createElement("p", { className: "text-[10px]", style: { color: "#A88F8C" } },
                        done,
                        "/",
                        g.refs.length,
                        " separados")),
                React.createElement(ChevronDown, { size: 16, style: { color: "#C9A9A6", transform: open ? "rotate(180deg)" : "none" } }))),
        React.createElement("div", { className: "h-1", style: { background: "#F3EEEB" } },
            React.createElement("div", { className: "h-1", style: { width: `${pct}%`, background: "#B76E79" } })),
        open && (React.createElement("div", { className: "px-3.5 pb-3.5 pt-1 space-y-1.5" }, g.refs.map((r) => {
            const key = `${r.pedidoId}:${r.itemId}`;
            const isDone = !!picked[key];
            return (React.createElement("button", { key: key, onClick: () => onToggle(r.pedidoId, r.itemId), className: "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left", style: { background: isDone ? "#E4EFE6" : "#FBF8F6" } },
                React.createElement("div", { className: "flex items-center gap-2 min-w-0" },
                    React.createElement("div", { className: "w-4 h-4 rounded flex items-center justify-center shrink-0", style: { background: isDone ? "#5C8A6E" : "#fff", border: isDone ? "none" : "1px solid #C9A9A6" } }, isDone && React.createElement(Check, { size: 11, color: "#fff", strokeWidth: 3 })),
                    React.createElement("span", { className: "text-xs font-mono", style: { color: "#8A6A66" } }, r.codigo),
                    React.createElement("span", { className: "text-xs truncate", style: { color: "#3D2C2E" } }, r.cliente)),
                React.createElement("span", { className: "text-xs font-semibold shrink-0", style: { color: isDone ? "#5C8A6E" : "#B76E79" } },
                    r.quantidade,
                    "x")));
        })))));
}
const __root = createRoot(document.getElementById("root"));
__root.render(React.createElement(App, null));
