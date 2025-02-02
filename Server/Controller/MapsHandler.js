const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const config = require('../config/config.js');

class MapsHandler {
    getPhotoUrl(isExNovo, photo_reference) {
        if (photo_reference == "" || photo_reference === undefined || photo_reference == "NO") {
            return "/storage/loghetto.jpg"
        }
        if(isExNovo)
            return photo_reference;
        const MAX_HEIGHT = 500;
        const MAX_WIDTH = 500;
        var url = 'https://maps.googleapis.com/maps/api/place/photo?photoreference=' + photo_reference + '&sensor=false&maxheight=' + MAX_HEIGHT + '&maxwidth=' + MAX_WIDTH + '&key=' + config.GOOGLE_MAPS_FRONTEND_API_KEY
        return url
    }

    async getRoute(placeId1, placeId2, travelMode) {
        try {
            var data_from_google = await client.directions({
                params: {
                    origin: "place_id:" + placeId1,
                    destination: "place_id:" + placeId2,
                    mode: travelMode.toLowerCase(),
                    key: config.GOOGLE_MAPS_BACKEND_API_KEY,
                },
                timeout: 10000, 
            });
            data_from_google = data_from_google.data;
            if(data_from_google.status != "OK"){
                return [false, -3, {}]
            }
            return [
                true, 0, data_from_google
            ]
        } catch (error) {
            console.log(error)
            return [false, error.errno, {}]
        }
    }

    async getPlaceDetails(place_id) {
        try {
            var data_from_google = await client.placeDetails({
                params: {
                    place_id: place_id,
                    key: config.GOOGLE_MAPS_BACKEND_API_KEY,
                },
                timeout: 10000, 
            });
            
            if(data_from_google.data.status != "OK"){
                return [false, -3, {}]
            }

            data_from_google = data_from_google.data.result;
            
            
            if (data_from_google.photos !== undefined) {
                data_from_google.foto = data_from_google.photos[0].photo_reference
                data_from_google.fotoURL = this.getPhotoUrl(0,data_from_google.foto)
            } else {
                data_from_google.foto = "NO"
                data_from_google.fotoURL = null
            }
            data_from_google.latitudine = data_from_google.geometry.location.lat;
            data_from_google.longitudine = data_from_google.geometry.location.lng;
            data_from_google.localita = data_from_google.address_components[2].long_name;
            return [
                true, 0, data_from_google
            ]
        } catch (error) {
            return [false,-1 ,{}] 
        }
    }

    async getPlaceFromCoords(lat, lng) {
        try {
        

            var data_from_google = await client.geocode({
                params: {
                    latlng: lat + "," + lng,
                    key: config.GOOGLE_MAPS_BACKEND_API_KEY,
                    
                },
                timeout: 10000, // milliseconds
            });
            const res = (data_from_google.data.results[0]);
            res.latitudine = res.geometry.location.lat;
            res.longitudine = res.geometry.location.lng;
            res.localita = res.address_components[2].long_name;
            
            return [true, 0, res]
        } catch (error) {
            console.log(error)
        }
        return [false, -1, {}] 
    }
}

module.exports = MapsHandler