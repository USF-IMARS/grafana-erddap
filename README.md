## ERDDAP Panel for Grafana
![GitHub CI](https://github.com/usf-imars/grafana-erddap/actions/workflows/ci.yml/badge.svg)
<!-- TODO: grafana badge
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/grafana-polystat-panel&label=Marketplace&prefix=v&color=F47A20)
--> 

![screenshot](https://raw.githubusercontent.com/USF-IMARS/grafana-erddap/angular-deprecated/src/img/screenshot-1.png)

This [grafana](https://grafana.com/) plugin connects to an [ERDDAP](https://coastwatch.pfeg.noaa.gov/erddap/information.html) server display gridded timeseries data in a dashboard panel.

## Getting started

deps:

```bash
# mage
sudo apt install golang-go
go install github.com/magefile/mage@latets

# docker & docker compose
# ...

# npm
npm install
```

### Workflow

#### Development
```bash
# Build plugin in development mode and run in watch mode
npm run dev
# Spin up a Grafana instance and run the plugin inside it (using Docker)
npm run server
# The plugin is now available at `http://localhost:3000`.
```

#### Release
```bash
npm version <major|minor|patch>
#npm run build ???
git push origin main --follow-tags
```

Then go to https://grafana.com/orgs/imars/plugins and submit information from the release.

#### Other commands
```bash
# Build plugin in production mode
npm run build

# Run the tests (using Jest)
# Runs the tests and watches for changes, requires git init first
npm run test

# Exits after running all the tests
npm run test:ci

# === Run the E2E tests (using Cypress)
# Spins up a Grafana instance first that we tests against
npm run server
# Starts the tests
npm run e2e

# === Run the linter
npm run lint

# or

npm run lint:fix
```

### Contributing
Contributions are welcome!
Please start by opening an issue to discuss your idea.

# Distributing your plugin

When distributing a Grafana plugin either within the community or privately the plugin must be signed so the Grafana application can verify its authenticity. This can be done with the `@grafana/sign-plugin` package.

_Note: It's not necessary to sign a plugin during development. The docker development environment that is scaffolded with `@grafana/create-plugin` caters for running the plugin without a signature._

## Initial steps

Before signing a plugin please read the Grafana [plugin publishing and signing criteria](https://grafana.com/legal/plugins/#plugin-publishing-and-signing-criteria) documentation carefully.

`@grafana/create-plugin` has added the necessary commands and workflows to make signing and distributing a plugin via the grafana plugins catalog as straightforward as possible.

Before signing a plugin for the first time please consult the Grafana [plugin signature levels](https://grafana.com/legal/plugins/#what-are-the-different-classifications-of-plugins) documentation to understand the differences between the types of signature level.

1. Create a [Grafana Cloud account](https://grafana.com/signup).
2. Make sure that the first part of the plugin ID matches the slug of your Grafana Cloud account.
   - _You can find the plugin ID in the `plugin.json` file inside your plugin directory. For example, if your account slug is `acmecorp`, you need to prefix the plugin ID with `acmecorp-`._
3. Create a Grafana Cloud API key with the `PluginPublisher` role.
4. Keep a record of this API key as it will be required for signing a plugin

## Signing a plugin

### Github actions release workflow

The plugin is using the github actions supplied with `@grafana/create-plugin` so signing a plugin is included out of the box. The release workflow at `github/workflows/release.yml` prepares everything to make submitting your plugin to Grafana easy.
A secret "GRAFANA_API_KEY" is included in the repo settings to enable signing.

#### Push a version tag

To trigger the workflow we need to push a version tag to github. This can be achieved with the following steps:

1. Run `npm version <major|minor|patch>`
2. Run `git push origin main --follow-tags`
3. create the release in the GitHub GUI

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic panel plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/panel-basic#readme)
- [`plugin.json` documentation](https://grafana.com/developers/plugin-tools/reference/plugin-json)
- [How to sign a plugin?](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin)
