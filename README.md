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
1. Ensure that you have:
    - ```node``` v16 or above,
    - ```npm``` v7 or above,
    - ```docker``` v20 or above on your machine.
2. Clone the DotSight repository from GitHub.
3. Navigate to the cloned repository and ```npm ci``` to install the necessary dependencies.
4. Specify application secrets:
   - create ```.env``` file in the project root,
   - add a new line in ```.env``` file, ```DB_HOST=dotsight```,
   - add a new line in ```.env``` file, ```DB_PORT=5433```,
   - add a new line in ```.env``` file, specifying any database name, e.g. ```DB_NAME=dotsight```,
   - add a new line in ```.env``` file, specifying any user name, e.g. ```DB_USERNAME=dotsight```,
   - add a new line in ```.env``` file, specifying any database password, e.g. ```DB_PASSWORD=d0tS1gHtRul3z```,
   - add a new line in ```.env``` file, specifying any secret for jwt tokens, e.g. ```JWT_SECRET=secret-jwt```,
   - add a new line in ```.env``` file, specifying any secret for sessions, e.g. ```SESSION_SECRET=some-secret```,
   - add a new line in ```.env``` file, ```UI_HOST=http://localhost:3001```.
5. Start the environment by running ```docker compose up -d```.
    - If you encounter ```Bind for 0.0.0.0:5433 failed: port is already allocated``` error, make sure that there are no apps that use 5433 port.
    - If you encounter some other error, you should cleanup via ```docker compose rm -f``` and start again.
6. Populate the database by running all migrations via ```npm run typeorm:run-migrations```.
7. Initiate the DotSight application by executing ```npm start```. 

## Usage Examples
DotSight enables you to create _data pipelines_ transporting _entities_ from a specified _data source_, enriched with specified _middlewares_, and serialized via specified _mappers_. All are customizable, i.e., you can provide your own data sources and build custom Oracle-like middlewares, mixers, and serialization logic.

Use [DotSight UI](https://github.com/fidi-tech/dotsight-ui) to define data pipelines and query them.

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
- ```historicalMetrics```: Similar to metrics, this component captures multiple metric values over time, each associated with a corresponding timestamp.

### Data Sources
The data source can be any data stream able to provide a complete set of specific ```entity``` data within a given context. Every data source within DotSight inherits the capabilities of the [AbstractDataSource](./src/data-sources/abstract.data-source.ts) class. To accommodate the diversity of entities, DotSight offers abstract classes tailored to each entity type, e.g., [AbstractProtocolDataSource](./src/data-sources/abstract.protocol.data-source.ts)).

In cases where a GraphQL service can deliver multiple entities, it is recommended to create distinct DotSight data sources, each dedicated to a specific entity. 

DotSight's data sources are versatile and capable of abstracting over a wide range of data retrieval methods, including HTTP or GraphQL services. For instance, try leveraging [DappRadar](./src/data-sources/collection/dapp-radar)'s endpoint to see the protocol data at the dApp level data in action.


### Middlewares
In certain scenarios, not all required data can be obtained from a single data source. Consider a blockchain indexer as a data source without any pricing information. Analogous to oracles, middlewares allow augmenting the sourced data with additional off-chain sources.

Each entity within a pipeline progresses through a series of middlewares specified in the pipeline configuration. Middlewares have the power to augment or replace ```metrics``` and ```meta``` fields of the entity.

A good example of middleware is a [Coingecko](./src/middlewares/collection/coingecko/wallet-token-price.middleware.ts) data source, which allows to enrich [WalletToken](./src/entities/wallet-token.entity.ts) with tokens' prices if none were available in the data source.


### Mappers
Mappers, acting as transformative agents, convert arrays of entities acquired from data sources into a serialized data structure, i.e., a _data shape_. 

This structure can be further utilized in other services or seamlessly displayed through compatible DotSight UI widgets. Each mapper in a data pipeline possesses a unique identifier that must be specified when executing the pipeline.

Every mapper extends the capabilities of the [AbstractMapper](./src/mappers/abstract.mapper.ts) class. An exemplary instance is the [Distribution](./src/mappers/collection/distribution/distribution.mapper.ts) mapper, which effectively transforms data into a distribution format.


## API Documentation
For detailed documentation of the API, including available parameters and functionalities, please refer to the OpenAPI Reference and the Swagger UI by visiting ```/swagger```.


## Roadmap & Current Focus

DotSight is under active development.

- Aug 2023 The data sources, middlewares, and mappers logic are all functional. Arbitrary data sources are supported and a collection of default sources is available.
- Nov 2023 DotSight UI Widgets (existing pipelines visualization)
- Q4 2023 DotSight customizable no-code UI 
- Q4 2023 Dockerized Deployment
- Q4 2023 First developer bounties
- Q4 2023 SQL Querying via DotSight UI
- Q1 2024 Extensive library of data sources and UI widgets

## Contributing
We welcome contributions from the developer community to fork, enhance, and improve DotSight. To contribute, please follow these steps:
1. Fork the DotSight repository and create a new branch for your contribution.
2. Make the necessary changes and submit a pull request.
3. Ensure that all continuous integration (CI) checks pass successfully.
4. Ensure that your contribution has sufficient test coverage.
5. Submit your PR and participate in the discussion with the project maintainers.

### Guidelines
This section contains various agreements that make DotSight's codebase performant & readable.
#### DotSight core
##### Database interactions
1. If you are creating a method that queries the database, it can either throw an error when nothing is found, or return null. To make things more predictable, you should name your method ```find*``` if it throws, and ```query*``` if it returns null.
#### DotSight's Data Sources
1. Data source's constructor should always validate it's config and throw ```AbstractDataSource.DataSourceWrongConfig``` if validation failed.
#### DotSight's Mappers
1. Mapper's constructor should always validate it's config and throw ```AbstractMapper.MapperWrongConfig``` if validation failed.

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

