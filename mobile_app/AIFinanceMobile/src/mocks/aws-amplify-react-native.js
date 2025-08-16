// Mock for @aws-amplify/react-native to work with Expo
function loadGetRandomValues() {
  // Set up crypto polyfill
  try {
    require('react-native-get-random-values');
  } catch (error) {
    console.warn('react-native-get-random-values not available');
  }
}

function loadAsyncStorage() {
  return require('@react-native-async-storage/async-storage').default;
}

function loadBase64() {
  return {
    encode: (str) => btoa(str),
    decode: (str) => atob(str)
  };
}

module.exports = {
  loadGetRandomValues,
  loadAsyncStorage,
  loadBase64
};
