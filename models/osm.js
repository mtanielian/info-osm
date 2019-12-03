const {conn} = require('../conn/db.js');

class OSM {
    constructor (conn) {
        this.conn = conn;
    }

    /*
    static aProvincias() {
        return [
            {id : "-3592494", provincia : "Córdoba", admin_level : "7"}, 
            {id : "-3082668", provincia : "Ciudad Autónoma de Buenos Aires", admin_level : "7"}, 
            {id : "-2849847", provincia : "Formosa", admin_level : "7"}, 
            {id : "-2405230", provincia : "Salta", admin_level : "7"}, 
            {id : "-1632167", provincia : "Buenos Aires", admin_level : "7"}, 
            {id : "-1606727", provincia : "Neuquén", admin_level : "7"}, 
            {id : "-389896", provincia : "Misiones", admin_level : "7"}, 
            {id : "-153558", provincia : "Tucumán", admin_level : "7"}, 
            {id : "-153556", provincia : "Jujuy", admin_level : "7"}, 
            {id : "-153554", provincia : "Chaco", admin_level : "7"}, 
            {id : "-153553", provincia : "Misiones", admin_level : "7"}, 
            {id : "-153552", provincia : "Corrientes", admin_level : "7"}, 
            {id : "-153551", provincia : "Entre Ríos", admin_level : "7"}, 
            {id : "-153550", provincia : "Tierra del Fuego", admin_level : "7"}, 
            {id : "-153549", provincia : "Santa Cruz", admin_level : "7"}, 
            {id : "-153548", provincia : "Chubut", admin_level : "7"}, 
            {id : "-153547", provincia : "Río Negro", admin_level : "7"}, 
            {id : "-153545", provincia : "Catamarca", admin_level : "7"}, 
            {id : "-153544", provincia : "Santiago del Estero", admin_level : "7"}, 
            {id : "-153543", provincia : "Santa Fe", admin_level : "7"}, 
            {id : "-153541", provincia : "La Pampa", admin_level : "7"}, 
            {id : "-153540", provincia : "Mendoza", admin_level : "7"}, 
            {id : "-153539", provincia : "San Juan", admin_level : "7"}, 
            {id : "-153538", provincia : "San Luis", admin_level : "7"}, 
            {id : "-153536", provincia : "La Rioja", admin_level : "7"}
        ];
    }
    */
    
