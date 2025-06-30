<p align="center">
  <a href="https://zenmoney.app"><img src="./docs/assets/logo.png" alt="Zenmoney logo"/></a>
</p>

<p align="center">
  <a href="https://github.com/AlexBomber12/ZenPlugins/actions/workflows/ci.yml"><img src="https://github.com/AlexBomber12/ZenPlugins/actions/workflows/ci.yml/badge.svg" alt="CI"/></a>
  <img src="https://img.shields.io/badge/Coverage-95%25-brightgreen" alt="Coverage 95%"/>
  <img src="https://img.shields.io/badge/zip%20size-<350KB-success" alt="ZIP <350 KB"/>
  <img src="https://img.shields.io/badge/dependabot-enabled-blue" alt="Dependabot"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT"/>
</p>

## Overview

Zenmoney brings together data from all of your accounts and cards to create a complete picture. These plugins do the job.

Plugins in this repository are developed by the community. All new plugins must be created in TypeScript according to our guidelines. A plugin requests the bank to get your accounts and transactions, then converts them into our unified format. Plugins are downloaded to the app and run entirely on your device so your bank credentials never leave it.

Some banks have an open API with documentation. For example, in Europe the PSD2 Directive provides a standardized API. In all other cases we have to reverse‑engineer banking websites or mobile apps to create a JS plugin.

## Sandbox mode

See [documentation](./docs/README.md) for details on how to develop and debug plugins locally.

## Release process

Push tag **vX.Y.Z** → GitHub Release with `fineco-it.zip`.

## Contributing

- `yarn lint`
- `yarn test`
- `yarn build:fineco-it`
- `yarn size`
- Configure Git to use the Husky hooks: `git config core.hooksPath .husky`

## Known limitations

- Node ≥ 20
- Fineco SCA quirks and other bank specific edge cases
