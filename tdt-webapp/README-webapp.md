# Frontend Webapp

To install dependencies:

    pnpm install

To start dev server:

    pnpm run dev

To do production build:

    pnpm run build

To run a static server:

    pnpm run preview

To run linter:

    pnpm run lint

To run code formatter (Prettier):

    pnpm run format

To interactively upgrade dependencies to the latest version:

    pnpm update --latest --interactive

To upgrade dependencies blindly:

    pnpm update --latest

(upgrades dependencies in package.json and pnpm-lock.yaml)

To update dependencies within their declared ranges, including transitive dependencies:

    pnpm update --no-save
