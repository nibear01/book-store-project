import { useEffect, useMemo, useState, useRef } from 'react';
import { QUALITIES, SIDES, SIZES, COLOR, computeConfiguredPrice, defaultPrintState } from './BookPrintPricing';

/*
  BookPrintConfig: allows user to configure physical copy pricing.
  Props:
    basePrice: number (book.price)
    onChange: (state) => void
    value: { paperQuality, printSide, paperSize, colorMode }

  Pricing rules (example heuristic - adjust as needed):
    - paperQuality multiplier: economy 1.0, standard 1.15, premium 1.3
    - printSide: single 1.0, double 1.1 (slight premium for duplex handling) OR discount? choose 0.95 => We'll pick slight discount for double side to encourage: single 1.0, double 0.92
    - paperSize: A5 0.85, A4 1.0, A3 1.25
    - colorMode: bw 1.0, color 1.4
    Final price = round( basePrice * q * side * size * color, 2 )
*/

// All constants & compute function imported from BookPrintPricing to satisfy
// react-refresh rule (this file now only exports a component by default).

const BookPrintConfig = ({ basePrice = 0, value, onChange }) => {
  // Normalize incoming value only once (avoid mutating external object)
  const initialRef = useRef(null);
  if (initialRef.current === null) {
    const v = value || {};
    initialRef.current = {
      paperQuality: QUALITIES.some(q=>q.id===v.paperQuality) ? v.paperQuality : defaultPrintState.paperQuality,
      printSide: SIDES.some(s=>s.id===v.printSide) ? v.printSide : defaultPrintState.printSide,
      paperSize: SIZES.some(z=>z.id===v.paperSize) ? v.paperSize : defaultPrintState.paperSize,
      colorMode: COLOR.some(c=>c.id===v.colorMode) ? v.colorMode : defaultPrintState.colorMode,
    };
  }

  const [local, setLocal] = useState(initialRef.current);

  // Clamp / sanitize base price
  const safeBase = Number.isFinite(basePrice) && basePrice >= 0 ? basePrice : 0;

  const price = useMemo(() => computeConfiguredPrice(safeBase, local), [safeBase, local]);

  // Emit changes only when derived output or selection changes (avoid loops)
  const lastEmitted = useRef(null);
  useEffect(() => {
    const payload = { ...local, price };
    const json = JSON.stringify(payload);
    if (json !== lastEmitted.current) {
      lastEmitted.current = json;
      onChange && onChange(payload);
    }
  }, [local, price, onChange]);

  const makeSetter = (key) => (id) => {
    setLocal(prev => prev[key] === id ? prev : { ...prev, [key]: id });
  };

  const Section = ({ title, options, activeId, setActive }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = opt.id === activeId;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => setActive(opt.id)}
              className={`px-3 py-1 text-sm rounded-[2px] border transition ${active ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'}`}
            >
              <div className="font-medium">{opt.label}</div>
              {opt.note && <div className="text-[9px] opacity-70 mt-0.5">{opt.note}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mt-4 space-y-6">
  <Section title="Paper Quality" options={QUALITIES} activeId={local.paperQuality} setActive={makeSetter('paperQuality')} />
  <Section title="Print Side" options={SIDES} activeId={local.printSide} setActive={makeSetter('printSide')} />
  <Section title="Paper Size" options={SIZES} activeId={local.paperSize} setActive={makeSetter('paperSize')} />
  <Section title="Color Mode" options={COLOR} activeId={local.colorMode} setActive={makeSetter('colorMode')} />

      <div className="p-4 bg-gray-50 rounded-[2px] border text-sm flex items-center justify-between">
        <span className="text-gray-600">Configured Price</span>
        <span className="text-lg font-semibold">৳{price}</span>
      </div>
    </div>
  );
};

export default BookPrintConfig;
