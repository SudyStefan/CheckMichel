# build
sam build

# local ssl
openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.cert -days 365 -subj "/CN=localhost"

# run locally
sam local start-api --port 8080 --ssl-cert-file ./localhost.cert --ssl-key-file ./localhost.key