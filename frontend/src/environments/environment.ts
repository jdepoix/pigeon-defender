// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  aws: {
    region: 'eu-central-1',
    cognito: {
      userPoolId: 'eu-central-1_qN02z196d',
      appClientId: '3mvs5dprsn31i697ul6usam5sv',
      identifyPoolId: 'eu-central-1:8b6ce127-c6d1-4a84-9300-0162150f0e50'
    }
  }
};
