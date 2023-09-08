# DotSight: Advanced Analytics for Web3
**[FiDi](https://fidi.tech) DotSight** is an advanced analytics data platform that empowers users to effortlessly construct high-precision data pipelines and seamlessly visualize their on-chain data with minimal or no coding required. DotSight operates under the Apache License.

DotSight operates under the [Apache License](./NOTICE).

## Table of Contents
* Installation and Setup
* Usage and Examples
* API Documentation
* Configuration and Customization
* Contributing
* Testing and Quality Assurance
* License
* Contact and Support
* Acknowledgments



## Quick Start
To begin utilizing DotSight, follow these simple steps:
1. Ensure that you have ```Node``` v16 or above and ```npm``` v7 or above on your machine.
2. Clone the DotSight repository from GitHub.
3. Navigate to the cloned repository and ```run npm ci``` to install the necessary dependencies.
4. Initiate the DotSight application by executing ```npm start```.

## Usage Examples
At the high level, DotSight enables you to create ***data pipelines*** each transferring ***entities*** from a specified ***data source***, enriched with specified ***middlewares***, and materialized via specified ***mappers***. All customizable.


### Pipeline Creation

### Sample Pipeline: Subsquid Sourced

### Sample Pipeline: DeBank Sourced

### Querying a Deployed Pipeline
A simple HTTP request to the deployed instance produces the data. An example of utilizing a fresh endpoint:

```GET /pipelines/polkadot-coin/execute?mapperIds[]=dot-amount-distribution&walletIds[]=16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD&walletIds[]=12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW```
```json
{
   "dot-amount-distribution": {
      "items": [
         {
            "id": "DOT",
            "name": "12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW",
            "value": 39259207.35584479
         },
         {
            "id": "DOT",
            "name": "16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD",
            "value": 58682924.819495305
         }
      ]
   }
}
```

These examples provide a glimpse into the capabilities of DotSight in on-chain data manipulation and outputs visualization.

## Customization
DotSight provides various configuration options to tailor the data flow according to your specific needs. You can customize:
- Data sources: Choose from a range of available data sources or create your own by extending the abstract data source classes.
- Middlewares: Augment or modify data using middlewares that traverse the pipeline; off-chain and external data sources are supported.
- Mappers: Transform data into serialized structures using mappers.

### Entities
All supported entities are organized in [./entities](./src/entities). Contributors can effortlessly extend the ```Entity``` type to create new entities. Each entity comprises the following components:
- ```id```: A unique identifier employed in mixers to effectively handle entities originating from diverse data sources.
- ```meta```: A set of fields elaborating on the characteristics of the entity, such as the dapp's ```name``` for the [Protocol entity](./src/entities/protocol.entity.ts)).
- ```metrics```:  A key-value structure representing the metrics collected by data sources for a given entity. Examples include a ```netWorth``` for [Wallet entity](./src/entities/wallet.entity.ts).
- ```HistoricalMetrics```: Similar to metrics, this component captures multiple metric values over time, each associated with a corresponding timestamp.

### Data Sources
The data source can be any data stream able to provide a complete set of specific ```entity``` data within a given context. Every data source within DotSight inherits the capabilities of the [AbstractDataSource](./src/data-sources/abstract.data-source.ts) class. To accommodate the diversity of entities, DotSight offers abstract classes tailored to each entity type, e.g., [AbstractProtocolDataSource](./src/data-sources/abstract.protocol.data-source.ts)).

In cases where a GraphQL service can deliver multiple entities, it is recommended to create distinct DotSight data sources, each dedicated to a specific entity. 

DotSight's data sources are versatile and capable of abstracting over a wide range of data retrieval methods, including HTTP or GraphQL services. For instance, try leveraging [DappRadar](./src/data-sources/collection/dapp-radar)'s endpoint to see the protocol data at the dApp level in action.


### Middlewares
Middlewares
In certain scenarios, not all required data can be obtained from a single data source. Consider a blockchain indexer as a data source without any pricing information. Analogous to oracles, middlewares allow augmenting the sourced data with additional off-chain sources.

Each entity within a pipeline progresses through a series of middlewares specified in the pipeline configuration. Middlewares have the power to augment or replace ```metrics``` and ```meta``` fields of the entity.

### Mappers
Mappers, acting as transformative agents, convert arrays of entities acquired from data sources into a serialized data structure, i.e., a ***data shape***. 

This structure can be further utilized in other services or seamlessly displayed through compatible DotSight UI widgets. Each mapper in a data pipeline possesses a unique identifier that must be specified when executing the pipeline.

Every mapper extends the capabilities of the [AbstractMapper](./src/mappers/abstract.mapper.ts) class. An exemplary instance is the [Distribution](./src/mappers/collection/distribution/distribution.mapper.ts) mapper, which effectively transforms data into a distribution format.

## API Documentation
DotSight exposes a comprehensive API for developers to leverage its functionalities. Below is a summary of currently available methods:
**DataPipeline**
- ```addDataSource(dataSource)```: Adds a data source to the pipeline.
- ```addMiddleware(middleware)```: Adds a middleware to the pipeline.
- ```addMapper(mapper)```: Adds a mapper to the pipeline.
- ```execute()```: Executes the data pipeline and returns the result.
**Result**
- ```getData(key)```: Retrieves the transformed data from the pipeline result.

For detailed documentation of the API, including available parameters and functionalities, please refer to the API Reference and the Swagger UI by visiting ```/swagger```.

## Roadmap & Current Focus

DotSight is under active development.

- Aug 2023 The data sources, middlewares, and mappers logic are all functional. Arbitrary data sources are supported and a collection of default sources is available.
- Sep 2023 DotSight UI Widgets (existing pipelines visualization)
- Q4 2023 DotSight customizable no-code UI 
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
DotSight emphasizes testing and quality assurance to ensure a reliable and robust analytics platform. To run the tests and maintain the quality of the library:
1. Install the required testing frameworks and tools as specified in the documentation.
2. Execute the test suite using the provided commands.
3. Review the test results and address any failures or issues.
Detailed instructions for setting up testing frameworks and running tests can be found in the Testing Guide.


## License
DotSight is released under the Apache License. Please see the license file for more information regarding the terms and conditions of use.


## Contact and Support
For questions, feedback, and support requests, you can us through the following channels:
- Twitter/X: https://twitter.com/cryptofidi
- Discord: https://discord.gg/fhaRzWZa2r
- Email: founders@fidit.tech
- Website: https://fidi.tech/


## Acknowledgments
We would like to express our gratitude to the Web3 Foundation, Parity, Subsquid, and DotSama’s collators community who all have inspired and contributed to this work and our vision of building a best-in-class analytics data platform for Web3.

