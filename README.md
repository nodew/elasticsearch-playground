# Elasticsearch playground

Elasticsearch playground based on vscode plugin - rest-client, an easy way to access elasticsearch's rich apis.

## Start

1. Clone the project to your local dev machine

```shell
git clone https://github.com/nodew/elasticsearch-playground.git

cd elasticsearch-playground
```

2. Run elasticsearch server in docker

```shell
docker-compose up
```

3. Generate fake data

```shell
node .\scripts\dataGen.js
```

4. Install [rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

5. Play with elasticsearch apis in `/apis` folder.
