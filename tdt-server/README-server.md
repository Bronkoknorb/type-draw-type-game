# TDT-Server

Build:

    ./gradlew build

Start in development mode:

    ./gradlew bootRun

To get live-reloads on changes, run in a second terminal:

    ./gradlew build --continuous

## Formatting

Using Prettier Java Plugin.

First time install:

    npm install

Then run using:

    npm run format

Check for outdated packages:

    npm outdated

Update all packages (includes regenerating the package-lock.json file):

    npm run deps-update
