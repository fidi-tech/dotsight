# DotSight: Advanced Analytics for Web3
**DotSight** is an advanced analytics data platform developed by [FiDi](https://fidi.tech). It empowers users to effortlessly construct high-precision data pipelines and seamlessly visualize on-chain data with minimal or no coding required.

Use [DotSight UI](https://github.com/fidi-tech/dotsight-ui) to define data widgets and query them without updating the codebase.

## Contents
* [Quick Start](#quick-start)
* [Testing and Quality Assurance](#testing-and-quality-assurance)
* [License](#license)
* [Contact and Support](#contact-and-support)
* [Acknowledgments](#acknowledgments)


## Quick Start
After cloning the DotSight repository and ensuring you have `node` v18, `npm` v9, and `docker` v20, or above:

```bash
# install all necessary dependencies
npm ci
```
```bash
# populate and review the environment variables
cp .env.example .env 
```
```bash
# start the environment
docker compose up -d 
```
```bash
# populate the database for the first run
npm run typeorm:run-migrations 
```
```bash
# initiate a development instance (authentication disabled)
npm run start:dev

# initiate a production instance (specify authentication tokens in .env)
npm run start
```

## Testing and Quality Assurance
Please make sure your PRs come with sufficient unit test coverage:
1. For any new class logic and functions, you're welcome to add corresponding unit tests under ```.spec.ts```.
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
We would like to express our gratitude to the Web3 Foundation, Parity, Subsquid, and DotSama’s collators community, who all have inspired and contributed to this work and our vision of building a best-in-class analytics data platform for Web3.

