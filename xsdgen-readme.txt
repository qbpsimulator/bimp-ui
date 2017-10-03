Using JSONIX and CXSD to generate type mappings from XSD Schema
java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d xmlns -p QBP QBPSchema.xsd
java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d xmlns -p QBPApi ApiSchema201212.xsd
npm run cxsd http://localhost:8080/QBPSchema.xsd
npm run cxsd http://localhost:8080/ApiSchema201212.xsd

Run:
npm run xsdgen


