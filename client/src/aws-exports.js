// src/aws-exports.js
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-2_b7ouuqkHr',               // your user pool id
      userPoolClientId: '59lgthmmkjqcda7ektkb54mt2n', // your app client id
      region: 'ap-southeast-2',                    // your region
    },
  },
};

export default awsConfig;
