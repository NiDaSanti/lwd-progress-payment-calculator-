import { useMemo, useState } from 'react';
import { parseToCents, formatCents } from './domain/money'
import type { Cents } from './domain/money'
import { calculateRemainingSplit } from './domain/split'
import type { SubLine } from './domain/split'
import './App.css'

type EntryRow = {
  id: string;
  subName: string;
  amountInput: string;
};

function App() {
  const [totalInput, setTotalInput] = useState('');
  const [rows, setRows] = useState<EntryRow[]>([
    {id: crypto.randomUUID(), subName: 'Subcontractor 1', amountInput: ''}
  ]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        subName: `Subcontractor ${prev.length + 1}`,
        amountInput: '',
      }
    ])
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function updateRowName(id: string, subName: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, subName } : row))
    );
  }

  function updateRowAmount(id: string, amountInput: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, amountInput } : row))
    );
  }

  const totalCents = useMemo(() => parseToCents(totalInput), [totalInput]);
 
  const parsedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        amountCents: parseToCents(row.amountInput),
      })),
    [rows]
  );

  const rowResults = useMemo(() => {
    return parsedRows.map((row) => {
      if (totalCents === null || row.amountCents === null) {
        return {
          ...row,
          result: null,
          shareOfPaymentPercentage: 0,
        };
      }

      const subLine: SubLine = {
        id: row.id,
        subName: row.subName,
        costCodeId: 'cc-1',
        amountCents: row.amountCents,
      };

      return {
        ...row,
        result: calculateRemainingSplit(totalCents, subLine),
        shareOfPaymentPercentage: totalCents === 0
          ? 0
          : Math.round(((row.amountCents / totalCents) * 100) * 100) / 100,
      };
    });
  }, [parsedRows, totalCents]);

  const totalSublineCents = useMemo(() => {
    return parsedRows.reduce((sum, row) => sum + (row.amountCents ?? 0), 0) as Cents;
  }, [parsedRows]);

  const aggregateAllocatedPercentage = useMemo(() => {
    if (totalCents === null || totalCents === 0) {
      return 0;
    }

    return Math.round(((totalSublineCents / totalCents) * 100) * 100) / 100;
  }, [totalCents, totalSublineCents]);

  const aggregateRemainingCents = useMemo(() => {
    if (totalCents === null) {
      return 0 as Cents;
    }

    return Math.max(0, totalCents - totalSublineCents) as Cents;
  }, [totalCents, totalSublineCents]);

  const aggregateRemainingPercentage = useMemo(() => {
    if (totalCents === null || totalCents === 0) {
      return 0;
    }

    return Math.round(((aggregateRemainingCents / totalCents) * 100) * 100) / 100;
  }, [aggregateRemainingCents, totalCents]);

  const totalError = totalInput.trim() !== '' && totalCents === null;
  const hasAnyRowError = parsedRows.some(
    (row) => row.amountInput.trim() !== '' && row.amountCents === null
  );
  const isOverAllocated = totalCents !== null && totalSublineCents > totalCents;

  const safeTotal = (totalCents ?? 0) as Cents;

  return (
    <main className="app-shell">
      <section className="title-block">
  <h1>Progress Payment Split</h1>
        <p>Enter the homeowner payment and each subcontractor’s amount.</p>
        <div className="purpose-note" role="note" aria-label="Purpose of this app">
          <strong>How this helps:</strong>
          <p>
            This tool quickly calculates subcontractor share, total sub cost, and margin so your team can enter accurate numbers in Buildertrend without using a calculator.
          </p>
        </div>
      </section>

      <section className="calculator-grid" aria-label="Split calculator">
        <div className="panel panel-workspace">
          <div className="total-input-row">
            <label htmlFor="total-input">Homeowner payment</label>
            <input
              id="total-input"
              value={totalInput}
              onChange={(event) => setTotalInput(event.target.value)}
              placeholder="7000 or $7,000"
            />
            <small>e.g. 7000 or $7,000.50</small>
            {totalError ? <p className="error-text">Enter a valid total amount.</p> : null}
          </div>

          <div className="rows-header">
            <h2>Subcontractors</h2>
            <button type="button" className="btn btn-primary" onClick={addRow}>+ Add subcontractor</button>
          </div>

          <div className="rows-list">
            {rowResults.map((row, index) => (
              <article key={row.id} className="row-card">
                <div className="row-card-head">
                  <strong>Subcontractor {index + 1}</strong>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    Remove
                  </button>
                </div>

                <div className="row-inputs">
                  <label>
                    Subcontractor name
                    <input
                      value={row.subName}
                      onChange={(event) => updateRowName(row.id, event.target.value)}
                      placeholder="Subcontractor name"
                    />
                  </label>

                  <label>
                    Amount to sub
                    <input
                      value={row.amountInput}
                      onChange={(event) => updateRowAmount(row.id, event.target.value)}
                      placeholder="2300 or $2,300"
                    />
                  </label>
                </div>

                {row.amountInput.trim() !== '' && row.amountCents === null ? (
                  <p className="error-text">Enter a valid amount for {row.subName || `Sub line ${index + 1}`}.</p>
                ) : null}

                <div className="row-metrics">
                  <p>
                    <span>Share of payment</span>
                    <strong>{row.shareOfPaymentPercentage.toFixed(2)}%</strong>
                  </p>
                </div>
              </article>
            ))}
          </div>

          {hasAnyRowError ? <p className="warning-text">One or more sub-line amounts are invalid.</p> : null}
        </div>

        <aside className="panel panel-summary" aria-label="Summary">
          <h2>Summary</h2>
          <div className="summary-grid">
            <div>
              <span>Homeowner payment</span>
              <strong>{formatCents(safeTotal)}</strong>
            </div>
            <div>
              <span>Paid to subcontractors</span>
              <strong>{formatCents(totalSublineCents)}</strong>
            </div>
            <div>
              <span>LWD keeps</span>
              <strong>{formatCents(aggregateRemainingCents)}</strong>
            </div>
            <div>
              <span>Sub cost %</span>
              <strong>{aggregateAllocatedPercentage.toFixed(2)}%</strong>
            </div>
            <div>
              <span>Margin</span>
              <strong>{aggregateRemainingPercentage.toFixed(2)}%</strong>
            </div>
          </div>

          {isOverAllocated ? (
            <p className="error-text">
              Over by {formatCents((totalSublineCents - (totalCents ?? 0)) as Cents)}.
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  )
}

export default App
