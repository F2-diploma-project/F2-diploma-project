// Сховище налаштувань у тестах — офіційна імітація бібліотеки (дані в пам'яті).
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
