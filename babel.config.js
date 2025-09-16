// filepath: c:\Users\elias\Desktop\PUMAN\Songfrontation\babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        //plugins: ['nativewind/babel'],
    };
};