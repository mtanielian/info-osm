// Requires - Constants
const mOSM = require('../models/osm.js');
const mTurismo = require('../models/turismo.js');
const rq = require('request-promise');
const convert = require('convert-units');
const qrcode = require('qrcode');
const fs = require('fs');


class OSM {
    constructor (mOSM, mTurismo) {
        this.mOSM = mOSM;
        this.mTurismo = mTurismo;
    }

    getPointsByMunicipio (req, res) {
        this.mOSM.getPointsByMunicipio(req.params.id, (response) => {
            res.send(response);
        });
    }

    getFichaMunicipioByIfam (req, res) {    
        let ifam = req.params.codIfam;
        const aPlaces = [];

        rq({
            method : "POST",
            uri : config.url_rest.ficha_municipio,
            body : { 
                ifam : ifam
            }, json : true
        }).then ((data) => {
            let aFichaMunicipio = data.aFichaMunicipio;
            mOSM.getPointsByMunicipio(aFichaMunicipio.id_osm, (response) => {
                const aContadores = response.aContadores;
                let aGreenAreas = response.aGreenAreas;
                let aTransporteVial = response.aPlaces.aTransporteVial;
                let aSemaforos = response.aSemaforos;

                for (let tipo in aContadores) {
                    aPlaces[tipo] = {};
                    for (let i in aContadores[tipo]) {
                        aPlaces[tipo][aContadores[tipo][i].ameniti] = [];
                        response.aPlaces[tipo].forEach((e) => {
                            if (aContadores[tipo][i].ameniti == e.ameniti) {
                                aPlaces[tipo][aContadores[tipo][i].ameniti].push(e);
                            }
                        });
                    }
                }
            
                mOSM.getMunicipio(aFichaMunicipio.id_osm, (data) => {
                    let aMunicipioAreas = data;
                    aMunicipioAreas[0].aSuperficies = {
                        "km" : convert(data[0].way_area).from('m2').to('km2'),
                        "ha" : convert(data[0].way_area).from('m2').to('ha'),
                        "densidad" : parseInt(aFichaMunicipio.aDatosDemograficos.habitantes / convert(data[0].way_area).from('m2').to('km2'))
                    }

                    res.render("ficha_municipio.hbs", {
                        aPlaces : {
                            aEducacion : aPlaces.aEducacion,
                            aSalud : aPlaces.aSalud,
                            aSeguridad : aPlaces.aSeguridad,
                            aBancario : aPlaces.aBancario,
                            aTurismo : aPlaces.aTurismo,
                            aGob : aPlaces.aGob,
                            aEspacioUrbano : aPlaces.aEspacioUrbano,
                            aTransporteVial : {fuel : aTransporteVial}
                        },
                        aContadores,
                        aFichaMunicipio,
                        aMunicipioAreas,
                        aGreenAreas, aSemaforos
                    });
                });
            });    
        });
    }

    getFichaTurismo(req, res) {
        let codIfam = req.params.codIfam;
        rq({
            uri : config.url_rest.ficha_municipio,
            method : 'POST',
            body : {
                ifam : codIfam
            },
            json : true
        }).then((data) => {

            let aFichaMunicipio = data.aFichaMunicipio;
            mOSM.getMunicipio(aFichaMunicipio.id_osm, (data) =>  {
                let aMunicipioAreas = data;
                aMunicipioAreas[0].aSuperficies = {
                    "km" : convert(data[0].way_area).from('m2').to('km2'),
                    "ha" : convert(data[0].way_area).from('m2').to('ha'),
                    "densidad" : parseInt(aFichaMunicipio.aDatosDemograficos.habitantes / convert(data[0].way_area).from('m2').to('km2'))
                }

                this.mTurismo.getPuntosDeInteres(aFichaMunicipio.id_osm, (data) =>  {
                    let auxTourism = data.aTourism;
                    let auxFood = data.aFoodAndReligion;
                    let aTourism = {};
                    let aFoodAndReligion = {};
    
                    auxTourism.forEach((e) => {
                        if (!aTourism[e.tourism]) 
                            aTourism[e.tourism] = [];
                        
                        aTourism[e.tourism].push(e);
                    });
    
                    auxFood.forEach((e) => {
                        if (!aFoodAndReligion[e.amenity]) 
                            aFoodAndReligion[e.amenity] = [];
                        
                        aFoodAndReligion[e.amenity].push(e);
                    });
                            
                    res.render("ficha_turismo.hbs", {
                        aTourism : aTourism,
                        aFoodAndReligion,
                        aMunicipioAreas
                    });
                });

            });


        });                
    }


    getDataMunicipio(req, res) {
        let ifam = req.params.codIfam;
        const aPlaces = [];

        rq({
            method : "POST",
            uri : config.url_rest.ficha_municipio,
            body : { 
                ifam : ifam
            }, json : true
        }).then ((data) => {
            let aFichaMunicipio = data.aFichaMunicipio;
            mOSM.getPointsByMunicipio(aFichaMunicipio.id_osm, (response) => {
                const aContadores = response.aContadores;
                let aGreenAreas = response.aGreenAreas;
                let aTransporteVial = response.aPlaces.aTransporteVial;
                let aSemaforos = response.aSemaforos;

                for (let tipo in aContadores) {
                    aPlaces[tipo] = {};
                    for (let i in aContadores[tipo]) {
                        aPlaces[tipo][aContadores[tipo][i].ameniti] = [];
                        response.aPlaces[tipo].forEach((e) => {
                            if (aContadores[tipo][i].ameniti == e.ameniti) {
                                aPlaces[tipo][aContadores[tipo][i].ameniti].push(e);
                            }
                        });
                    }
                }
            
                mOSM.getMunicipio(aFichaMunicipio.id_osm, (data) => {
                    let aMunicipioAreas = data;
                    aMunicipioAreas[0].aSuperficies = {
                        "km" : convert(data[0].way_area).from('m2').to('km2'),
                        "ha" : convert(data[0].way_area).from('m2').to('ha'),
                        "densidad" : parseInt(aFichaMunicipio.aDatosDemograficos.habitantes / convert(data[0].way_area).from('m2').to('km2'))
                    }


                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");         
                    
                    res.send({
                        aPlaces : {
                            aEducacion : aPlaces.aEducacion,
                            aSalud : aPlaces.aSalud,
                            aSeguridad : aPlaces.aSeguridad,
                            aBancario : aPlaces.aBancario,
                            aTurismo : aPlaces.aTurismo,
                            aGob : aPlaces.aGob,
                            aEspacioUrbano : aPlaces.aEspacioUrbano,
                            aTransporteVial : {fuel : aTransporteVial}
                        },
                        aContadores,
                        aFichaMunicipio,
                        aMunicipioAreas,
                        aGreenAreas, aSemaforos
                    });

                });
            });    
        });

    }

    getQR (req, res) {
        qrcode.toDataURL(`http://sig-osm.paisdigital.modernizacion.gob.ar/download-municipio/${req.params.codIfam}`)
        .then((d) => {
            res.render("qr.hbs", {qr : d});
        });
    }

    downloadMunicipio (req, res) {
        res.send(
            `Descarga info municipio....`
        );
        res.end();
    
    }

}

module.exports = new OSM(mOSM, mTurismo);
