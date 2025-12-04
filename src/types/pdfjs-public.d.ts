declare module "/pdfjs/pdf.min.mjs" {
  export * from "pdfjs-dist";
  const pdfjs: typeof import("pdfjs-dist");
  export default pdfjs;
}
