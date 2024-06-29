declare module "tailwindcss/lib/util/flattenColorPalette" {
  type ColorValue = string | { [key: string]: ColorValue };
  type ColorPalette = { [color: string]: ColorValue };

  function flattenColorPalette(colors: ColorPalette): { [key: string]: string };

  export default flattenColorPalette;
}
