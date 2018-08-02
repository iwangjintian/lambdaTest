npm install querystring
zip -r  ApiDeviceData.zip index.js node_modules
aws s3 cp ApiDeviceData.zip s3://jesse-test-10086/
echo "ApiDeviceData"