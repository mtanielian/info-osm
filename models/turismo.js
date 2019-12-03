const {conn} = require('../conn/db');

class mTurismo {

    constructor(conn) {
        this.conn = conn;
    }

    getPuntosDeInteres(idOSMMunicipio, callback) {
        let sqlTourism = `
            SELECT
                max(id) AS id,
                max(origen) AS origen,
                max(nombre) AS nombre, max(amenity) AS amenity,
                max(tourism) AS tourism,
                max(centrado) AS centrado,
                addr,
                isced,
                max(network) AS network,
                max(atm) AS atm,
                max(phone) AS phone,
                max(website) AS website                
            FROM
            (
                SELECT
                    planet_osm_point.osm_id AS id, planet_osm_point.name AS nombre,
                    planet_osm_point.amenity AS amenity, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen,
                    CASE 
                        WHEN planet_osm_point.tourism != ''
                            THEN planet_osm_point.tourism
                            ELSE planet_osm_point.amenity
                    END 
                    AS tourism 
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.tourism != '' OR 
                    planet_osm_point.amenity ilike '%place_of_worship%'                    

                UNION ALL

                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre,
                    planet_osm_polygon.amenity AS amenity,
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen,
                    CASE 
                        WHEN planet_osm_polygon.tourism != ''
                            THEN planet_osm_polygon.tourism
                            ELSE planet_osm_polygon.amenity
                    END 
                    AS tourism
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.tourism != '' OR
                    planet_osm_polygon.amenity ilike '%place_of_worship%'                    

            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2        
        `;        

        let sqlFoodAndReligion = `
            SELECT
                max(id) AS id,
                max(origen) AS origen,
                max(nombre) AS nombre, max(amenity) AS amenity,
                max(tourism) AS tourism,
                max(building) AS building,
                max(centrado) AS centrado,
                addr,
                isced,
                max(network) AS network,
                max(atm) AS atm,
                max(phone) AS phone,
                max(website) AS website                
            FROM
            (
                SELECT
                    planet_osm_point.osm_id AS id, planet_osm_point.name AS nombre,
                    CASE 
                        WHEN planet_osm_point.leisure != ''
                            THEN planet_osm_point.leisure
                            ELSE planet_osm_point.amenity
                        END 
                    AS amenity, 
                    st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen,
                    planet_osm_point.tourism,		    
                    planet_osm_point.building
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND
                    ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity ilike '%restaurant%' OR
                    planet_osm_point.amenity ilike '%cafe%' OR
                    planet_osm_point.amenity ilike '%fast_food%' OR
                    planet_osm_point.amenity ilike '%biergarten%' OR
                    planet_osm_point.amenity ilike '%bar%' OR
                    planet_osm_point.amenity ilike '%pub%' OR
                    planet_osm_point.leisure ilike '%outdoor_seating%'
            
                UNION ALL

                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre,
                    CASE 
                        WHEN planet_osm_polygon.leisure != ''
                            THEN planet_osm_polygon.leisure
                            ELSE planet_osm_polygon.amenity 
                        END
                    AS amenity,
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen,
                    planet_osm_polygon.tourism,                   
                    planet_osm_polygon.building                    
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND
                    ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity ilike '%restaurant%' OR
                    planet_osm_polygon.amenity ilike '%cafe%' OR
                    planet_osm_polygon.amenity ilike '%fast_food%' OR
                    planet_osm_polygon.amenity ilike '%biergarten%' OR
                    planet_osm_polygon.amenity ilike '%bar%' OR
                    planet_osm_polygon.amenity ilike '%pub%' OR
                    planet_osm_polygon.leisure ilike '%outdoor_seating%'
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2 
        `;


        this.conn.query(
            `${sqlTourism}; ${sqlFoodAndReligion}`, (error, rs) => {
                let aTourism = rs[0].rows;
                let aFoodAndReligion = rs[1].rows;

            callback({aTourism, aFoodAndReligion});
        })


    }




}

module.exports = new mTurismo(conn);


