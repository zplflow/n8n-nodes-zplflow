# @zplflow/n8n-nodes-zplflow

Official [n8n](https://n8n.io) community node for **[Zplflow](https://zplflow.com)**: the Non-Invasive Programmable Thermal Label Middleware for industrial manufacturing, food packaging, and logistics.

Zplflow enables bi-directional ZPL ↔ PDF conversion and real-time ZPL transformations (DOM rewriting, GS1-128 barcode generation, DataMatrix injection, rotation, resizing) without modifying legacy code (SAP, AS/400, custom ERP/WMS).

---

## Features

- **PDF to ZPL Conversion**: Convert carrier shipping labels (DHL, UPS, FedEx, GLS, etc.) and ERP PDF slips into thermal-native Zebra ZPL (203 DPI or 300 DPI) with resolution degradation budgeting.
- **ZPL to PDF Conversion**: Convert raw ZPL print streams into high-fidelity PDF documents or PNG preview images for digital archiving and customer confirmation.
- **Pipeline Transformation**: Non-invasive ZPL DOM manipulation (inject GS1-128 barcodes, ECC200 DataMatrix, text replacement, date formatting, scaling, rotation).
- **Account & Quota Inspection**: Check real-time token balance and plan status directly inside your workflows.

---

## Installation

### In n8n Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance.
2. Click **Install a community node**.
3. Enter `@zplflow/n8n-nodes-zplflow` and click **Install**.

### Manual Installation (Docker / Self-Hosted)

In your n8n root directory (or Docker container):

```bash
npm install @zplflow/n8n-nodes-zplflow
```

---

## Credentials

1. Sign up for a Zplflow account at [zplflow.com](https://zplflow.com).
2. Generate an API Key in your Zplflow Dashboard.
3. In n8n, create a new credential: **Zplflow API**.
4. Enter your **API Key** and optional **Base URL** (defaults to `https://api.zplflow.com`).

---

## Operations

### 1. Conversion (`conversion`)
- **PDF to ZPL (`pdfToZpl`)**:
  - Input: Binary PDF file (e.g. from HTTP Request, S3, Email, Google Drive).
  - Target DPI: `203` (standard) or `300` (high density).
  - Output: Raw ZPL text string and/or downloadable `.zpl` binary.
- **ZPL to PDF (`zplToPdf`)**:
  - Input: Raw ZPL string or binary `.zpl` file.
  - Output: Binary `.pdf` file attached to `$binary`.

### 2. Account (`account`)
- **Get Balance (`getBalance`)**:
  - Retrieves current token balance, subscription status, and usage limits.

---

## License

[Apache-2.0](LICENSE.md) © [Zplflow](https://zplflow.com)
