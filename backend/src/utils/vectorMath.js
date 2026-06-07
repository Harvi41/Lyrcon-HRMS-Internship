/**
 * Calculates the Euclidean Distance between two face embedding vectors.
 * A smaller value indicates a stronger match (0.0 means identical).
 */
exports.getEuclideanDistance = (vectorA, vectorB) => {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length) {
        throw new Error("Vector shapes are mismatched or invalid.");
    }
    
    return Math.sqrt(
        vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0)
    );
};