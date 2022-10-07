# massa-sc-toolkit

## ... use the simulator

**_The simulator_** (massa-sc-tester https://github.com/massalabs/massa-sc-tester) mimics the behavior at ledger level of the Massa Blockchain.
It can also handle smart contracts deployment & smart contract calls. It means that all storage & coin balances modification are taken into account
.
It provides :

-   A mocked ledger => `ledger.json` :

    -   contains by **_address_** : **_coin balances_** , **_bytecode contents_** and **_datastore_**
    -   can be initialized by any mock
    -   will be modified after execution

-   An execution `.json` ("execution.config.json") file :

    -   Consumed by the `massa-sc-tester.exe`
    -   List all steps to be executed by the simulator (full example at https://github.com/massalabs/massa-sc-tester/blob/main/execution_config.json to know all examples )
    -   Can read & execute `.wasm` smart contracts

-   A `trace.json` file overriden at each execution :

    -   Log smart contract events
    -   Log transaction information

    To run the steps detailed in the `execution_config.json` :

    ```
    $ node simulate.js
    ```
