import * as math from 'mathjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
   })
   
export class Kriging {
  /**
   * Make an array from start to end vaue
   * @param startValue - start value
   * @param stopValue - stop value
   * @param cardinality - split values
   */
  makeArr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + step * i);
    }
    return arr;
  }

  /**
   * Make the double matrux with the filler values
   * @param row - no of rows
   * @param column - no of columns
   * @param fillWith - fill with values
   */
  makeDoubleMatrix(row: number, column: number, fillWith: number) {
    let result = [];
    for (let i = 0; i < row; i++) {
      result.push([]);
      for (let j = 0; j < column; j++) {
        result[i][j] = fillWith;
      }
    }
    return result;
  }

  /**
   * To Find the interpolated matrix
   * @param data - data to be interpolated
   * @param isFillRowWithSameValue - Based on which the values will be filled
   */
  findInterpolation(data: any[], isFillRowWithSameValue: boolean) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (isFillRowWithSameValue) {
          result.push(data[i]);
        } else {
          result.push(data[j]);
        }
      }
    }
    return result;
  }

  /**
   * Generate the color from wavelength
   * @param Wavelength - color from wavelength
   */
  public GetColorFromWaveLength(Wavelength) {
    let Gamma = 1.0;
    let IntensityMax = 255;
    let Blue;
    let Green;
    let Red;
    let Factor;

    if (Wavelength >= 350 && Wavelength <= 439) {
      Red = -(Wavelength - 440) / (440 - 350);
      Green = 0.0;
      Blue = 1.0;
    } else if (Wavelength >= 440 && Wavelength <= 489) {
      Red = 0.0;
      Green = (Wavelength - 440) / (490 - 440);
      Blue = 1.0;
    } else if (Wavelength >= 490 && Wavelength <= 509) {
      Red = 0.0;
      Green = 1.0;
      Blue = -(Wavelength - 510) / (510 - 490);
    } else if (Wavelength >= 510 && Wavelength <= 579) {
      Red = (Wavelength - 510) / (580 - 510);
      Green = 1.0;
      Blue = 0.0;
    } else if (Wavelength >= 580 && Wavelength <= 644) {
      Red = 1.0;
      Green = -(Wavelength - 645) / (645 - 580);
      Blue = 0.0;
    } else if (Wavelength >= 645 && Wavelength <= 780) {
      Red = 1.0;
      Green = 0.0;
      Blue = 0.0;
    } else {
      Red = 0.0;
      Green = 0.0;
      Blue = 0.0;
    }
    if (Wavelength >= 350 && Wavelength <= 419) {
      Factor = 0.3 + (0.7 * (Wavelength - 350)) / (420 - 350);
    } else if (Wavelength >= 420 && Wavelength <= 700) {
      Factor = 1.0;
    } else if (Wavelength >= 701 && Wavelength <= 780) {
      Factor = 0.3 + (0.7 * (780 - Wavelength)) / (780 - 700);
    } else {
      Factor = 0.0;
    }

    const R = this.factorAdjust(Red, Factor, IntensityMax, Gamma);
    const G = this.factorAdjust(Green, Factor, IntensityMax, Gamma);
    const B = this.factorAdjust(Blue, Factor, IntensityMax, Gamma);

    return 'rgb(' + R + ',' + G + ',' + B + ')';
  }

  /**
   * Get the data scale between max and minimum value
   * @param max - Maximum value of the data
   * @param min - Minimum value of the data
   */
  GetScale(max, min) {
    let range = max - min;
    let real = [];
    let divisions = 20;
    for (let i = 0; i <= divisions; i++) {
      real.push(min + (range / divisions) * i);
    }
    let theta;
    let delta;
    let deltaNot;
    let minbase;
    let q;
    let chi;
    let newMin = min;
    let newMax = max;
    // get delta
    delta = newMax - newMin;
    deltaNot = delta / 10;
    theta = Math.floor(Math.log10(deltaNot));
    q = Math.pow(10, Math.log10(deltaNot) - theta);

    if (q <= 2) q = 2;
    else if (q <= 5) q = 5;
    else q = 10;

    chi = Math.pow(10, theta) * q;
    // get the delta base starting point
    minbase = chi * Math.floor(newMin / chi);
    let c = 1;
    let newvalue = minbase + c * chi;
    let minExcursion = (5 * chi) / 8;
    let l = [];
    l.push(newMin);
    while (newvalue <= newMax - minExcursion && newvalue) {
      if (newvalue >= newMin + minExcursion) l.push(newvalue);
      c++;
      newvalue = minbase + c * chi;
    }
    l.push(newMax);
    return l;
  }

  /**
   * Generate wavelength for the no of steps
   * @param steps - No of steps
   */
  public GenerateWavelengthColorMap(steps) {
    let max = 740;
    let min = 350;

    let step = (max - min) / (steps - 1);

    let results = [];
    for (let i = 0; i < steps - 1; i++) {
      results.push(this.GetColorFromWaveLength(min + i * step));
    }
    results.push(this.GetColorFromWaveLength(max));

    return results;
  }

  /**
   * Adjust the factor based on the intensity and gamma values
   * @param Color - color
   * @param Factor - color factor
   * @param IntensityMax - Intensity of the color
   * @param Gamma - Gamma value of the Color
   */
  private factorAdjust(Color, Factor, IntensityMax, Gamma) {
    if (Color == 0.0) {
      return 0;
    } else {
      return Math.round(IntensityMax * Math.pow(Color * Factor, Gamma));
    }
  }

  /**
   * Change circular coordinates to square coordinates
   * @param u - Circular x coordinate
   * @param v - Circular y coordinate
   */
  changeCircleToSquare(u, v) {
    const sqrt2 = Math.sqrt(2);
    const twoSqrt2 = 2 * sqrt2;
    let usq = u * u;
    let vsq = v * v;
    let fu = twoSqrt2 * u;
    let fv = twoSqrt2 * v;
    let x =
      0.5 * Math.sqrt(2 + fu + usq - vsq) - 0.5 * Math.sqrt(2 - fu + usq - vsq);
    let y =
      0.5 * Math.sqrt(2 + fv - usq + vsq) - 0.5 * Math.sqrt(2 - fv - usq + vsq);
    return { x, y };
  }

  /**
   * Compute Double Matrix
   * @param data - Data to be converted to double matrix
   */
  doubleMatrix(data: any[]) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      let temp = [];
      temp.push(data[i]);
      result.push(temp);
    }
    return result;
  }

  /**
   * Inverse of the matrix
   * @param M - Matrix
   */
  matrix_invert(M) {
    // I use Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows

    //if the matrix isn't square: exit (error)
    if (M.length !== M[0].length) {
      return;
    }

    //create the identity matrix (I), and a copy (C) of the original
    let i = 0,
      ii = 0,
      j = 0,
      dim = M.length,
      e = 0,
      t = 0;
    let I = [],
      C = [];
    for (i = 0; i < dim; i += 1) {
      // Create the row
      I[I.length] = [];
      C[C.length] = [];
      for (j = 0; j < dim; j += 1) {
        //if we're on the diagonal, put a 1 (for identity)
        if (i == j) {
          I[i][j] = 1;
        } else {
          I[i][j] = 0;
        }

        // Also, make the copy of the original
        C[i][j] = M[i][j];
      }
    }

    // Perform elementary row operations
    for (i = 0; i < dim; i += 1) {
      // get the element e on the diagonal
      e = C[i][i];

      // if we have a 0 on the diagonal (we'll need to swap with a lower row)
      if (e == 0) {
        //look through every row below the i'th row
        for (ii = i + 1; ii < dim; ii += 1) {
          //if the ii'th row has a non-0 in the i'th col
          if (C[ii][i] != 0) {
            //it would make the diagonal have a non-0 so swap it
            for (j = 0; j < dim; j++) {
              e = C[i][j]; //temp store i'th row
              C[i][j] = C[ii][j]; //replace i'th row by ii'th
              C[ii][j] = e; //repace ii'th by temp
              e = I[i][j]; //temp store i'th row
              I[i][j] = I[ii][j]; //replace i'th row by ii'th
              I[ii][j] = e; //repace ii'th by temp
            }
            //don't bother checking other rows since we've swapped
            break;
          }
        }
        //get the new diagonal
        e = C[i][i];
        //if it's still 0, not invertable (error)
        if (e == 0) {
          return;
        }
      }

      // Scale this row down by e (so we have a 1 on the diagonal)
      for (j = 0; j < dim; j++) {
        C[i][j] = C[i][j] / e; //apply to original matrix
        I[i][j] = I[i][j] / e; //apply to identity
      }

      // Subtract this row (scaled appropriately for each row) from ALL of
      // the other rows so that there will be 0's in this column in the
      // rows above and below this one
      for (ii = 0; ii < dim; ii++) {
        // Only apply to other rows (we want a 1 on the diagonal)
        if (ii == i) {
          continue;
        }

        // We want to change this element to 0
        e = C[ii][i];

        // Subtract (the row above(or below) scaled by e) from (the
        // current row) but start at the i'th column and assume all the
        // stuff left of diagonal is 0 (which it should be if we made this
        // algorithm correctly)
        for (j = 0; j < dim; j++) {
          C[ii][j] -= e * C[i][j]; //apply to original matrix
          I[ii][j] -= e * I[i][j]; //apply to identity
        }
      }
    }

    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
    return I;
  }

  /**
   * Multiply the double matrix with multiplication factor
   * @param data1 - double matrix
   * @param data2 - multiplication factor
   */
  multdoubleMatrix(data1: any[], data2: number): number[][] {
    let result = [];
    data1.map((data, index) => {
      result.push([]);
      data.map((subData, subIndex) => {
        result[index][subIndex] = subData * data2;
      });
    });
    return result;
  }

  /**
   * Calculate the squae root of the double matrix
   * @param data1 - double matrix
   */
  sqrtdoubleMatrix(data1): number[][] {
    let result = [];
    data1.map((data, index) => {
      result.push([]);
      data.map((subData, subIndex) => {
        result[index][subIndex] = math.sqrt(subData);
      });
    });
    return result;
  }

  /**
   * Multiply the mxn and nxk matrix
   * @param data1 data 1 with mxn matrix
   * @param data2 data 2 with nxk matrix
   */
  prodMultiDimensional(data1, data2) {
    let result = [];
    for (let k = 0; k < data1.length; k++) {
      result.push([]);
      for (let i = 0; i < data2[0].length; i++) {
        let temp = 0;
        for (let j = 0; j < data2.length; j++) {
          temp = temp + data1[k][j] * data2[j][i];
        }
        result[k][i] = temp;
      }
    }
    return result;
  }

  /**
   * Convert double matrix to single dimensional array
   * @param data - double matrix
   */
  convertToSingleDimensionalArray(data) {
    let result = [];
    data.map((da) => {
      da.map((subData) => {
        result.push(subData);
      });
    });
    return result;
  }

  /**
   * Subtract the two double matrix
   * @param data1 - data 1 to be subtracted
   * @param data2 - data 2 to be subtracted
   */
  subDoubleMatrix(data1, data2) {
    let result = [];
    data1.map((data, index) => {
      result.push([]);
      data.map((subdata, subIndex) => {
        result[index][subIndex] = subdata - data2[index][subIndex];
      });
    });
    return result;
  }

  /**
   * Add the two double matrix
   * @param data1 - data 1 to be added
   * @param data2 - data 2 to be added
   */
  addDoubleMatrix(data1, data2) {
    let result = [];
    data1.map((data, index) => {
      result.push([]);
      data.map((subData, subIndex) => {
        result[index][subIndex] = subData + data2[index][subIndex];
      });
    });
    return result;
  }

  /**
   * Convert the interpolated matrix to grid matrix
   * @param data Interpolated matrix
   * @param rows Grid rows
   * @param column Grid columns
   */
  convertToGridMatrix(data, rows, column) {
    let result = [];
    let index = 0;
    for (let i = 0; i < rows; i++) {
      result.push([]);
      for (let j = 0; j < column; j++) {
        result[i][j] = data[index].toFixed(10);
        index++;
      }
    }
    return math.transpose(result);
  }

  /**
   * Perform Kriging and generate the interpolated matrix
   * @param xSensor - X Sensor values
   * @param ySensor - Y Sensor values
   * @param xInterp - X interpolated matrix values
   * @param yInterp - Y interpolated matrix values
   */
  constructInterpolatedMatrix(
    xSensor: any[],
    ySensor: any[],
    xInterp: any[],
    yInterp: any[],
    data21
  ) {
    xInterp = this.findInterpolation(xInterp, true);
    yInterp = this.findInterpolation(yInterp, false);
    const ns = xSensor.length;
    const nI = xInterp.length;
    let Q = this.makeDoubleMatrix(ns, ns, 1.0);

    for (let i = 0; i < ns; i++) {
      for (let j = 0; j < i; j++) {
        let xDist = xSensor[i] - xSensor[j];
        let yDist = ySensor[i] - ySensor[j];
        let dist = xDist * xDist + yDist * yDist;
        Q[i][j] = Math.exp((-Math.sqrt(dist) * 5) / 10);
        Q[j][i] = Q[i][j];
      }
    }
    const Qinv = this.matrix_invert(Q);

    let b = [];
    for (let i = 0; i < ns; i++) {
      b.push(math.sum(Qinv[i]));
    }

    const alpha = math.sum(b);

    let matrixOnesNs = this.makeDoubleMatrix(ns, 1, 1.0);
    let matrixOnesNi = this.makeDoubleMatrix(1, nI, 1.0);

    let p1 = math.subtract(
      math.prod(
        math.matrix(matrixOnesNs),
        math.transpose(math.matrix(this.doubleMatrix(xInterp)))
      ),
      math.prod(
        math.matrix(this.doubleMatrix(xSensor)),
        math.matrix(matrixOnesNi)
      )
    );
    p1 = math.dotMultiply(p1, p1);

    let p2 = math.subtract(
      math.prod(
        math.matrix(matrixOnesNs),
        math.transpose(math.matrix(this.doubleMatrix(yInterp)))
      ),
      math.prod(
        math.matrix(this.doubleMatrix(ySensor)),
        math.matrix(matrixOnesNi)
      )
    );
    p2 = math.dotMultiply(p2, p2);

    let p = math.add(p1, p2);
    p = math.exp(
      this.multdoubleMatrix(this.sqrtdoubleMatrix(p.valueOf()), -5 / 10)
    );

    let matrixOnesMinusBP = this.subDoubleMatrix(
      matrixOnesNi,
      this.prodMultiDimensional(math.transpose(this.doubleMatrix(b)), p)
    );

    let cpm1 = this.prodMultiDimensional(
      math.transpose(p),
      math.transpose(Qinv)
    );
    let cpm2sub = this.multdoubleMatrix(
      this.prodMultiDimensional(
        math.transpose(matrixOnesNs),
        math.transpose(Qinv)
      ),
      1 / alpha
    );
    let cpm2 = this.prodMultiDimensional(
      math.transpose(matrixOnesMinusBP),
      cpm2sub
    );

    let InterpolatedMatrix = this.addDoubleMatrix(cpm1, cpm2);

    return this.convertToSingleDimensionalArray(
      this.prodMultiDimensional(InterpolatedMatrix, this.doubleMatrix(data21))
    );
  }
}
