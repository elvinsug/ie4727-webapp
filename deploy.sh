#!/bin/bash

FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"

OUTPUT_DIR="$FRONTEND_DIR/out"

pushd $FRONTEND_DIR
npm install
npm run build
popd

sudo rm -rf /opt/lampp/htdocs/miona/*
sudo cp -r $OUTPUT_DIR/** /opt/lampp/htdocs/miona/
sudo cp -r $BACKEND_DIR/api /opt/lampp/htdocs/miona/

echo "Deployment completed successfully."
