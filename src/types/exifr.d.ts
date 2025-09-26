declare module 'exifr' {
  interface ExifData {
    [key: string]: unknown;
  }

  interface ExifrOptions {
    tiff?: boolean;
    exif?: boolean;
    gps?: boolean;
    interop?: boolean;
    ifd1?: boolean;
    ICC?: boolean;
    iptc?: boolean;
    xmp?: boolean;
    jfif?: boolean;
    geoTiff?: boolean;
  }

  function parse(
    input: ArrayBuffer | Buffer | File | Blob | string,
    options?: ExifrOptions | boolean
  ): Promise<ExifData | null>;

  const exifr: {
    parse: typeof parse;
  };

  export default exifr;
}