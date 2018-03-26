
## Contributing

Make sure you run `npm i` command in the project's dir before you begin, it'll install all dev dependencies. You'll also need to init git submodules:

```shell
$ npm i
$ git submodule init
$ git submodule update
```

Currently code coverage is **100%**, so new tests are essential when you add new functionality. There're several npm tasks
which you can find useful:

- `npm test` runs tests
- `npm run lint` runs js linter
- `npm test --coverage` runs code coverage task and generates a report

One pull request per one feature, nothing unusual.

