//ApiDeviceDataLambda function: 
// This function processes the query strings and returns the data 
// based on the query string to return either all device latest data 
// or filter based on device_ids or location boundary

var AWS = require("aws-sdk");
var querystring = require("querystring");
AWS.config.update({ region: process.env.region });

exports.handler = (event, context, callback) => {
    var result = [];
    console.log('Received event:', event);

    var filterByDeviceId = function(data, filter) {
        var devicesId = filter.split(",");
        return data.Items.filter(device => devicesId.some(id => id == device.device_id));
    };

    var filterByBound = function(data, boundFilter) {
        var validDevices = [];
        var polygon = [];

        polygon.push([boundFilter.upper_left_long, boundFilter.lower_right_lat]);
        polygon.push([boundFilter.upper_left_long, boundFilter.upper_left_lat]);
        polygon.push([boundFilter.lower_right_long, boundFilter.upper_left_lat]);
        polygon.push([boundFilter.lower_right_long, boundFilter.lower_right_lat]);

        console.log("polygon: " + polygon);

        data.filter(device => {
            var point = [device.longitude, device.latitude];

            if (inside(point, polygon)) {
                validDevices.push(device);
            }
        });

        return validDevices;
    };

    var inside = function(point, vs) {

        var x = point[0],
            y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1];
            var xj = vs[j][0],
                yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect && !inside) inside = !inside;
        }
        return inside;
    };

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: process.env.DEVICE_LATEST_TABLE
    };
    docClient.scan(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log('scan data', data);
            
            if (event.resourcePath === "/devices") {
                if ((!event.device_ids.length) && (!event.bounds.length)) {
                    result = data.Items;
                } else if ((event.device_ids.length > 0) && (!event.bounds.length)){
                    result = filterByDeviceId(data, event.device_ids);
                } else if ((!event.device_ids.length) && (event.bounds.length > 0)){
                    console.log('event.bounds', event.bounds);

                    var device_params = event.bounds.replace(/(^{)|(}$)/g, "");
                    var dparams = querystring.parse(device_params, ',', ':');
                    var location_bounds = {
                        'upper_left_lat': Math.floor(dparams.upper_left_lat),
                        'upper_left_long': Math.floor(dparams.upper_left_long),
                        'lower_right_lat': Math.floor(dparams.lower_right_lat),
                        'lower_right_long': Math.floor(dparams.lower_right_long)
                    };
                    console.log('location_bounds', location_bounds);
                    
                    result = filterByBound(data.Items, location_bounds);
                } else if  ((event.device_ids.length > 0) && (event.bounds.length > 0)){
                    // Search for the device_ids and check if those device_ids are within the 
                    // location boundary
                    var devices_filtered = filterByDeviceId(data, event.device_ids);
                    console.log('devices_filtered', devices_filtered);
                    
                    device_params = event.bounds.replace(/(^{)|(}$)/g, "");
                    dparams = querystring.parse(device_params, ',', ':');
                    console.log('split dparams', dparams);
                    location_bounds = {
                        'upper_left_lat': Math.floor(dparams.upper_left_lat),
                        'upper_left_long': Math.floor(dparams.upper_left_long),
                        'lower_right_lat': Math.floor(dparams.lower_right_lat),
                        'lower_right_long': Math.floor(dparams.lower_right_long)
                    };
                    console.log('location_bounds', location_bounds);
                    
                    result = filterByBound(devices_filtered, location_bounds);
                }
            }

            console.log('Response data', result);
            callback(null, (result));
        }
    });
};