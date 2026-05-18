declare module "html-pdf-node" {
  interface File {
    content?: string;
    url?: string;
  }
  interface Options {
    format?: "A4" | "A3" | "Letter";
    printBackground?: boolean;
    margin?: { top?: string; right?: string; bottom?: string; left?: string };
    args?: string[];
    executablePath?: string;
    path?: string;
  }
  function generatePdf(file: File, options?: Options): Promise<Buffer>;
  function generatePdfs(files: File[], options?: Options): Promise<Buffer[]>;
  export = { generatePdf, generatePdfs };
}
