#!/bin/bash
set -e
cd "$(dirname "$0")"
make clean html
rsync -av --delete build/html/ ../docs/
