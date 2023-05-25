# Contributing to Massa SC Deployer
Thank you for considering contributing to sc-deployer!

## Reporting Bugs
If you discover a bug, please create a [new issue](https://github.com/massalabs/massa-sc-toolkit/issues/new?assignees=&labels=issue%3Abug&template=bug.md&title=) on our GitHub repository.
In your issue, please include a clear and concise description of the bug, any relevant code snippets, error messages, and steps to reproduce the issue.

## Installation
To start developing with sc-deployer, you must install and build all the necessary dev dependencies. You can do so by running the following commands:

```sh
# Install npm dependencies
npm install

# Build packages
npm run build
```

This will install and build all the required packages listed in the package.json file, allowing you to update, fix, or improve the sc-deployer in any way you see fit. 

## Contributing Code
We welcome contributions in the form of bug fixes, enhancements, and new features.

To contribute code, please follow these steps:

1. Fork the massa-sc-toolkit repository to your own account.
2. Create a new branch from the `main` branch for your changes.
3. Make your changes and commit them to your branch.
4. Push your branch to your fork.
5. Create a pull request from your branch to the develop branch of the massa-sc-toolkit repository.

> **NOTE:** When creating a pull request, please include a clear and concise title and description of your changes, as well as any relevant context or background information.

## Code Style
Please ensure that your code follows the existing code style used in the project.
We use the [MassaLabs Prettier configuration](https://github.com/massalabs/prettier-config-as) and [MassaLabs ESLint configuration](https://github.com/massalabs/eslint-config) for formatting and linting.

You can run the following command to format your code before committing:

```sh
npm run fmt
```

## License
By contributing to sc-deployer, you agree that your contributions will be licensed under the MIT License.
