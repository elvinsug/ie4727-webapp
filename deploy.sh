#!/bin/bash

FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"

OUTPUT_DIR="$FRONTEND_DIR/out"

pushd $FRONTEND_DIR
npm install
npm run build
popd

sudo find /opt/lampp/htdocs/miona -mindepth 1 ! -path "/opt/lampp/htdocs/miona/uploads*" -exec rm -rf {} +
sudo cp -r $OUTPUT_DIR/** /opt/lampp/htdocs/miona/
sudo cp -r $BACKEND_DIR/api /opt/lampp/htdocs/miona/
sudo cp -r $BACKEND_DIR/load_env.php /opt/lampp/htdocs/miona/
sudo cp -r $BACKEND_DIR/.env /opt/lampp/htdocs/miona/
sudo mkdir -p /opt/lampp/htdocs/miona/uploads/products/
sudo chmod -R 777 /opt/lampp/htdocs/miona/uploads/

echo "Deployment completed successfully."
