import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { fetchClientesSuggest } from '../api/clientes';

export default function ClientAutocomplete({
    valueId,
    valueText,
    onSelect,
    onTextChange,
    placeholder = 'Buscar cliente...',
    maxSuggestions = 5,
    debounceMs = 250,
}) {
    const [query, setQuery] = useState(valueText || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const debounceRef = useRef(null);

    const load = useCallback(async (q) => {
        if (!q || q.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchClientesSuggest(q, maxSuggestions);
            setSuggestions(data);
            setOpen(true);
            setActiveIndex(data.length ? 0 : -1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [maxSuggestions]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => load(query), debounceMs);
        return () => debounceRef.current && clearTimeout(debounceRef.current);
    }, [query, load, debounceMs]);

    // Sincronizar cambios externos del texto (por ej. al completar por ID)
    useEffect(() => {
        if (valueText !== undefined && valueText !== query) {
            setQuery(valueText || '');
        }
    }, [valueText]);

    const handleSelect = (s) => {
        onSelect?.(s);
        setQuery(`${s.nombre} ${s.apellido}`);
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                e.preventDefault();
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    // Cerrar al click fuera
    useEffect(() => {
        const handler = (ev) => {
            if (!containerRef.current || containerRef.current.contains(ev.target)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const highlight = (text) => {
        if (!query || query.length < 2) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark>{text.slice(idx, idx + query.length)}</mark>
                {text.slice(idx + query.length)}
            </>
        );
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }} aria-expanded={open} aria-haspopup="listbox">
            <Form.Label>Cliente</Form.Label>
            <Form.Control
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={(e) => { const val = e.target.value; setQuery(val); setOpen(true); onTextChange?.(val); }}
                onKeyDown={handleKeyDown}
                aria-autocomplete="list"
                aria-controls="cliente-autocomplete-list"
                aria-activedescendant={activeIndex >= 0 ? `cliente-opt-${activeIndex}` : undefined}
            />
            {loading && (
                <div style={{ position: 'absolute', top: 8, right: 10 }} aria-label="Cargando sugerencias">
                    <Spinner animation="border" size="sm" />
                </div>
            )}
            {open && (
                <div
                    ref={listRef}
                    id="cliente-autocomplete-list"
                    role="listbox"
                    className="border rounded mt-1 bg-white shadow-sm"
                    style={{ position: 'absolute', zIndex: 20, width: '100%', maxHeight: 220, overflowY: 'auto' }}
                >
                    {suggestions.length === 0 && !loading && (
                        <div className="px-2 py-2 text-muted small" role="alert">Sin resultados</div>
                    )}
                    {suggestions.map((s, i) => (
                        <button
                            key={s.id_cliente}
                            id={`cliente-opt-${i}`}
                            type="button"
                            role="option"
                            aria-selected={i === activeIndex}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => handleSelect(s)}
                            className={`w-100 text-start px-2 py-2 border-0 bg-transparent ${i === activeIndex ? 'bg-light' : ''}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 12 }}>
                                    {s.nombre.charAt(0)}{s.apellido.charAt(0)}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-medium">{highlight(`${s.nombre} ${s.apellido}`)}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>Similitud {Math.round(s.similaridad * 100)}%</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
