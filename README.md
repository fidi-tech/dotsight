# DotSight
[FiDi](https://fidi.tech) DotSight is an analytics data platform that helps you to build
data pipelines and visualize their output with little or no coding at all!

DotSight is licensed under [Apache License](./NOTICE).

## Current state
DotSight is under active development.

1. Having working data pipeline executor and couple of data sources; hardcoded pipeline configuration. **(we are here)**
2. Having Dotsight UI widgets that can consume pipelines' outputs.
3. Having UI where user can specify data pipeline from the collections of available data sources, mappers and middlewares.

## Launching
1. Make sure you have those prerequisites in place:
    - node 16,
    - npm 7.
2. Install dependencies with ```npm ci```.
3. Start the app ```DEBANK_API_KEY=... npm start```. As of now, the app has only one hard-coded data pipeline, and
has debank as one of it's data sources. So you need to specify DEBANK_API_KEY.

## Executing pipeline
To get the data from data pipeline, one should make an HTTP request to deployed instance: 

```GET /pipelines/1/execute?mapperIds[]=distribution-1&walletIds[]=0x3deccefd66b34b64b8830b036843c9568504e217```
```json
{
   "distribution-1": {
      "items": [
         {
            "id": "0x0e6580f2f84c8191d36043fb340ad9c0982dde92",
            "name": "BLP",
            "value": {
               "usd": 562294.2815499539
            }
         },
         {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "name": "WGLMR",
            "value": {
               "usd": 1698.702448085819
            }
         }
      ]
   }
}
```

## OpenAPI specification
Once you instance is up, you can visit ```/swagger``` to open Swagger UI. 

## How does DotSight work?
DotSight gives the user an ability to create his own **data pipeline**.
Basic units that travel through each pipeline are called **entities**.
Each pipeline has **data sources** as inputs, and **mappers** as outputs.
**Middlewares** can enrich each entity as it passes through pipeline. 

### Entities 
You can see all supported entities in [./entities](./src/entities) folder.
Contributors can create their own entities by simply extending ```Entity``` type.
Each entity consists of:
- ```id```. Some identifier that is used in mixers to deduplicate entities that come from different data sources.
- ```meta```. Some fields that describe this particular entity (e.g. dapp's ```name``` for the [Protocol entity](./src/entities/protocol.entity.ts)).
- ```metrics```. Key-value storage of different metrics collected by data sources for this entity (e.g. wallet's ```netWorth``` for [Wallet entity](./src/entities/wallet.entity.ts)).
- ```historicalMetrics```. Same as above, but each metric has multiple values, each marked with a timestamp. 

### Data sources
Data source is something that can return a complete set of some entity for give context.

Each data source inherits [AbstractDataSource](./src/data-sources/abstract.data-source.ts) class.
Each data source can only return one type of entities, so for each entity DotSight offers an abstract class (e.g. [AbstractProtocolDataSource](./src/data-sources/abstract.protocol.data-source.ts)).
If, for example, your GraphQL service can return several different entities, you should create several DotSight data sources, one for each entity.

Data source can be pretty much anything, but usually it is an abstraction over either HTTP or GraphQL service.
[DappRadar](./src/data-sources/collection/dapp-radar) is a great example of protocol data source. It returns all the dapps that are available on https://dappradar.com.

### Middlewares
Not every data source carries all the data.
Good example of that would be any blockchain indexer. It has all the blockchain data, but lacks pricing information, because prices aren't usually found on blockchain.
So, how to display both on-chain and of-chain data? That is where middlewares come in.

Each entity goes through every middleware that is specified in the pipeline's configuration. And middleware can add (or replace) both ```metrics``` and ```meta``` fields of the entity.

### Mappers
Mapper is a transformer class, it transforms arrays of different entities gathered from data sources into
**data shape** - some serializable structure that can be used either in other services, or displayed through compatible DotSight UI widgets.
Every mapper in any data pipeline has an unique identifier, which should be specified when executing said pipeline.

Each mapper inherits [AbstractMapper](./src/mappers/abstract.mapper.ts) class.
[Distribution](./src/mappers/collection/distribution/distribution.mapper.ts) is an excellent example of such mapper.

## Contributing
1. Create a pull request.
2. Make sure all CI checks are green.
3. Wait for your PR to be reviewed.
