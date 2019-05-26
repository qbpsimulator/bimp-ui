Using JSONIX generate type mappings from XSD Schema
java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d xmlns -p QBP QBPSchema.xsd
java -jar node_modules/jsonix/lib/jsonix-schema-compiler-full.jar -d xmlns -p QBPApi ApiSchema201212.xsd

Note: TS definitions must be updated manually under xmlns/www.qbp-simulator.com

Run:
npm run xsdgen


