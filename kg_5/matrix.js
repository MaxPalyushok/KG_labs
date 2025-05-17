/**
 * Matrix operations for affine transformations
 */

const Matrix = {
    // Multiply two matrices
    multiply: function(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    },

    // Create a translation matrix
    translation: function(dx, dy) {
        return [
            [1, 0, dx],
            [0, 1, dy],
            [0, 0, 1]
        ];
    },

    // Create a reflection matrix relative to line Ax + By + C = 0
    reflection: function(A, B, C) {
        // Normalize the line equation
        const denominator = A * A + B * B;
        if (denominator === 0) {
            throw new Error("Invalid line equation: A and B cannot both be zero");
        }
        
        // Normalize coefficients to ensure the reflection works correctly
        // For a line ax + by + c = 0, we need a unit normal vector (a,b)/sqrt(a²+b²)
        const a = A / Math.sqrt(denominator);
        const b = B / Math.sqrt(denominator);
        const c = C / Math.sqrt(denominator);
        
        // Reflection matrix formula:
        // [ 1-2a², -2ab,   -2ac  ]
        // [ -2ab,   1-2b², -2bc  ]
        // [  0,      0,      1   ]
        return [
            [1 - 2 * a * a, -2 * a * b, -2 * a * c],
            [-2 * a * b, 1 - 2 * b * b, -2 * b * c],
            [0, 0, 1]
        ];
    },

    // Convert point coordinates to homogeneous coordinates
    pointToHomogeneous: function(x, y) {
        return [[x], [y], [1]];
    },

    // Convert homogeneous coordinates back to point coordinates
    homogeneousToPoint: function(h) {
        if (h[2][0] === 0) {
            throw new Error("Cannot convert point at infinity");
        }
        return {
            x: h[0][0] / h[2][0],
            y: h[1][0] / h[2][0]
        };
    },

    // Convert a triangle (3 points) to a matrix
    triangleToMatrix: function(triangle) {
        return [
            [triangle[0].x, triangle[1].x, triangle[2].x],
            [triangle[0].y, triangle[1].y, triangle[2].y],
            [1, 1, 1]
        ];
    },

    // Convert matrix back to triangle points
    matrixToTriangle: function(matrix) {
        return [
            { x: matrix[0][0], y: matrix[1][0] },
            { x: matrix[0][1], y: matrix[1][1] },
            { x: matrix[0][2], y: matrix[1][2] }
        ];
    },

    // Utility function to print a matrix (for debugging)
    print: function(matrix) {
        let str = "[";
        for (let i = 0; i < matrix.length; i++) {
            str += "[ ";
            for (let j = 0; j < matrix[i].length; j++) {
                str += matrix[i][j].toFixed(4) + " ";
            }
            str += "]\n ";
        }
        str += "]";
        return str;
    }
};
