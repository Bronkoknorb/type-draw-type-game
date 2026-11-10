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

## Gradle dependency updates

Check for available dependency, plugin, and Gradle updates:

    ./gradlew dependencyUpdates

Update the desired versions in `build.gradle.kts`, then regenerate the lockfile
and test the build:

    ./gradlew dependencies --write-locks
    ./gradlew build

Upgrade the Gradle wrapper to the latest release and test:

    ./gradlew wrapper --gradle-version latest
    ./gradlew wrapper
    ./gradlew build

## npm dependency updates

Check for outdated packages:

    npm outdated

Update all packages (includes regenerating the package-lock.json file):

    npm run deps-update
