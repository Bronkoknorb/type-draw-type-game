# Frontend Webapp

To install dependencies:

    yarn

To start dev server:

    yarn run dev

To do production build:

    yarn run build

To run a static server:

    npx serve -s dist

To run linter:

    yarn run lint

To run code formatter (Prettier):

    yarn run format

To interactively upgrade dependencies to the latest version:

    yarn upgrade-interactive

To upgrade dependencies blindly:

    yarn up '*'

(upgrades dependencies in package.json and yarn.lock)

AND

    yarn up -R '*'

(upgrades transitive dependencies)
