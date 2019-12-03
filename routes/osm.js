const express = require('express');
const router = express.Router();
const cOSM = require("../controllers/osm");

router.get("/get-points/:id", cOSM.getPointsByMunicipio.bind(cOSM));
router.get("/ficha-municipio/:codIfam", cOSM.getFichaMunicipioByIfam.bind(cOSM));
router.get("/ficha-turismo/:codIfam", cOSM.getFichaTurismo.bind(cOSM));
router.get("/data-municipio/:codIfam", cOSM.getDataMunicipio.bind(cOSM));
router.get("/qr/:codIfam", cOSM.getQR.bind(cOSM));
router.get("/download-municipio/:codIfam", cOSM.downloadMunicipio.bind(cOSM));



module.exports = router;