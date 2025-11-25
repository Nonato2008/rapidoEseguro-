## API REFERENCE

### PRODUTOS

#### GET /clientes

- **Descrição**: Obtém uma lista de clientes
- **Response**: Array de clientes

#### POST /clientes
- **Descrição**: Cria um novo cliente
- **Body**:
```
{
    "nomeProduto": "clienteExemplo",
    "cpfCliente": "00000000000",
    "emailCliente": "exemplo@gmail.com",
    "telefoneCliente": "000000000000",
    "enderecoCliente": "Endereço exemplo"
}
```
- **Response**:
```
{
    "message": "Sua conta foi cadastrada com sucesso!"
}
```

#### PUT /cliente

- **Descrição**: Atualiza um cliente já existente
- **Body**:
```
{
    "nomeProduto": "clienteExemplo",
    "cpfCliente": "00000000000",
    "emailCliente": "exemplo@gmail.com",
    "telefoneCliente": "000000000000",
    "enderecoCliente": "Endereço exemplo"
}
```
- **Response**:
```
{
    "message": "Cliente atualizado com sucesso!"
}
```

#### DELETE /clientes
- **Descrição**: Deleta um cliente já existente
- **Response**: 
```
{
    "mensagem": "Cliente deletado com sucesso!"
}
```

### PEDIDOS

### GET /pedidos

- **Descrição**: Obtém uma lista de pedidos
- **Response**: Array de pedidos

#### POST /pedidos
- **Descrição**: Cria um novo pedido e uma nova entrega
- **Body**:
```
{
	"idCliente": "00000000000000000000000000000000000",
	"dataPedido": "DD/MM/YYYY",
	"tipoEntregaPedido": "exemplo",
	"distanciaPedido": 0000,
	"pesoPedido": 0000,
	"valorBaseKmPedido": 0,
	"valorBaseKgPedido": 0,
	"statusEntrega": "status exemplo"
}
```
- **Response**:
```
{
    "message": "Pedido e Entrega cadastrado com sucesso!"
}
```