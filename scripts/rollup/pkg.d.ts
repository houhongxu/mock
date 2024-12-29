declare module 'rollup-plugin-generate-package-json' {
  export interface PackageJsonBaseContents {
    name: string
    description: string
    version: string
    main: string
  }

  export type BaseContentsFunction = (context: {
    name: string
    description: string
    version: string
  }) => PackageJsonBaseContents

  export interface GeneratePackageJsonOptions {
    inputFolder: string
    outputFolder: string
    baseContents: BaseContentsFunction
  }

  export default function generatePackageJson(
    options: GeneratePackageJsonOptions,
  )
}
