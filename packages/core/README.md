<!--suppress HtmlDeprecatedAttribute -->
<div align="center">
    <h1>@conductr/core</h1>
    Main package of the Conductr framework.
    <br/>
    <p>
        <a href="https://discord.gg/tqFMACSSf7"><img src="https://img.shields.io/discord/1077051842615312496?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@conductr/core"><img src="https://img.shields.io/npm/v/@conductr/core.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@conductr/core"><img src="https://img.shields.io/npm/dt/@conductr/core.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/iam10k/conductr/actions"><img src="https://github.com/iam10k/conductr/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
		<a href="https://codecov.io/gh/conductr/core" ><img src="https://codecov.io/gh/iam10k/conductr/branch/main/graph/badge.svg?precision=2" alt="Code coverage" /></a>
	</p>
</div>

---

## Installation

```bash
npm install @conductr/core
yarn install @conductr/core
pnpm install @conductr/core
```

## Example usage
    
    ```ts
    import { Conductr, GenericReceiver } from '@conductr/core';

    new Conductr({
        applicationId: process.env.DISCORD_APPLICATION_ID,
        token: process.env.DISCORD_TOKEN
    })
    .registerCommandAndComponents(COMMANDS)
    .registerCommandAndComponents(COMPONENTS)
    .registerReceiver(new GenericReceiver(handler => {
        discord.on('interactionCreate', handler);
    }));
    // the receiver should be used to proccess the interactions
    // the receiver is designed to take in interactions from 
    // anything such as a http server, message queue, or a discord client
    ```

Additional documentation and examples are in progress...