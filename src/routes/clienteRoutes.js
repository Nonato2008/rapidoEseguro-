const express = require("express");
const router = express.Router();
const {clienteController} = require("../controllers/clienteController");

/**
 * Dfine as rotas relacionadas aos clientes
 * 
 * @module pedidoRoutes
 * 
 * @description
 * - GET  /clientes -> Lista todos os clientes do banco de dados.
 * - POST /clientes-> Cria um novo cliente e os seus itens com os dados enviados pelo cliente HTTP
 * - DELETE /clientes -> Deleta um cliente já cadastrado
 * - PUT /clientes -> atualiza os dados de um cliente
 */

// POST /clientes -> Cria um novo cliente
router.post("/clientes", clienteController.criarCliente);

// GET /clientes -> Lista todos os clientes
router.get("/clientes", clienteController.listarClientes);

// DELETE /clientes -> Deletar o cliente
router: router.delete("/clientes/:idCliente", clienteController.deletarCliente);

// PUT /clientes -> Atualizar cliente
router: router.put("/clientes/:idCliente", clienteController.atualizarCliente)

module.exports = {clienteRoutes: router};
