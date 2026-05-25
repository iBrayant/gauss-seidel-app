export interface IterationData {
  k: number;
  x: number[];
  error: number | null;
}

export interface GaussSeidelResult {
  hasConverged: boolean;
  solution: number[] | null;
  results: IterationData[];
  errorMsg: string;
  warningMsg: string;
}

/**
 * Módulo para resolver sistemas de ecuaciones lineales mediante el Método de Gauss-Seidel.
 * 
 * Este método iterativo requiere una matriz inicial de coeficientes A y un vector b.
 * La matriz idealmente debe ser Estrictamente Diagonal Dominante (EDD) para asegurar la convergencia.
 */
export function calculateGaussSeidel(
  matrixStrings: string[][],
  vectorStrings: string[],
  tolString: string,
  maxIterString: string
): GaussSeidelResult {
  
  let hasConverged = false;
  let solution: number[] | null = null;
  const iterData: IterationData[] = [];
  let errorMsg = "";
  let warningMsg = "";

  try {
    const n = matrixStrings.length;

    // --- PASO 1: Captura y Validación de Parámetros ---
    // Convertimos los inputs a formato numérico de alta precisión
    const A = matrixStrings.map(row => row.map(val => parseFloat(val)));
    const b = vectorStrings.map(val => parseFloat(val));
    const tolerance = parseFloat(tolString);
    const maxI = parseInt(maxIterString);

    if (A.some(row => row.some(val => isNaN(val))) || b.some(val => isNaN(val))) {
      throw new Error("La matriz y el vector deben contener valores numéricos válidos.");
    }
    if (isNaN(tolerance) || tolerance <= 0) {
      throw new Error("La tolerancia debe ser un número positivo.");
    }
    if (isNaN(maxI) || maxI <= 0) {
      throw new Error("El máximo de iteraciones debe ser un entero positivo.");
    }

    // --- PASO 2: Verificación de Condición de Convergencia (Matriz EDD) ---
    // Comprobamos si la matriz es Estrictamente Diagonal Dominante.
    let isDominant = true;
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += Math.abs(A[i][j]);
      }
      
      // La diagonal principal debe ser mayor en valor absoluto que la suma del resto de su fila
      if (Math.abs(A[i][i]) <= sum) {
        isDominant = false;
        // La diagonal no puede ser cero, porque la fórmula requiere dividir entre A[i][i]
        if (A[i][i] === 0) {
           throw new Error(`El elemento en la diagonal principal A[${i+1}][${i+1}] es 0. El método no se puede aplicar.`);
        }
      }
    }

    if (!isDominant) {
      warningMsg = "Advertencia: La matriz no es estrictamente diagonal dominante. El método puede no converger.";
    }

    // --- PASO 3: Inicialización del Proceso Iterativo ---
    let x_old = Array(n).fill(0); // Vector de estado anterior
    let x_new = Array(n).fill(0); // Vector de estado actual (actualizado dinámicamente)
    let k = 0;
    
    iterData.push({ k: 0, x: [...x_old], error: null });

    let currentError = 100;

    // --- PASO 4: Bucle Principal ---
    do {
      k++;
      let maxDiff = 0;
      let maxNew = 0;

      for (let i = 0; i < n; i++) {
        let sum = 0;
        
        // La gran diferencia con Jacobi: en Gauss-Seidel usamos de inmediato 
        // los valores de x_new[j] que ya fueron calculados en la iteración actual (j < i).
        for (let j = 0; j < n; j++) {
          if (i !== j) sum += A[i][j] * x_new[j]; 
        }
        
        // Fórmula central de Gauss-Seidel para la componente i
        let x_i_new_val = (b[i] - sum) / A[i][i];
        
        // Cálculo del error máximo absoluto para esta iteración
        let diff = Math.abs(x_i_new_val - x_old[i]);
        if (diff > maxDiff) maxDiff = diff;
        
        let absNew = Math.abs(x_i_new_val);
        if (absNew > maxNew) maxNew = absNew;

        // Actualizamos x_new[i] inmediatamente, acelerando la convergencia para el próximo i
        x_new[i] = x_i_new_val; 
      }

      // --- PASO 5: Criterio de Parada (Error Relativo Aproximado) ---
      // Calculamos el error usando la norma infinito (el máximo cambio ocurrido)
      currentError = maxNew === 0 ? 0 : maxDiff / maxNew;

      x_old = [...x_new];
      iterData.push({ k: k, x: [...x_old], error: currentError });

      // Detenemos el bucle si alcanzamos la tolerancia deseada
      if (currentError < tolerance) {
        hasConverged = true;
        break;
      }

    } while (k < maxI);

    // --- PASO 6: Resultados Finales ---
    if (hasConverged) {
      solution = [...x_old];
    } else {
      errorMsg = "No converge: Se alcanzó el número máximo de iteraciones permitido.";
    }

  } catch (err: any) {
    errorMsg = err.message || "Error al calcular el método.";
  }

  return {
    hasConverged,
    solution,
    results: iterData,
    errorMsg,
    warningMsg
  };
}
