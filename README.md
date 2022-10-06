# massa-sc-toolkit

## ... use a linter

It doesn't exist specific & well maintained Assemblyscript linter in the ecosystem.

As the Assemblyscript is written in Typescript files, the recommendation is to use a linter for Typescript.

The best maintained remains nowadays ESLint

-   Instal dependencies
    ```
    npm i eslint @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint@latest --save-dev
    ```
-   Create a `.eslintrc.json` file at the project root :

    ```json
    {
    	"env": {
    		"browser": true,
    		"es2022": true
    	},
    	"extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    	"overrides": [],
    	"parser": "@typescript-eslint/parser",
    	"parserOptions": {
    		"ecmaVersion": "latest",
    		"sourceType": "module"
    	},
    	"plugins": ["@typescript-eslint"],
    	"rules": {
    		"linebreak-style": ["error", "unix"],
    		"quotes": ["error", "double"],
    		"semi": ["error", "always"],
    		"@typescript-eslint/no-unnecessary-type-assertion": "off"
    	}
    }
    ```

Keep in mind that a lot of false positives will remains undetected by ESLint such as :
-   Closures
-   Spreads
