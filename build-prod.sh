#!/bin/bash

# strict error handling
set -euxo pipefail

source build.sh

docker build --pull --tag tdt-game -f Dockerfile_prod .
