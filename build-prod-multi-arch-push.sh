#!/bin/bash

# strict error handling
set -euxo pipefail

source build.sh

docker buildx build \
            --platform linux/amd64,linux/arm/v7,linux/arm64 \
            --tag bronkoknorb/type-draw-type-game:latest \
            --push \
            .
