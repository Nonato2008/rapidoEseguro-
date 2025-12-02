const express = require("express");
const router =  express.Router();
const {entregaController} = require("../controllers/entregaController")

/**
 * Dfine as rotas relacionadas aos clientes
 * 
 * @module pedidoRoutes
 * 
 * @description
 * - GET  /entregas -> Lista todos as entregas do banco de dados.
 */

// GET /entregas -> Lista todas as entregas
router.get("/entregas", entregaController.listarEntregas)

module.exports = {entregaRoutes: router};