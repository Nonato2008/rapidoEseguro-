const express = require("express");
const router = express.Router();
const { pedidoController } = require("../controllers/pedidoController")

/**
 * Define as rotas relacionadas aos pedidos
 * 
 * @module pedidoRoutes
 * 
 * @description
 * - GET  /pedidos -> Lista todos os pedidos do banco de dados
 * - POST /pedidos-> Cria um novo pedido e os seus itens com os dados enviados pelo cliente HTTP, e de acordo com as informações do pedido, cria uma entrega também
 * - DELETE /pedidos -> Deleta um pedido e a entrega deste pedido já criados
 * - PUT /pedidos -> atualiza os dados de um pedido e da entrega do pedido.
 */

// GET /pedidos -> Lista todos os pedidos
router.get("/pedidos", pedidoController.listarPedidos);

// POST /pedidos -> Cria um novo pedido e uma nova entrega
router.post("/pedidos", pedidoController.criarPedido);

// DELETE /pedidos -> Deletar um pedido
router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);

// PUT /pedidos -> Atualizar o pedido e uma entrega
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);

module.exports = { pedidoRoutes: router }