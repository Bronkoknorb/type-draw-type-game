#!/bin/bash

# strict error handling
set -euxo pipefail

source build.sh

docker buildx build \
              --pull \
              --platform linux/amd64,linux/arm64 \
              --tag bronkoknorb/type-draw-type-game:latest \
              --push \
              -f Dockerfile_prod \
              .
