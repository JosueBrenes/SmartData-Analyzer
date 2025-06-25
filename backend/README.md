# 🧠 Backend de Análisis Inteligente de Datos

Este backend contiene el script `analyze.py` que realiza análisis automático de datos tabulares usando técnicas de inteligencia artificial. El script es ejecutado por el servidor Next.js mediante `child_process.spawn`.

## 📦 Requisitos

- Python 3.8 o superior
- pip

## 🧪 Instalación de dependencias

Instala los paquetes necesarios con:

```bash
pip install pandas scikit-learn
```

```bash
pip install pandas
```

Puedes opcionalmente crear un entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install pandas scikit-learn
```

## 🚀 Uso manual (opcional)

Para probar el script localmente:

```bash
python analyze.py path/al/archivo.csv
```

El script imprimirá un JSON con los resultados:

- Clusters asignados (KMeans)
- Outliers detectados (Isolation Forest)
- Matriz de correlaciones (Pearson)

## 📁 Estructura esperada

Este script está pensado para ser ejecutado por el backend de la aplicación principal (Next.js). Debe ubicarse en una carpeta `backend/` en la raíz del proyecto.
