# DotSight: Advanced Analytics for Web3
**DotSight** is an advanced analytics data platform developed by [FiDi](https://fidi.tech). It empowers users to effortlessly construct high-precision data pipelines and seamlessly visualize on-chain data with minimal or no coding required. DotSight operates under the Apache License.

DotSight operates under the [Apache License](./NOTICE).

## Contents
* [Quick Start](#quick-start)
* [Usage Examples](#usage-examples)
* [Customization](#customization)
    * [Entities](#entities)
    * [Data Sources](#data-sources)
    * [Middlewares](#middlewares)
    * [Mappers](#mappers)
* [API Documentation](#api-documentation)
* [Roadmap & Current Focus](#roadmap--current-focus)
* [Contributing](#contributing)
* [Testing and Quality Assurance](#testing-and-quality-assurance)
* [License](#license)
* [Contact and Support](#contact-and-support)
* [Acknowledgments](#acknowledgments)


## Quick Start
To begin utilizing DotSight, follow these simple steps:
1. Ensure that you have ```Node``` v16 or above and ```npm``` v7 or above on your machine.
2. Clone the DotSight repository from GitHub.
3. Navigate to the cloned repository and ```npm ci``` to install the necessary dependencies.
4. Initiate the DotSight application by executing ```npm start```.
5. [Query](#usage-examples) any default pipeline or build your own.

## Usage Examples
DotSight enables you to create _data pipelines_ transporting _entities_ from a specified _data source_, enriched with specified _middlewares_, and serialized via specified _mappers_. All are customizable, i.e., you can provide your own data sources and build custom Oracle-like middlewares, mixers, and serialization logic.


DotSight is under active development. Follow these steps to make use of it at the current stage.


### Deploying New Pipeline
Update the [pipeline.config.ts](./src/pipelines/services/pipeline/config/pipeline.config.ts) to fit your needs and restart the app. Several pre-defined pipelines have already been added for your reference. You are welcome to mimic their definitions in ```src/pipelines/services/pipeline/config``` and import any configurations into [pipeline.config.ts](./src/pipelines/services/pipeline/config/pipeline.config.ts).

The pipeline definition includes:
- an identifier
- data sources
- mixers
- middlewares
- mappers

### Querying Subsquid Sources
Let's take a look at a pre-defined example in [polkadot.pipeline.config.ts](./src/pipelines/services/pipeline/config/polkadot.pipeline.config.ts) for querying $DOT volumes in a specified wallet via [GiantSquid](https://docs.subsquid.io/giant-squid-api/) data sources, powered by [SubSquid](https://subsquid.io).

To query an active pipeline, send a `GET` request to the corresponding endpoint and specify the wallets you'd like to aggregate as `walletIds`. Customize the query with your host name and a port number your app is  bound to:

```bash
curl "/pipelines/polkadot-coin/execute?mapperIds[]=dot-value-distribution&walletIds[]=12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW"
```

```json
{
  "dot-value-distribution": {
    "items": [
      {
        "id": "12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW-DOT",
        "name": "12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW",
        "value": {
          "usd": 164054859.8981744
        }
      }
    ]
  }
}
```

You can also customize the mapper in use, e.g., `dot-value-distribution`, currencies, and add multiple wallets to query:

```bash
curl "/pipelines/polkadot-coin/execute?mapperIds[]=dot-value-distribution&walletIds[]=16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD&walletIds[]=12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW&currencies[]=eth&currencies[]=usd"
```

```json
{
  "dot-value-distribution": {
    "items": [
      {
        "id": "12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW-polkadot",
        "name": "12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW",
        "value": {
          "eth": 99873.54572933383,
          "usd": 162016119.98081636
        }
      },
      {
        "id": "16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD-polkadot",
        "name": "16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD",
        "value": {
          "eth": 151213.95403760733,
          "usd": 245301175.01310474
        }
      }
    ]
  }
}
```


### Querying Rate-Limited Providers
Let's take a look at a pre-defined DeBank-sourced pipeline in [debank.pipeline.config.ts](./src/pipelines/services/pipeline/config/debank.pipeline.config.ts)  as an illustrative example.

For rate-limited data sources, provide the API key as an environment variable when you launch the app, e.g.,

```bash
DEBANK_API_KEY=key npm start # replace with your credentials from https://cloud.debank.com/
```

To query the wallet-level metrics:
```bash
curl "/pipelines/debank-tokens/execute?mapperIds[]=distribution&walletIds[]=0x293ed38530005620e4b28600f196a97e1125daac&walletIds[]=0x95abda53bc5e9fbbdce34603614018d32ced219e"
```

```json
{
  "distribution": {
    "items": [
      {
        "id": "0x293ed38530005620e4b28600f196a97e1125daac-0x4200000000000000000000000000000000000042",
        "name": "OP",
        "value": {
          "usd": 860.9083526541565
        }
      },
      {
        "id": "0x293ed38530005620e4b28600f196a97e1125daac-0x0000000000000000000000000000000000001010",
        "name": "MATIC",
        "value": {
          "usd": 28.728887952845874
        }
      }
    ]
  }
}
```

## Customization
DotSight provides various configuration options to tailor the data flow according to your specific needs. You can customize:
- Data sources: Choose from a range of available data sources or create your own by extending the abstract data source classes.
- Middlewares: Augment or modify data using middlewares that traverse the pipeline; off-chain and external data sources are supported.
- Mappers: Transform data into serialized structures using mappers.

### Entities
All supported entities are organized in [./entities](./src/entities). Contributors can effortlessly extend the ```Entity``` type to create new entities. Each entity comprises the following components:
- ```id```: A unique identifier employed in mixers to effectively handle entities originating from diverse data sources.
- ```meta```: A set of fields elaborating on the characteristics of the entity, such as the dApp's ```name``` for the [Protocol entity](./src/entities/protocol.entity.ts)).
- ```metrics```:  A key-value structure representing the metrics collected by data sources for a given entity. Examples include a ```netWorth``` for [Wallet entity](./src/entities/wallet.entity.ts).
- ```HistoricalMetrics```: Similar to metrics, this component captures multiple metric values over time, each associated with a corresponding timestamp.

### Data Sources
The data source can be any data stream able to provide a complete set of specific ```entity``` data within a given context. Every data source within DotSight inherits the capabilities of the [AbstractDataSource](./src/data-sources/abstract.data-source.ts) class. To accommodate the diversity of entities, DotSight offers abstract classes tailored to each entity type, e.g., [AbstractProtocolDataSource](./src/data-sources/abstract.protocol.data-source.ts)).

In cases where a GraphQL service can deliver multiple entities, it is recommended to create distinct DotSight data sources, each dedicated to a specific entity. 

DotSight's data sources are versatile and capable of abstracting over a wide range of data retrieval methods, including HTTP or GraphQL services. For instance, try leveraging [DappRadar](./src/data-sources/collection/dapp-radar)'s endpoint to see the protocol data at the dApp level data in action.


### Middlewares
In certain scenarios, not all required data can be obtained from a single data source. Consider a blockchain indexer as a data source without any pricing information. Analogous to oracles, middlewares allow augmenting the sourced data with additional off-chain sources.

Each entity within a pipeline progresses through a series of middlewares specified in the pipeline configuration. Middlewares have the power to augment or replace ```metrics``` and ```meta``` fields of the entity.

A good example of middleware is the [Coingecko](./src/middlewares/collection/coingecko/wallet-token-price.middleware.ts), which allows to enrich [WalletToken](./src/entities/wallet-token.entity.ts) with tokens' prices if none were available in the data source.


### Mappers
Mappers, acting as transformative agents, convert arrays of entities acquired from data sources into a serialized data structure, i.e., a _data shape_. 

This structure can be further utilized in other services or seamlessly displayed through compatible DotSight UI widgets. Each mapper in a data pipeline possesses a unique identifier that must be specified when executing the pipeline.

Every mapper extends the capabilities of the [AbstractMapper](./src/mappers/abstract.mapper.ts) class. An exemplary instance is the [Distribution](./src/mappers/collection/distribution/distribution.mapper.ts) mapper, which effectively transforms data into a distribution format.


## API Documentation
For detailed documentation of the API, including available parameters and functionalities, please refer to the OpenAPI Reference and the Swagger UI by visiting ```/swagger```.


## Roadmap & Current Focus

DotSight is under active development.

- Aug 2023 The data sources, middlewares, and mappers logic are all functional. Arbitrary data sources are supported and a collection of default sources is available.
- Sep 2023 DotSight UI Widgets (existing pipelines visualization)
- Q4 2023 DotSight customizable no-code UI 
- Q4 2023 Dockerized Deployment
- Q4 2023 First developer bounties
- Q4 2023 SQL Querying via DotSight UI
- Q1 2024 Extensive library of data sources and UI widgets

## Contributing
We welcome contributions from the developer community to fork, enhance, and improve DotSight. To contribute, please follow these guidelines:
1. Fork the DotSight repository and create a new branch for your contribution.
2. Make the necessary changes and submit a pull request.
3. Ensure that all continuous integration (CI) checks pass successfully.
4. Ensure that your contribution has sufficient test coverage.
5. Submit your PR and participate in the discussion with the project maintainers.
For more details on the development environment setup and the contribution process, please refer to the Contribution Guidelines.


## Testing and Quality Assurance
Please make sure your PRs come with sufficient unit test coverage:
1. For any new class logic and functions you're welcome to add corresponding unit tests under ```.spec.ts```.
2. Validate that the coverage is sufficient via ```npm run test:cov```


## License
DotSight is released under the Apache License. Please see the license file for more information regarding the terms and conditions of use.


## Contact and Support
For questions, feedback, and support requests, you can us through the following channels:
- Twitter/X: https://twitter.com/cryptofidi
- Discord: https://discord.gg/fhaRzWZa2r
- Email: founders@fidit.tech
- Website: https://fidi.tech


## Acknowledgments
We would like to express our gratitude to the Web3 Foundation, Parity, Subsquid, and DotSama’s collators community who all have inspired and contributed to this work and our vision of building a best-in-class analytics data platform for Web3.

