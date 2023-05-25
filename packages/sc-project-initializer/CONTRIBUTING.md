# Contributing to sc-project-initializer
Thank you for considering contributing to the smart contract project initializer! We welcome contributions from the community and value the time and effort you put into making this project better.

## Reporting Bugs
If you discover a bug, please create a [new issue](https://github.com/massalabs/massa-sc-toolkit/issues/new?assignees=&labels=issue%3Abug&template=bug.md&title=massa-sc-toolkit ) on our GitHub repository.
In your issue, please include a clear and concise title and description of the bug, any relevant code snippets, error messages, and steps to reproduce the issue.

## Installation
To start developing with sc-project-initializer, you must clone the [massa-sc-toolkit repository](https://github.com/massalabs/massa-sc-toolkit) and install all the necessary dev dependencies of sc-project-initializer. You can do so by running the following command:

```sh
cd packages/sc-project-initializer/
```

and then :

```sh
npm install
```

This will install all the required packages listed in the package.json file, allowing you to update, fix, or improve sc-project-initializer in any way you see fit. 

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

You can run the following command at the root of massa-sc-toolkit to format your code before committing:

```sh
npm run fmt
```


## License

By contributing to sc-project-initializer, you agree that your contributions will be licensed under the MIT License.


## Documentation

To ensure the codebase is well-documented, we use ts-doc to comment our functions and modules following a specific pattern. This pattern includes describing the function's purpose, its parameters and return types, and any potential errors it may throw.

In addition, you can find additional information and documentation in the code by looking for @privateRemarks tags. These tags provide extra context and details that may not be immediately obvious from the function's public documentation.

We highly encourage all contributors to take the time to write clear, concise, and comprehensive documentation for any changes or new features they introduce to the codebase. Good documentation makes it easier for others to understand the code and reduces the likelihood of bugs and errors down the line.