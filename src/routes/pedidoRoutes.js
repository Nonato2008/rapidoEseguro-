const express = require("express");
const router = express.Router();
const { pedidoController } = require("../controllers/pedidoController")

router.get("/pedidos", pedidoController.listarPedidos);

router.post("/pedidos", pedidoController.criarPedido);

router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);

router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);

module.exports = { pedidoRoutes: router }