    getPointsByMunicipio (idOSMMunicipio, response) {
        let sqlEducacion = `
            SELECT
                max(id) AS id,
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti,
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
                    planet_osm_point.amenity AS ameniti, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%school%' OR
                    planet_osm_point.amenity like '%university%' OR
                    planet_osm_point.amenity like '%kindergarten%' OR
                    planet_osm_point.amenity like '%library%' OR
                    planet_osm_point.amenity like '%music_school%' OR
                    planet_osm_point.amenity like '%language_school%'

                UNION ALL

                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre,
                    planet_osm_polygon.amenity AS ameniti,
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%school%' OR
                    planet_osm_polygon.amenity like '%university%' OR
                    planet_osm_polygon.amenity like '%kindergarten%' OR
                    planet_osm_polygon.amenity like '%library%' OR
                    planet_osm_polygon.amenity like '%music_school%' OR
                    planet_osm_polygon.amenity like '%language_school%'
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2
        `;

        let sqlCountEducacion = `        
            SELECT
                count(ameniti) as cantidad, ameniti
            FROM
            (
                SELECT
                    planet_osm_point.amenity AS ameniti
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%school%' OR
                    planet_osm_point.amenity like '%university%' OR
                    planet_osm_point.amenity like '%kindergarten%' OR
                    planet_osm_point.amenity like '%library%' OR
                    planet_osm_point.amenity like '%music_school%' OR
                    planet_osm_point.amenity like '%language_school%'

                UNION ALL

                SELECT
                    planet_osm_polygon.amenity AS ameniti                    
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%school%' OR
                    planet_osm_polygon.amenity like '%university%' OR
                    planet_osm_polygon.amenity like '%kindergarten%' OR
                    planet_osm_polygon.amenity like '%library%' OR
                    planet_osm_polygon.amenity like '%music_school%' OR
                    planet_osm_polygon.amenity like '%language_school%'
            ) tbl
            group by 2
            ORDER BY 1
        `;


        let sqlSalud = `
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti, 
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
                    planet_osm_point.amenity AS ameniti, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%hospital%' OR
                    planet_osm_point.amenity like '%clinic%' OR
                    planet_osm_point.amenity like '%doctors%' OR
                    planet_osm_point.amenity like '%dentist%' OR
                    planet_osm_point.amenity like '%pharmacy%' OR
                    planet_osm_point.amenity like '%veterinary%'	

                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre, 
                    planet_osm_polygon.amenity AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%hospital%' OR
                    planet_osm_polygon.amenity like '%clinic%' OR
                    planet_osm_polygon.amenity like '%doctors%' OR
                    planet_osm_polygon.amenity like '%dentist%' OR
                    planet_osm_polygon.amenity like '%pharmacy%' OR
                    planet_osm_polygon.amenity like '%veterinary%'	
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2
        `;

        let sqlCountSalud = `    
            SELECT 
                count(ameniti) AS cantidad, ameniti                
            FROM
            (
                SELECT
                    planet_osm_point.amenity AS ameniti
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%hospital%' OR
                    planet_osm_point.amenity like '%clinic%' OR
                    planet_osm_point.amenity like '%doctors%' OR
                    planet_osm_point.amenity like '%dentist%' OR
                    planet_osm_point.amenity like '%pharmacy%' OR
                    planet_osm_point.amenity like '%veterinary%'	

                UNION ALL
                
                SELECT
                    planet_osm_polygon.amenity AS ameniti
                    
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%hospital%' OR
                    planet_osm_polygon.amenity like '%clinic%' OR
                    planet_osm_polygon.amenity like '%doctors%' OR
                    planet_osm_polygon.amenity like '%dentist%' OR
                    planet_osm_polygon.amenity like '%pharmacy%' OR
                    planet_osm_polygon.amenity like '%veterinary%'	
            ) tbl
            GROUP BY 2
            ORDER BY 2        
        `;

        let sqlSeguridad = `        
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti, 
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
                    planet_osm_point.amenity AS ameniti, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%fire_station%' OR
                    planet_osm_point.amenity like '%police%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre, 
                    planet_osm_polygon.amenity AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%fire_station%' OR
                    planet_osm_polygon.amenity like '%police%'
                    
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2        
        `;

        let sqlCountSeguridad = `
            SELECT 
                count(ameniti) AS cantidad, ameniti
            FROM
            (
                SELECT
                    planet_osm_point.amenity AS ameniti
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%fire_station%' OR
                    planet_osm_point.amenity like '%police%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.amenity AS ameniti                    
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%fire_station%' OR
                    planet_osm_polygon.amenity like '%police%'
                    
            ) tbl
            GROUP BY 2
            ORDER BY 2                
        `;

        let sqlBancario = `
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti, 
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
                    planet_osm_point.osm_id AS id, 
                    CASE
                        WHEN planet_osm_point.network != '' AND  planet_osm_point.operator != ''
                            THEN concat(planet_osm_point.network, ' - ', planet_osm_point.operator)
                        WHEN planet_osm_point.network != '' 
                            THEN planet_osm_point.network
                        WHEN planet_osm_point.operator != ''
                            THEN planet_osm_point.operator
                    END AS nombre,
                    planet_osm_point.amenity AS ameniti, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    CASE
                        WHEN planet_osm_point.atm = 'yes' THEN 'Si'
                        ELSE 'No'
                    END AS atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%bank%' OR
                    planet_osm_point.amenity like '%atm%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, 
                    CASE
                        WHEN planet_osm_polygon.network != '' AND  planet_osm_polygon.operator != ''
                            THEN concat(planet_osm_polygon.network, ' - ', planet_osm_polygon.operator)
                        WHEN planet_osm_polygon.network != '' 
                            THEN planet_osm_polygon.network
                        WHEN planet_osm_polygon.operator != ''
                            THEN planet_osm_polygon.operator
                    END AS nombre,
                    planet_osm_polygon.amenity AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    CASE
                        WHEN planet_osm_polygon.atm = 'yes' THEN 'Si'
                        ELSE 'No'
                    END AS atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%bank%' OR
                    planet_osm_polygon.amenity like '%atm%'
                    
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2        
        `;

        let sqlCountBancario = `        
            SELECT 
                count(ameniti) AS ameniti, ameniti               
            FROM
            (
                SELECT
                    planet_osm_point.amenity AS ameniti
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%bank%' OR
                    planet_osm_point.amenity like '%atm%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.amenity AS ameniti                    
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%bank%' OR
                    planet_osm_polygon.amenity like '%atm%'
                    
            ) tbl
            GROUP BY 2
            ORDER BY 2
        `;

        let sqlTurismo = `
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti, 
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
                        WHEN planet_osm_point.amenity != ''
                            THEN planet_osm_point.amenity
                            ELSE planet_osm_point.tourism
                        END AS ameniti,
                    st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.tourism like '%hotel%' OR
                    planet_osm_point.tourism like '%museum%' OR
                    planet_osm_point.amenity like '%theatre%'
                    
                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre, 
                    CASE 
                        WHEN planet_osm_polygon.amenity != ''
                            THEN planet_osm_polygon.amenity
                            ELSE planet_osm_polygon.tourism
                    END AS ameniti,
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.tourism like '%hotel%' OR
                    planet_osm_polygon.tourism like '%museum%' OR
                    planet_osm_polygon.amenity like '%theatre%'                
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2
        `;
        
        let sqlCountTurismo = `        
            SELECT 
                count(ameniti) AS cantidad, ameniti
            FROM
            (
                SELECT
                    CASE
                        WHEN planet_osm_point.amenity != ''
                            THEN planet_osm_point.amenity
                            ELSE planet_osm_point.tourism 
                    END AS ameniti
                FROM planet_osm_point
                    INNER JOIN  planet_osm_polygon AS municipios 
                        ON municipios.osm_id = '${idOSMMunicipio}' AND 
                            ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.tourism like '%hotel%' OR
                    planet_osm_point.tourism like '%museum%' OR
                    planet_osm_point.amenity like '%theatre%'
                        
                UNION ALL
                    
                SELECT
                    CASE
                        WHEN planet_osm_polygon.amenity != ''
                            THEN planet_osm_polygon.amenity
                            ELSE planet_osm_polygon.tourism 
                    END AS ameniti                
                FROM planet_osm_polygon
                    INNER JOIN planet_osm_polygon as municipios 
                        ON municipios.osm_id = '${idOSMMunicipio}' AND 
                            ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.tourism like '%hotel%' OR
                    planet_osm_polygon.tourism like '%museum%' OR
                    planet_osm_polygon.amenity like '%theatre%'                
            ) tbl
            GROUP BY 2        
        `;

        let sqlGob = `
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti,
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
                        WHEN planet_osm_point.amenity != ''
                            THEN planet_osm_point.amenity
                            ELSE planet_osm_point.office
                    END AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%townhall%' OR
                    planet_osm_point.office like '%government%' OR
                    planet_osm_point.office like '%employment_agency%' OR
                    planet_osm_point.amenity like '%post_office%'
                    
                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre, 
                    CASE
                        WHEN planet_osm_polygon.amenity != ''
                            THEN planet_osm_polygon.amenity
                            ELSE planet_osm_polygon.office
                    END AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%townhall%' OR
                    planet_osm_polygon.office like '%government%' OR
                    planet_osm_polygon.office like '%employment_agency%' OR
                    planet_osm_polygon.amenity like '%post_office%'
            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2        
        `;

        let sqlCountGob = `        
            SELECT 
                count(ameniti) AS cantidad, ameniti
            FROM
            (
                SELECT
                    CASE
                        WHEN planet_osm_point.amenity != ''
                            THEN planet_osm_point.amenity
                            ELSE planet_osm_point.office
                    END AS ameniti                    
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%townhall%' OR
                    planet_osm_point.office like '%government%' OR
                    planet_osm_point.office like '%employment_agency%' OR
                    planet_osm_point.amenity like '%post_office%'
                    
                UNION ALL
                
                SELECT
                    CASE
                        WHEN planet_osm_polygon.amenity != ''
                            THEN planet_osm_polygon.amenity
                            ELSE planet_osm_polygon.office
                    END AS ameniti
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%townhall%' OR
                    planet_osm_polygon.office like '%government%' OR
                    planet_osm_polygon.office like '%employment_agency%' OR
                    planet_osm_polygon.amenity like '%post_office%'
            ) tbl
            GROUP BY 2
            ORDER BY 2
        `;


        let sqlEspacioUrbano = `
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti, 
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
                    planet_osm_point.leisure AS ameniti, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.leisure like '%park%' OR
                    planet_osm_point.leisure like '%nature_reserve%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre, 
                    planet_osm_polygon.leisure AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.leisure like '%park%' OR
                    planet_osm_polygon.leisure like '%nature_reserve%'

            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2        
        `;

        let sqlCountEspacioUrbano = `
            SELECT 
                count(ameniti) AS cantidad, ameniti
            FROM
            (
                SELECT
                    planet_osm_point.leisure AS ameniti
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.leisure like '%park%' OR
                    planet_osm_point.leisure like '%nature_reserve%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.leisure AS ameniti                    
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.leisure like '%park%' OR
                    planet_osm_polygon.leisure like '%nature_reserve%'
            ) tbl
            GROUP BY 2
            ORDER BY 1        
        `;
        
        let sqlGreenAreas = `
            SELECT
                planet_osm_polygon.leisure AS ameniti,
                CASE
                    WHEN (sum(st_area(planet_osm_polygon.way) / 10.7639) / 1000000) > 1 
                        THEN sum(st_area(planet_osm_polygon.way) / 10.7639) / 1000000
                    ELSE sum(st_area(planet_osm_polygon.way)) / 10.7639	
                END AS superficie,
                CASE
                    WHEN (sum(st_area(planet_osm_polygon.way) / 10.7639) / 1000000) > 1 
                        THEN 'km²'
                    ELSE 'm²'		
                END AS unidad
            FROM planet_osm_polygon
            INNER JOIN planet_osm_polygon as municipios 
                ON municipios.osm_id = '${idOSMMunicipio}' AND 
                ST_Contains(municipios.way, planet_osm_polygon.way)
            WHERE
                planet_osm_polygon.leisure like '%park%' OR
                planet_osm_polygon.leisure like '%nature_reserve%'
            GROUP BY 1
        `;

        let sqlSemaforos = `
            SELECT 
                COUNT(*) AS cantidad
            FROM planet_osm_point
            INNER JOIN planet_osm_polygon as municipios 
                ON municipios.osm_id = '${idOSMMunicipio}' AND 
                ST_Contains(municipios.way, planet_osm_point.way)
            WHERE
                LOWER(planet_osm_point.highway) LIKE '%traffic_signals%'
        `;

        let sqlEstacionServicio = `
            SELECT 
                max(id) AS id,                
                max(origen) AS origen,
                max(nombre) AS nombre, max(ameniti) AS ameniti, 
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
                    planet_osm_point.leisure AS ameniti, st_asText(ST_Centroid(st_transform(planet_osm_point.way, 4326))) AS centrado,
                    planet_osm_point."addr:" as addr,
                    planet_osm_point."isced:level" as isced,
                    planet_osm_point.network,
                    planet_osm_point.atm,
                    planet_osm_point.phone,
                    planet_osm_point.website,
                    'node' AS origen
                FROM planet_osm_point
                INNER JOIN  planet_osm_polygon AS municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_point.way)
                WHERE
                    planet_osm_point.amenity like '%fuel%'

                UNION ALL
                
                SELECT
                    planet_osm_polygon.osm_id AS id, planet_osm_polygon.name AS nombre, 
                    planet_osm_polygon.leisure AS ameniti, 
                    st_asText(ST_Centroid(st_transform(planet_osm_polygon.way, 4326))) AS centrado,
                    planet_osm_polygon."addr:" as addr,
                    planet_osm_polygon."isced:level" as isced,
                    planet_osm_polygon.network,
                    planet_osm_polygon.atm,
                    planet_osm_polygon.phone,
                    planet_osm_polygon.website,
                    'way' AS origen
                FROM planet_osm_polygon
                INNER JOIN planet_osm_polygon as municipios 
                    ON municipios.osm_id = '${idOSMMunicipio}' AND 
                        ST_Contains(municipios.way, planet_osm_polygon.way)
                WHERE
                    planet_osm_polygon.amenity like '%fuel%'

            ) tbl
            GROUP BY centrado, addr, isced
            ORDER BY 2        
        `;

        this.conn.query(
            `
                ${sqlEducacion};${sqlCountEducacion};
                ${sqlSalud};${sqlCountSalud};
                ${sqlSeguridad};${sqlCountSeguridad};
                ${sqlBancario};${sqlCountBancario};
                ${sqlTurismo};${sqlCountTurismo};
                ${sqlGob};${sqlCountGob};
                ${sqlEspacioUrbano};${sqlCountEspacioUrbano};
                ${sqlEstacionServicio};
                ${sqlGreenAreas};${sqlSemaforos};                
            `,
            (error, rs) => {
                if (!error) {
                    let aPlaces = {
                        aEducacion : rs[0].rows,
                        aSalud : rs[2].rows,
                        aSeguridad : rs[4].rows,
                        aBancario : rs[6].rows,
                        aTurismo : rs[8].rows,
                        aGob : rs[10].rows,
                        aEspacioUrbano : rs[12].rows,
                        aTransporteVial : rs[14].rows
                    }

                    let aContadores = {
                        aEducacion : rs[1].rows,
                        aSalud : rs[3].rows,
                        aSeguridad : rs[5].rows,
                        aBancario : rs[7].rows,
                        aTurismo : rs[9].rows,
                        aGob : rs[11].rows,
                        aEspacioUrbano : rs[13].rows        
                    }

                    let aGreenAreas = rs[15].rows;
                    let aSemaforos = rs[16].rows[0].cantidad;
                
                    response({aPlaces, aContadores, aGreenAreas, aSemaforos});
                
                } else {
                    console.error(error);
                    response({"aPlaces" : [], "aContadores" : []});
                }
            }
        );            
    }

/*
    getLevelSearchByMunicipio(id, response) {
        let sql = `
            SELECT 
	            provincias.osm_id, provincias.name as provincia, municipios.name as municipio
            FROM planet_osm_polygon as municipios
            INNER JOIN planet_osm_polygon as provincias 
                ON 
                    ST_Contains(provincias.way, municipios.way) AND 
                    provincias.boundary = 'administrative' AND provincias.admin_level='4'
            WHERE 
                municipios.boundary = 'administrative' AND 
                (municipios.admin_level='7' OR municipios.admin_level='5') AND
                municipios.osm_id = '${id}'
            GROUP BY 
                provincias.osm_id, provincias.name , municipios.name        
        `;
        
        this.conn.query(sql, (err, results) => {
            let pro = "";
            if (!err && results.rows.length > 0) {
                pro = this.constructor.aProvincias().find(e => {
                    if (e.id == results.rows[0].osm_id) {
                        return e;
                    }
                });
                
                pro = pro ? pro.admin_level : "";
            }

            response(pro);
        });        
    }
*/


    getMunicipio(id, response) {
        let sql = `
            SELECT 
                st_asText(st_transform(way, 4326)) AS puntos, 
                st_asText(ST_Centroid(st_transform(way, 4326))) AS centrado,
                way_area
            from planet_osm_polygon
            WHERE 
                osm_id = '${id}'
        `;
        this.conn.query(sql, (err, res) => {
            if (!err) {
                response(res.rows);
            } 
        });                
    }

}

module.exports = new OSM(conn);
