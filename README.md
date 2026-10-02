# ASTEMO - GAS MONITORING (Concept Prototype)

Prototipe interaktif web monitoring sistem gas industrial berdasarkan desain Figma resmi **ASTEMO - GAS MONITORING**.

---

## Fitur Utama

### 1. Realtime Monitoring
* **Visualisasi Tangki 3D Realtime**: Indikator kolom gas cutaway transparan yang naik-turun sesuai simulasi data realtime.
* **Status Card Dinamis**:
  * Actual Tank Level (Nm²) dengan status indikator Normal / Warning / Critical.
  * Actual Pressure (bar) dengan ambang batas normal dan warning.
  * Hourly Consumption (Nm³/h) dengan bar chart mini.
  * Total Daily Consumption (Nm³).
* **Threshold Settings Modal**: Konfigurasi batas ambang Normal, Warning, dan Critical langsung dari UI.

### 2. Dashboard
* **Grafik Interaktif Canvas (HTML5)**:
  * **Tank Level Line Chart**: Kurva level tangki aktual dengan threshold warning & critical.
  * **Tank Pressure Line Chart**: Kurva tekanan gas aktual.
  * **Gas Tank Consumption Bar Chart**: Bar chart konsumsi gas dengan jarak antar bar 24px rapi dan hover tooltip.
* **Filter Tanggal & Shift**:
  * Filter Shift (Shift 1, Shift 2, Shift 3).
  * Filter Modal Mode: Daily (jam), Monthly (seluruh hari 01 s/d akhir bulan), dan Yearly (12 bulan).
* **Zoom Controls**: Fitur zoom in, zoom out, dan reset zoom independen untuk setiap chart.

### 3. Detail Pages (Tabel Historis)
* **Gas Tank Level Detail**: Tabel historis level gas tangki.
* **Gas Tank Pressure Detail**: Tabel historis tekanan gas tangki.
* **Gas Tank Consumption Detail**: Tabel historis konsumsi gas tangki.
* **Fitur Tabel**:
  * Data tersinkronisasi 100% dengan data yang ditampilkan pada grafik Dashboard.
  * Filter Shift dan Ant Design Date Range Picker.
  * Fitur pencarian instan (Search) dan sorting per kolom (No, Value, Timestamp).
  * Pagination responsif (10, 25, 50 entri).

### 4. Master Data
* **Master Data Shift**: Manajemen jam kerja shift operasional (Shift 1, Shift 2, Shift 3).
* **Master Data Parameter**: Manajemen satuan dan parameter gas (Level, Pressure, Consumption).

---

## Teknologi yang Digunakan
* **Framework**: React 18, Vite
* **Styling**: Tailwind CSS & Ant Design (AntD)
* **Icons**: Lucide React
* **Charts**: HTML5 Canvas & Chart.js
* **Date Utilities**: Day.js
* **Spreadsheet Export**: XLSX

---

## Menjalankan Proyek Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev

# Build untuk produksi
npm run build
```
