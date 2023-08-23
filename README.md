# Milestone 1
No-UI open-sourced Nest.js app, can be deployed.

Instructions on how to deploy locally are included.

All data pipelines' configs are stored in code via JSON.

Unit tests are written, but no functional tests.

OpenAPI specification is available both via yaml and Swagger UI.

CI checks for types, codestyle & unit tests.

No UI widgets.


Will be ready: **September 3rd, 2023**

## Entities
Each entity comes with metadata and metrics. There is a **mixer** written for each entity.

### Protocol
aka Dapp, with no attachment to specific wallet
#### Metrics
- tvl
- marketCap

### Wallet
Specific wallet, without it's contents
#### Metrics
- netWorth

### WalletToken
Token that belongs to some specific wallet and is either in wallet or some protocol
#### Metrics
- amount
- value

## Datasources
Concrete datasources that are ready to return entities.
### Protocol
- DappRadar
- Static (from config)

### Wallet
- Debank
- Static (from config)

### WalletToken
- Debank wallet (uninvested tokens/coins)
- Debank protocols (invested tokens/coins)

## Middlewares
### Coingecko token pricing
Middleware that allows to receive current price for some coin/token.

## DataShapes
### Distribution
DataShape that can be used in various UI widgets, eg pie chart.
```json
{
    "items": [{
      "id": "1",
      "name": "Astar",
      "value": 10
    }],
    "restItemsValue": 100
}
```

## Mappers
### Distribution
Mapper that can take any entity, group by any meta field (by summing any metric) and return Distribution datashape. 

## Endpoints
### GET /pipelines?mapperIds[]=mapperId1&mapperIds[]=mapperId2
```json
{
    "result": {
        "mapperId1": {
            "items": [{
                "id": "1",
                "name": "Astar",
                "value": 10
            }, {
                "id": "2",
                "name": "Moonbeam",
                "value": 1
            }]
        }
    }
}
```
