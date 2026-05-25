"use client";

import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, RefreshCw, Grid3X3, AlertTriangle } from "lucide-react";
import { calculateGaussSeidel, IterationData } from "../math/gaussSeidel";

export default function GaussSeidelMethodApp() {
  const [n, setN] = useState(3);
  const [matrix, setMatrix] = useState<string[][]>([
    ["10", "2", "-1"],
    ["-3", "-6", "2"],
    ["1", "1", "5"]
  ]);
  const [vector, setVector] = useState<string[]>(["27", "-61.5", "-21.5"]);
  const [tol, setTol] = useState("0.0001");
  const [maxIter, setMaxIter] = useState("50");

  const [results, setResults] = useState<IterationData[]>([]);
  const [solution, setSolution] = useState<number[] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [converged, setConverged] = useState(false);

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newN = parseInt(e.target.value);
    if (isNaN(newN)) return;
    if (newN < 2) newN = 2;
    if (newN > 10) newN = 10;
    setN(newN);
    setMatrix(prev => {
       return Array.from({length: newN}, (_, i) => 
          Array.from({length: newN}, (_, j) => (prev[i] && prev[i][j] !== undefined ? prev[i][j] : "0"))
       );
    });
    setVector(prev => Array.from({length: newN}, (_, i) => (prev[i] !== undefined ? prev[i] : "0")));
  };

  const handleMatrixChange = (i: number, j: number, val: string) => {
    const newMat = [...matrix];
    newMat[i] = [...newMat[i]];
    newMat[i][j] = val;
    setMatrix(newMat);
  };

  const handleVectorChange = (i: number, val: string) => {
    const newVec = [...vector];
    newVec[i] = val;
    setVector(newVec);
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setWarningMsg("");
    setResults([]);
    setSolution(null);
    setHasCalculated(true);
    setConverged(false);

    try {
      // Llamada al módulo matemático aislado
      const result = calculateGaussSeidel(matrix, vector, tol, maxIter);

      if (result.errorMsg) {
        setErrorMsg(result.errorMsg);
      }
      if (result.warningMsg) {
        setWarningMsg(result.warningMsg);
      }

      setResults(result.results);
      if (result.hasConverged) {
        setConverged(true);
        setSolution(result.solution);
      }

    } catch (err: any) {
      setErrorMsg(err.message || "Error al calcular el método.");
    }
  };

  const chartData = results.filter(r => r.error !== null).map(r => ({
    k: r.k,
    error: r.error
  }));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-12">
      <header className="bg-white border-b border-stone-200 shadow-sm py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <Grid3X3 className="text-yellow-600" size={28} />
          <h1 className="text-2xl font-bold text-stone-800">
            Método de Gauss-Seidel
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-lg font-semibold mb-4 text-stone-800">Parámetros del Sistema</h2>
            <form onSubmit={calculate} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Dimensión de la matriz (<InlineMath math="n \times n" />)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={n}
                  onChange={handleSizeChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                  required
                />
              </div>

              <div className="overflow-x-auto pb-2">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Matriz <InlineMath math="A" /> y Vector <InlineMath math="b" />
                </label>
                <div className="flex gap-4 items-center min-w-max">
                  {/* Matrix A */}
                  <div className="border-l-2 border-r-2 border-stone-800 px-2 flex flex-col gap-2">
                    {matrix.map((row, i) => (
                      <div key={`row-${i}`} className="flex gap-2">
                        {row.map((val, j) => (
                          <input
                            key={`cell-${i}-${j}`}
                            type="text"
                            value={val}
                            onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                            className="w-16 text-center px-1 py-1.5 border border-stone-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono text-sm"
                            required
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xl font-bold text-stone-400">
                    <InlineMath math="\vec{x} =" />
                  </div>

                  {/* Vector b */}
                  <div className="border-l-2 border-r-2 border-stone-800 px-2 flex flex-col gap-2">
                    {vector.map((val, i) => (
                      <input
                        key={`vec-${i}`}
                        type="text"
                        value={val}
                        onChange={(e) => handleVectorChange(i, e.target.value)}
                        className="w-16 text-center px-1 py-1.5 border border-stone-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono text-sm bg-yellow-50"
                        required
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Tolerancia (<InlineMath math="\text{tol}" />)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tol}
                    onChange={(e) => setTol(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Iteraciones máx.
                  </label>
                  <input
                    type="number"
                    value={maxIter}
                    onChange={(e) => setMaxIter(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-stone-900 font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <RefreshCw size={18} />
                Calcular Método
              </button>
            </form>
          </div>
          
          {/* Panel de Fórmulas: Explicación académica de lo que ocurre en el código */}
          <div className="bg-yellow-50/50 p-6 rounded-2xl border border-yellow-200">
            <h3 className="text-sm font-semibold text-yellow-900 mb-3 uppercase tracking-wider">Fórmula de Iteración</h3>
            <div className="text-center overflow-x-auto py-2">
              <BlockMath math="x_i^{(k+1)} = \frac{1}{a_{ii}} \left( b_i - \sum_{j < i} a_{ij} x_j^{(k+1)} - \sum_{j > i} a_{ij} x_j^{(k)} \right)" />
            </div>
            <p className="text-xs text-yellow-700 mt-2 text-center">
              <strong>Nota Académica:</strong> A diferencia de Jacobi, aquí se utilizan los valores de <InlineMath math="x" /> en cuanto se calculan (<InlineMath math="k+1" />), lo que suele acelerar la convergencia.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {warningMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <p>{warningMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p>{errorMsg}</p>
            </div>
          )}

          {!hasCalculated && !errorMsg && (
            <div className="bg-white border border-stone-200 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center text-stone-400">
              <Grid3X3 size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Ingresa los parámetros y presiona Calcular</p>
            </div>
          )}

          {hasCalculated && solution !== null && converged && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="text-emerald-800 font-semibold mb-1">Converge ✓</h3>
                <p className="text-emerald-600 text-sm">El método encontró la solución exitosamente.</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-emerald-100 flex gap-4 overflow-x-auto max-w-full">
                {solution.map((val, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-xs text-stone-500 font-medium">x{i+1}</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {val.toFixed(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualización de Resultados: Tabla paso a paso para la sustentación */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden w-full">
              <div className="p-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="font-semibold text-stone-800">Tabla de Iteraciones</h3>
                <p className="text-xs text-stone-500">Muestra la evolución de cada variable y el error máximo en cada paso.</p>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-stone-500 uppercase bg-stone-50">
                    <tr>
                      <th className="px-6 py-3 font-medium whitespace-nowrap">k (Iteración)</th>
                      {Array.from({length: n}).map((_, i) => (
                        <th key={`th-${i}`} className="px-6 py-3 font-medium whitespace-nowrap"><InlineMath math={`x_{${i+1}}`} /></th>
                      ))}
                      <th className="px-6 py-3 font-medium whitespace-nowrap">Error Relativo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {results.map((r) => (
                      <tr key={r.k} className="hover:bg-stone-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-stone-900">{r.k}</td>
                        {r.x.map((val, i) => (
                          <td key={`td-${r.k}-${i}`} className="px-6 py-4 font-mono">{val.toFixed(6)}</td>
                        ))}
                        <td className="px-6 py-4 font-mono">
                          {r.error === null ? "-" : r.error.toExponential(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gráfico de Convergencia: Interpretación visual del error */}
          {chartData.length > 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-800 mb-2">Convergencia del Error</h3>
              <p className="text-xs text-stone-500 mb-6">
                Representa cómo el error disminuye logarítmicamente. Si la línea baja, el método está convergiendo hacia la solución.
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="k" 
                      type="number" 
                      domain={['dataMin', 'dataMax']} 
                      allowDecimals={false}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tickFormatter={(val) => val.toExponential(1)}
                    />
                    <Tooltip 
                      formatter={(value: any) => typeof value === 'number' ? value.toExponential(4) : value}
                      labelFormatter={(label: any) => `Iteración k = ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="error" 
                      stroke="#eab308" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: "#eab308" }}
                      name="Error"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
