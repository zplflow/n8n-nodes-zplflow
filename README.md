# @zplflow/n8n-nodes-zplflow

Official [n8n](https://n8n.io) community node for **[Zplflow](https://www.zplflow.io)** — the **Universal Thermal Label Infrastructure** for WMS, ERP, TMS, 3PL, and industrial manufacturing.

One API, zero ERP changes. Zplflow acts as a non-invasive, programmable thermal label middleware that cross-compiles industrial printer languages in milliseconds across **6 major thermal dialects** (Zebra ZPL II, Eltron EPL2, Datamax DPL, Intermec IPL, TSC TSPL/TSPL2, and SATO SBPL), bridges PDF shipping documents to native thermal print streams with physical hardware parity, and executes programmable multi-step ZPL transformation pipelines without touching legacy host code (SAP, AS/400, Odoo, or custom ERP/WMS).

---

## Features

- **Universal 6-Dialect Thermal Bridge (AST Transpilation)**: Bidirectionally cross-compile between **Zebra ZPL II**, **Eltron EPL2**, **Datamax DPL**, **Intermec IPL**, **TSC TSPL/TSPL2**, and **SATO SBPL** so mixed industrial printer fleets operate seamlessly without modifying ERP/WMS templates.
- **Bidirectional PDF ↔ Thermal Label Conversion**:
  - **PDF to ZPL**: Convert carrier shipping labels (DHL, UPS, FedEx, GLS, Amazon, etc.) and ERP PDF slips into thermal-native ZPL (203 DPI or 300 DPI) with optional token-budget degradation.
  - **Any Thermal Dialect to PDF**: Render raw ZPL, EPL2, DPL, IPL, TSPL, or SBPL print streams into hardware-calibrated PDF documents (8 DPMM / 203 DPI or 12 DPMM / 300 DPI) preserving exact font metrics and barcode quiet zones.
- **Programmable ZPL Pipelines**: Apply reusable multi-step ZPL transformations (DOM rewriting, GS1-128 barcodes, ECC200 DataMatrix, QR codes, text injection/replacement, rotation, scaling, cropping) with dynamic `{{variable}}` substitution.
- **Live Pipeline Preview (0 Tokens)**: Synchronously render a PNG preview of raw ZPL or transient pipeline steps directly inside your n8n workflow without consuming tokens.
- **Account & Quota Inspection**: Monitor real-time token balance, plan status, and usage limits directly inside your workflows.
- **Enterprise-Ready**: Stateless, GDPR-native architecture hosted in European cloud infrastructure, with automatic idempotency keys to prevent duplicate billing on retries.

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

1. Sign up for a Zplflow account at [www.zplflow.io](https://www.zplflow.io).
2. Generate an API Key in your Zplflow Dashboard.
3. In n8n, create a new credential: **Zplflow API**.
4. Enter your **API Key** and optional **Base URL** (defaults to `https://api.zplflow.io`).

---

## Operations

### 1. Conversion (`conversion`)

- **PDF to ZPL (`pdfToZpl`)**:
  - Input: Binary PDF file (e.g. from HTTP Request, S3, Email, Google Drive).
  - Options: Target DPI (`203` or `300`) and automatic budget degradation (`allowDegrade`).
  - Output: Raw ZPL string in JSON (`zpl`) along with `request_id`, `tokens_charged`, and `page_count`.
- **Thermal Dialect to PDF (`zplToPdf`, `eplToPdf`, `dplToPdf`, `iplToPdf`, `tsplToPdf`, `sbplToPdf`)**:
  - Input: Raw label code (Text / Expression) or Binary Property.
  - Options: Output resolution (`8dpmm` / 203 DPI or `12dpmm` / 300 DPI).
  - Output: Rendered `.pdf` binary attached to the configured output binary property.
- **Cross-Dialect AST Transpilation (`eplToZpl`, `dplToZpl`, `iplToZpl`, `tsplToZpl`, `sbplToZpl`, `zplToEpl`, `zplToDpl`, `zplToIpl`, `zplToTspl`, `zplToSbpl`)**:
  - Input: Raw label code (Text / Expression) or Binary Property.
  - Output: Transpiled thermal label code both in JSON (`text`) and as a binary file (`.zpl`, `.epl`, `.dpl`, `.ipl`, `.tspl`, `.sbpl`).

### 2. Pipeline (`pipeline`)

- **Apply Pipeline (`apply`)**:
  - Input: Pipeline ID (e.g. `pip_shipping_std`), ZPL source (Text / Expression or Binary Property), and optional dynamic `{{variable}}` key-value pairs.
  - Output: Transformed ZPL string (`zpl`) along with `pipeline_id` and token usage metadata.
- **Live Preview (`preview`)**:
  - Input: ZPL source (Text / Expression or Binary Property), optional JSON array of transient pipeline steps, and 0-indexed page number.
  - Output: Rendered `preview.png` binary attached to the configured output binary property (0 tokens charged).

### 3. Account (`account`)

- **Get Balance (`getBalance`)**:
  - Retrieves current token balance, subscription status, and usage limits.

---

## Resources

- Website: [https://www.zplflow.io](https://www.zplflow.io)
- Documentation: [https://www.zplflow.io/docs](https://www.zplflow.io/docs)

---

## License

[MIT](LICENSE.md) © [Zplflow](https://www.zplflow.io)
