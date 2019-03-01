/**
 * Lambda Layer that exposes dummy algorithmic functions
 * to pretend this to be a reusable layer that can be included into
 * multiple functions.
 */
exports.textSimilarity = (strA, strB) => {
    return strA === strB? 1 : 0;
};
