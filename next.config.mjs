/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf.mjs",
      "pdfjs-dist/build/pdf": "pdfjs-dist/legacy/build/pdf",
      "pdfjs-dist/build/pdf.mjs": "pdfjs-dist/legacy/build/pdf.mjs",
      "pdfjs-dist/build/pdf.worker": "pdfjs-dist/legacy/build/pdf.worker",
      "pdfjs-dist/build/pdf.worker.mjs": "pdfjs-dist/legacy/build/pdf.worker.mjs"
    };
    return config;
  }
};

export default nextConfig;
