const express = require("express");
const router =  express.Router();
const {entregaController} = require("../controllers/entregaController")

router.get("/entregas", entregaController.listarEntregas)

module.exports = {entregaRoutes: router};