# fung-sdk
Homepage for all Fung SDKs

## Workflow
1. Create a new package under <root>/packages directory
2. All the packages should contain following scripts in package.json
    * build
    * test
    * lint
    * pre-commit
3. Create a PR to main branch, make sure you don't have any intermittent code change. It might impact release of other packages.
4. Once the changes are merged to the main branch, use following command to bump the version:
```shell
npm run version-bump
```
5. Version bump will create a github tag
6. Create a github release to pubish the package to NPM. Use the tag created in step 5 for the release.